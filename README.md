# Sunglasses.io Server

This project is an API for an e-commerce store selling sunglasses.

## Routes

The following routes are supported by this API

```
GET /brands
GET /brands/:id/products
GET /products
POST /login
GET /me/cart
DELETE /me/cart/:productId
POST /me/cart/:productId
```

Documentation for each route can be found in the swagger.yaml file

## Getting Started

### Prerequisites

- Node.js (version 14 or above)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/acl13/sunglasses-io.git
   cd sunglasses-io
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Testing

```bash
 npm test
```

This project has been created by a student at Parsity, an online software engineering course. The work in this repository is wholly of the student based on a sample starter project that can be accessed by looking at the repository that this project forks.

If you have any questions about this project or the program in general, visit [parsity.io](https://parsity.io/) or email hello@parsity.io.
