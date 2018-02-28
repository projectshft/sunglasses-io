**Sunglasses.io Server API**
----

* **URL**

  /api

* **Method:**
  
  Methods available

  `GET` | `POST` | `DELETE`
  
*  **URL Params**

  * GET /api/brands

    **Required:**
 
    `product=[string]`

    **Optional:**
 
    `limit=[integer]`

  * GET /api/brands/:id/products
    
  * GET /api/products

    **Optional:**
 
    `limit=[integer]`
  * POST /api/login
    **Required:**
 
    `username=[string]`
    `password=[string]`
  * GET /api/me/cart
  * POST /api/me/cart
  * DELETE /api/me/cart/:productId
  * POST /api/me/cart/:productId

* **Sample Call:**

  /api/brands/:categoryId/products

* **Notes:**

  <_This is where all uncertainties, commentary, discussion etc. can go. I recommend timestamping and identifying oneself when leaving comments here._> 
