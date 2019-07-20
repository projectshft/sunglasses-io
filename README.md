## Sunglasses.io Server

This project has been created by a student at Project Shift, a software engineering fellowship located in Downtown Durham.  The work in this repository is wholly of the student based on a sample starter project that can be accessed by looking at the repository that this project forks.

If you have any questions about this project or the program in general, visit projectshift.io or email hello@projectshift.io.


GENERAL PLAN
- [X] Create swagger file with required routes
  - [X] Check goalworthy/uber/petstore for authentication examples for cart
  - [X] post api/me/cart/:productId takes a number of items as path parameter
  - [X] Update brands and products endpoints to have 404 errors
  - [ ] 401 errors should be 403...
- [ ] Write test for each endpoint
  - [X] /brands get
  - [X] /brands/id/products get
  - [X] /products get
  - [X] /login post
    - [X] Update errors in api to separate 400 and 401
  - [ ] /me/cart get
  - [ ] /me/cart post
  - [ ] /me/cart/id put
  - [ ] /me/cart/id delete
- [ ] Make it work