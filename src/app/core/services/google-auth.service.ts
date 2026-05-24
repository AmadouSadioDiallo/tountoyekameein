import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const gapi: any;
declare const google: any;

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  readonly googleUser = signal<GoogleUserInfo | null>(null);
  readonly isReady = signal(false);

  private tokenClient: any = null;
  private accessToken: string | null = null;

  async initialize(): Promise<void> {
    await this.loadScript('https://apis.google.com/js/api.js');
    await this.loadScript('https://accounts.google.com/gsi/client');

    await new Promise<void>((resolve) => gapi.load('client', resolve));
    await gapi.client.init({
      apiKey: environment.googleApiKey,
      discoveryDocs: environment.discoveryDocs,
    });

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: environment.googleClientId,
      scope: environment.oauthScopes,
      callback: () => {},
    });

    this.isReady.set(true);
  }

  signIn(): Promise<GoogleUserInfo> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Auth service not initialized'));
        return;
      }
      this.tokenClient.callback = async (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error));
          return;
        }
        this.accessToken = resp.access_token;
        try {
          const userInfo = await this.fetchUserInfo();
          this.googleUser.set(userInfo);
          this.persistToken(resp.access_token, resp.expires_in);
          resolve(userInfo);
        } catch (e) {
          reject(e);
        }
      };
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  signOut(): void {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {});
    }
    this.accessToken = null;
    this.googleUser.set(null);
    sessionStorage.removeItem('gauth_token');
    sessionStorage.removeItem('gauth_expiry');
  }

  async tryRestoreSession(): Promise<boolean> {
    const token = sessionStorage.getItem('gauth_token');
    const expiry = sessionStorage.getItem('gauth_expiry');
    if (!token || !expiry || Date.now() > Number(expiry)) {
      sessionStorage.removeItem('gauth_token');
      sessionStorage.removeItem('gauth_expiry');
      return false;
    }
    this.accessToken = token;
    gapi.client.setToken({ access_token: token });
    try {
      const userInfo = await this.fetchUserInfo();
      this.googleUser.set(userInfo);
      return true;
    } catch {
      this.signOut();
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async fetchUserInfo(): Promise<GoogleUserInfo> {
    const resp = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
    if (!resp.ok) throw new Error('Failed to fetch user info');
    const data = await resp.json();
    return {
      email: data.email,
      name: data.name ?? data.email,
      picture: data.picture ?? '',
    };
  }

  private persistToken(token: string, expiresInSec: number): void {
    sessionStorage.setItem('gauth_token', token);
    sessionStorage.setItem(
      'gauth_expiry',
      String(Date.now() + expiresInSec * 1000),
    );
    gapi.client.setToken({ access_token: token });
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }
}
