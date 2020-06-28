// Helpers to get/set our number of failed requests per username
const getNumFailedLogins = (username) => {
    let currentNumberOfFailedRequests = failedLoginAttempts[username];
    if (currentNumberOfFailedRequests) {
        return currentNumberOfFailedRequests;
    } else {
        return 0;
    }
}
const setNumFailedLogins = function (username, numFails) {
    failedLoginAttempts[username] = numFails;
}

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Helper method to process access token
const getValidTokenFromRequest = (request) => {
    const parsedUrl = require('url').parse(request.url, true);
    const sentToken = parsedUrl.query.accessToken;

    if (sentToken) {
        // Verify the access token to make sure its valid and not expired
        let currentAccessToken = accessTokens.find((accessToken) => {
            return accessToken.token == sentToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
        });
        if (currentAccessToken) {
            return currentAccessToken;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

//Helper method to find user
const findUser = (currentValidToken) => users.find(user => {
    return user.login.username === currentValidToken.username;
});

modules.export = 
