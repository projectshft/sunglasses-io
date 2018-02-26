## Sunglasses.io Server

All calls require a valid API key to be passed in the headers under "x-authentication".

The /api/login call will return an access token in the response body. This token must be included as a query string on all calls involving the cart.

Any call that updates the cart will return the new cart in the response body.

The DELETE call at /api/me/cart/{productId} will delete all instances of the passed productId in the user's cart. If you want to delete a specific quantity of an item in the cart, use the POST call at /api/me/cart/ (see below).

The POST call at /api/me/cart provides a way to increase or decrease the quantity of an item in the cart to a specified number. If the product isn't already in the cart, this call will add it to the cart in the quantity specified.

