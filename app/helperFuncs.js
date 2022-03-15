const successHandler = (response) =>
  response.writeHead(200, { 'Content-Type': 'application/json' });

module.exports = { successHandler };
