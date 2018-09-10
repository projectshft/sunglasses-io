//get home page

function home(request, response){
    if(request.url==='/'){
        response.writeHead(200, {'Content-type': 'text/plain/n'});
        response.write('Hello welcome to Carolina Sunglasses\n');
        response.write(`Brands are: ${brands}\n`);
        response.end('Thank you for shopping with us. ');
    }

};

// function brands(request, response) {
//   var brandsType =   request.url.replace('/', '');
//   if(brandsType.length > 0){
//     response.writeHead(200, {'Content-type': 'text/plain/n'});
//     response.write(`Brand are: ${brandsType}\n`);
//     response.end('Thank you for shopping with us. ')
//   }
// };


module.exports.home = home;
// module.exports.brands = brands;
