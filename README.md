# Sunglasses.io Server

> This project has been created by a student at Parsity, an online software engineering fellowship. The work in this repository is wholly of the student based on a sample starter project that can be accessed by looking at the repository that this project forks.
>
> If you have any questions about this project or the program in general, visit [Parsity.io](https://www.parsity.io/)

---

<br>
Welcome to the Sunglasses.io Server! This is a Node.js/Express-based backend project that provides a RESTful API for managing sunglasses brands, products, and user carts. The API uses JWT (JSON Web Token) authentication for protected routes, with a token renewal mechanism to extend session validity.

## Project Overview

This API allows users to:

- Retrieve a list of brands and their products.
- Authenticate and manage a personal shopping cart with CRUD operations (create, read, update, delete).
- Test the API interactively via Swagger UI.

## Requirements

- **Node.js**: Version 14.x or higher (install from [nodejs.org](https://nodejs.org/)).
- **npm**: Comes with Node.js (verify with 'npm -v').
- **Git**: For cloning the repository (install from [git-scm.com](http://git-scm.com/)).
- A code editor (e.g., Visual Studio Code) is recommended.

## Getting Started

<br>

<u>**Install dependencies**</u>:

```
npm install
```

- This installs required packages: `express`, `body-parser`, `jsonwebtoken`, `swagger-ui-express`, `yamljs`, and `cors`:

- Ensure the node_modules folder is created and no errors occur during installation.
  <br>
  <br>

<u>**Start the Server**</u>

```
npm start
```

- The API runs on http://localhost:3000.

- Press `Ctrl+C` to stop the server.
  <br>
  <br>

## Testing the API using Swagger UI

<br>

- with server running, open browser and go to http://localhost:3000/api-docs to view interactive API documentation.

<br>

**Non-Protected Routes** (can be accessed without authentication):

- `GET /products`
- `GET /brands`
- `GET /brands/:id/products`

  <br>

**User Login Route** (access to cart and JWT):

- `POST /login`

  - click "Try it out",
  - sample account login is provided:

    ```
    {"username": "yellowleopard753", "password": "jonjon"}
    ```

  - click "Execute".

  - copy the token from the response (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...) to paste into the next request.

  <br>

**Protected Routes** (require valid JWT token to access):

- `GET /me/cart`
- `POST /me/cart`
- `DELETE /me/cart/:productId`
- `PUT /me/cart/:productId`

  <br>

  <u>**To access protected routes:**</u>

  - all protected routes return a new token with an extended expiration (1 hour from request time)
  - click "Try it out"
  - in the "Authorization" box, paste the `token` with `Bearer` prefix
    - token comes from either the initial login or a prior response
    - ensure there is a space between `Bearer`(capital B) and the `token` and do not use quotes.
    - example:
      ```
      Bearer eyJhbGciOiJIUzI...9MiVqLdMrKohxSL4
      ```
  - if necessary, include any required parameters
  - click "Execute"
  - response will include an updated `cart` and a new `token`
  - Repeat process for subsequent requests to maintain a valid session

  <br>

---

### Using Postman

- server should be already running, if not use command:
  ```
    npm start
  ```
- <u>No</u> authentication needed for **non-protected routes**:

  - `GET localhost:3000/products`
  - `GET localhost:3000/brands`
  - `GET localhost:3000/brands/:id/products`

    <br>

**<u>Obtain a Token</u>**:

- Send a `POST` request to `localhost:3000/login`

  - include the following in the body:
    ```
      {"username": "yellowleopard753", "password": "jonjon"}
    ```

- Copy the `token` from the response to authenticate future requests.

  <br>

**<u>Testing Protected Routes</u>** (require valid JWT token to access):

- Valid token must be provided to access these routes:

  - `GET localhost:3000/me/cart`
  - `POST localhost:3000/me/cart`
  - `DELETE localhost:3000/me/cart/:productId`
  - `PUT localhost:3000/me/cart/:productId`

  <br>

- **Example** - create new `POST /me/cart` request which adds item to user's cart:

  - select POST
  - enter `localhost:3000/me/cart` into the text box
  - in "Authorization" tab, under "Auth Type" drowdown, select "Bearer Token"
  - paste the `token` into the "Token" textbox
  - if necessary, add any required parameters
    - for `POST /me/cart` request, paste the following into req.body:
      ```
        {"productId": "1", "quantity": 10}
      ```
  - the response will include the updated `cart` and a new `token`.

  <br>

## Token Management Notes

- The API uses a sliding expiration model: the token’s expiration is extended by 1 hour with each protected route request, and a new token is returned in the response.
- The initial token remains valid until its original 1-hour expiration, which is why you may not need to update it immediately in Postman or Swagger UI during short testing sessions.
  <br>
  <br>

**Important**: When using a frontend, the client must manage and use the new token from each response to ensure continuous validity. Failure to update the token after its expiration will result in a 401 Unauthorized error.
