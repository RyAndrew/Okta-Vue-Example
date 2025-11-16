const ENV = {
    OKTA_ISSUER: 'https://auth.myapp.com/oauth2/ausakx48dmHwpI9D1697',
    OKTA_CLIENT_ID: '0oaxel75x5wwhmO64697',
    BASE_PATH: '/vue/'
}

export function getOktaConfig() {
    return {
        issuer: ENV.OKTA_ISSUER,
        clientId: ENV.OKTA_CLIENT_ID,
        redirectUri: window.location.origin + ENV.BASE_PATH,
        postLogoutRedirectUri: window.location.origin + ENV.BASE_PATH,
        scopes: ['openid', 'profile', 'email'],
        pkce: true,
        // storageManager: {
        //     token: {
        //         storageType: 'sessionStorage'
        //     }
        // }
    }
}

export function getBasePath() {
    return ENV.BASE_PATH
}
