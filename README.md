## Sunglasses.io Server Starter

This project is a starter for the Sunglasses.io eval.  

Please paste glasses.yaml into https://editor.swagger.io/#!/.

There are 4 different tags/route
-Brands
-Products
-Login
-Carts

1) Brands route
This is public, anyone with valid API key, could use this to query brands, products, brands specific products, or all products.

2) Products
This is public as well with valid API key, this allows users to query brands specific products, or product name that contains the query (case insensitive)

3) Login
Valid logins will return access token, while invalid returns error code

4) Carts
This is user specific, requires valid token. This allows users to view, add, remove, or update quantity.
Any numbers below 1, will remove the product from the cart

To test the server, type in ```jasmine``` on terminal.
The test doesn't include "database error" test, however the server does return error code when it happens, just couldn't think
of a way to remove data in the middle of server running.