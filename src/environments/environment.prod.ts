export const environment = {
    production: true,
    googleClientId: '810151125819-5te3771tlv9ihcbpjb4ojhk0jiv3joiq.apps.googleusercontent.com',
    googleApiKey: 'AIzaSyC_TF1-INGi59CQgF355GOvJMza-bArJJ4',
    spreadsheetId: '1RVsH070ROZDvBnr8ul1fc0BsFW7BmQMhw79O0635zA0',

    oauthScopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    discoveryDocs: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
    ],
    sheets: {
        persons: 'Persons',
        cotisations: 'Cotisations',
        comptesRendus: 'ComptesRendus',
        projets: 'Projets',
        users: 'Users',
        historique: 'Historique',
    },
};
