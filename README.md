# Sunglasses.io Server
## Description
This project is intended to run on a Node.js server to provide an API as a backend for a fictitious website (sunglasses.io) used to shop sunglasses.

To manually access the server, use 'npm install' to get the correct versions of dependencies; and use 'npm run' or use F5 from vscode for debugging.

## Authentication
To authenticate with the API, it initially requires a username and password. A successful login will return a bearer token that can be used for additional requests. There are a few test accounts in './sunglasses-io/data/user.json'.

## Testing
There are automated tests using mocha and chai to help ensure server functionality remains consistent as changes are made. To run the tests, make sure your terminal is in the root folder (sunglasses-io) and run 'npm test'.

## Documentation
Documentation on using the API is made with the Swagger/OpenAPI standard. To view documentation, you can start the server and navigate to http://localhost:3000/api-docs/ or manually view the file at './sunglasses-io/openapi.yaml'.