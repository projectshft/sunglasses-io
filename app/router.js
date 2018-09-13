


function brands(request, response) {
  var brandsType =   request.url.replace('/', '');
  if(brandsType.length > 0){

    response.write('Hello World');
    // response.writeHead(200, {'Content-type': 'text/plain/n'});
    // response.write(`Brand are: ${brandsType}\n`);
    // response.end('Thank you for shopping with us. ')
  }
};



module.exports.brands = brands;
