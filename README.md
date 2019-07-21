## Sunglasses.io Server

This project has been created by a student at Project Shift, a software engineering fellowship located in Downtown Durham.  The work in this repository is wholly of the student based on a sample starter project that can be accessed by looking at the repository that this project forks.

If you have any questions about this project or the program in general, visit projectshift.io or email hello@projectshift.io.


GENERAL PLAN
- [X] Create swagger file with required routes
  - [X] Check goalworthy/uber/petstore for authentication examples for cart
  - [X] post api/me/cart/:productId takes a number of items as path parameter
  - [X] Update brands and products endpoints to have 404 errors
  - [X] 401 errors should be 403...
- [ ] Write test for each endpoint
  - [X] /brands get
  - [X] /brands/id/products get
  - [X] /products get
  - [X] /login post
    - [X] Update errors in api to separate 400 and 401
  - [X] /me/cart get
  - [X] /me/cart post
  - [X] /me/cart/id put
  - [ ] /me/cart/id delete
- [ ] Make it work

- [ ] allow logging in with email
- [ ] maybe have post /me/cart add one to quantity if it already exists instead of throwing an error
- [ ] check authentication token timeout
- [ ] track failed logins
- [ ] put /me/cart/id - change 400 error to only handle quantity - having it deal with invalid id lets client know if productid is a product or not, potential security issue