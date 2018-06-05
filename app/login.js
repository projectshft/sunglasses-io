// Login call
myRouter.post('/api/login', function(request,response) {
    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password) {
      // See if there is a user that has that username and password 
      let user = users.find((user)=>{
        return user.login.username == request.body.username && user.login.password == request.body.password;
      });
      if (user) {
        // Write the header because we know we will be returning successful at this point and that the response will be json
        response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
    
        // We have a successful login, if we already have an existing access token, use that
        let currentAccessToken = accessTokens.find((tokenObject) => {
          return tokenObject.username == user.login.username;
        });
    
        // Update the last updated value so we get another time period
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();
          response.end(JSON.stringify(currentAccessToken.token));
        } else {
          // Create a new token with the user value and a "random" token
          let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }
          accessTokens.push(newAccessToken);
          response.end(JSON.stringify(newAccessToken.token));
        }
      } else {
        // When a login fails, tell the client in a generic way that either the username or password was wrong
        response.writeHead(401, "Invalid username or password");
        response.end();
      }
    } else {
      // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
      response.writeHead(400, "Incorrectly formatted response");
      response.end();
    }
    });


    ...
    if (!failedLoginAttempts[request.body.username]){
      failedLoginAttempts[request.body.username] = 0;
    }
    if (request.body.username && request.body.password && failedLoginAttempts[request.body.username] < 3) {
        let user = users.find((user)=>{
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });
        if (user) {
        // Reset our counter of failed logins
        failedLoginAttempts[request.body.username] = 0;
    ...
    else {
      let numFailedForUser = failedLoginAttempts[request.body.username];
      if (numFailedForUser) {
        failedLoginAttempts[request.body.username]++;
      } else {
        failedLoginAttempts[request.body.username] = 0
      }
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
    ...

    myRouter.get('/api/stores/:storeId/issues', function(request,response) {
        let currentAccessToken = getValidTokenFromRequest(request);
        if (!currentAccessToken) {
          // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
          response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
          response.end();
        } else {
          // Verify that the store exists to know if we should continue processing
          let store = stores.find((store) => {
            return store.id == request.params.storeId;
          });
          if (!store) {
            // If there isn't a store with that id, then return a 404
            response.writeHead(404, "That store cannot be found", CORS_HEADERS);
            response.end();
            return;
          } else {
              response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
              response.end(JSON.stringify(store.issues));
          }
        }
        });