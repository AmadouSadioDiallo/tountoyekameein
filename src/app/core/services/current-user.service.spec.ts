import { TestBed } from '@angular/core/testing';
import { CurrentUserService } from './current-user.service';
import { GoogleAuthService } from './google-auth.service';
import { UsersRepository } from './users.repository';
import { signal } from '@angular/core';

const mockGoogleUser = signal<{ email: string; name: string; picture: string } | null>(null);

const mockGoogleAuth = {
  googleUser: mockGoogleUser,
  signOut: jest.fn(),
};

const mockUsersRepo = {
  findByEmail: jest.fn(),
};

describe('CurrentUserService', () => {
  let service: CurrentUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleUser.set(null);
    TestBed.configureTestingModule({
      providers: [
        CurrentUserService,
        { provide: GoogleAuthService, useValue: mockGoogleAuth },
        { provide: UsersRepository, useValue: mockUsersRepo },
      ],
    });
    service = TestBed.inject(CurrentUserService);
  });

  describe('initial state', () => {
    it('should have null user', () => {
      expect(service.user()).toBeNull();
    });

    it('should not be authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should not be admin', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('resolveCurrentUser', () => {
    it('should return null when no Google user', async () => {
      const result = await service.resolveCurrentUser();

      expect(result).toBeNull();
      expect(service.user()).toBeNull();
    });

    it('should resolve user when Google user and app user exist', async () => {
      mockGoogleUser.set({ email: 'admin@test.com', name: 'Admin', picture: 'pic.jpg' });
      mockUsersRepo.findByEmail.mockResolvedValue({ email: 'admin@test.com', role: 'ADMIN', actif: true });

      const result = await service.resolveCurrentUser();

      expect(result).toEqual({
        email: 'admin@test.com',
        name: 'Admin',
        picture: 'pic.jpg',
        role: 'ADMIN',
      });
      expect(service.user()).toEqual(result);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isAdmin()).toBe(true);
    });

    it('should set isAdmin to false for MEMBER role', async () => {
      mockGoogleUser.set({ email: 'member@test.com', name: 'Member', picture: '' });
      mockUsersRepo.findByEmail.mockResolvedValue({ email: 'member@test.com', role: 'MEMBER', actif: true });

      await service.resolveCurrentUser();

      expect(service.isAdmin()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should throw and sign out when app user not found', async () => {
      mockGoogleUser.set({ email: 'unknown@test.com', name: 'Unknown', picture: '' });
      mockUsersRepo.findByEmail.mockResolvedValue(null);

      await expect(service.resolveCurrentUser()).rejects.toThrow(
        "L'email unknown@test.com n'est pas autorisé",
      );
      expect(mockGoogleAuth.signOut).toHaveBeenCalled();
      expect(service.user()).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should clear user and call googleAuth.signOut', async () => {
      mockGoogleUser.set({ email: 'admin@test.com', name: 'Admin', picture: '' });
      mockUsersRepo.findByEmail.mockResolvedValue({ email: 'admin@test.com', role: 'ADMIN', actif: true });
      await service.resolveCurrentUser();

      service.signOut();

      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(mockGoogleAuth.signOut).toHaveBeenCalled();
    });
  });
});
