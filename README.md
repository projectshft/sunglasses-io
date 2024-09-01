## Sunglasses.io

This project was created by Mutsumi Hata, a student at Parsity, an online software engineering program. The work in this repository is wholly of the student based on a sample starter project that can be accessed by looking at the original repository from which this project forks.

If you have any questions about this project or the program in general, visit [parsity.io](https://parsity.io/) or email hello@parsity.io.

### Project Description

This simple Express application is a mockup of an online Sunglass store. This is my first backend API project defining routes and APIs. I used Swagger Editor to create a yaml file to document the routes.

### Table of Contents

- Sunglasses.io
  - app
    - server.js
  - initial-data
    - braands.json
    - products.json
    - users.json
  - test
    -server.test.js
  - package.json
  - README.md
  - SunglassesWireframe.png
  - swagger.yaml

### How to Run Application

1. Open terminal
2. Locate file: sunglasses-io
3. Type: npm start dev
4. Type: open http://localhost:3000 (or other appropriate host)

### Things to Add/Edit

1.SORT /products by alphabetical order 2.

3. SORT /users by alphabetical order
4. GET /{wrong user name} should not return "error: invalid token". Should return "error: user not found"
5. POST /{wrong user name} should not return "error: invalid token". Should return "error: user not found"
6. DELETE /{wrong user name} should be return "You should be adding to the cart". Should return "You should login first"
7. TESTING. ALL OF IT.
8. TEST error handling
9. ERROR codes should be consistently used.
