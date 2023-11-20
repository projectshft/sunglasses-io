# Sunglasses.io Server

This is an API created for "Sunglasses.io" -- a fictitious sunglasses e-commerce site. The API serves user data, authenticates users (using basic username and password matching, not real cryptography), and serves data on the brands and products that the store sells.

This project was built with TypeScript using test-driven-development (TDD) principles.

## Run Locally

To run this project locally, fork and clone it, then `cd` into the project directory. Run `npm install` to install dependencies and dev dependencies. You can test the server is working by running `npm test`, which should show that 56 tests are passing.

If you're interested in testing the server further and seeing the kind of data it serves, copy the contents of `documentation/swagger.yaml` and paste them in the [Swagger Editor](https://editor.swagger.io/) to view the full API documentation. Start up the server using `npm start` and use [Postman](https://www.postman.com/) to test the different routes on the API, which has the root URL `localhost:3001`.

## Debugging in VS Code

This project is also congfigured for debugging in VS Code. You can utilize the debugger by clicking on the "Run and Debug" button on the left tool column in VS Code and then selecting either "Sunglasses.io" to debug the server or "Run ts-mocha Tests" to debug the tests.
