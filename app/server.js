const http = require('http');
const url = require('url');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');

const PORT = 3001;
const myURL = 'https://www.sunglasses.io/products?test=true&another_test=false';
const parsedURL = url.parse(myURL).query;
console.log(parsedURL);

http.createServer(function(request, response) {}).listen(PORT);

// const shoppingCarts = {
//   userId: [
//     {
//       quantity: 1,
//       product: {
//         id: '2',
//         brandId: '1',
//         name: 'Black Sunglasses',
//         description: 'The best glasses in the world',
//         price: 100,
//         imageUrls: [
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
//         ]
//       }
//     },
//     {
//       quantity: 1,
//       product: {
//         id: '1',
//         brandId: '1',
//         name: 'Superglasses',
//         description: 'The best glasses in the world',
//         price: 150,
//         imageUrls: [
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
//         ]
//       }
//     }
//   ]
// };
