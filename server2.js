const express = require('express');
const app = express();
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'hannah_cline',
  password        : '131450',
  database        : 'products'
});

app.get('/api/brands', (req, res) => {
    pool.query('SELECT * FROM Brand', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        if (error) throw error;
        // results will contain the results of the query
        res.json(results);
        // fields will contain information about the returned results fields (if any)
    });
});

app.get('/api/products', (req, res) => {
    pool.query('SELECT * FROM Product', function (error, results, fields) {
        // error will be an Error if one occurred during the query
        if (error) throw error;
        // results will contain the results of the query
        res.json(results);
        // fields will contain information about the returned results fields (if any)
    });
});

app.get('/api/brands/:id/products', (req, res) => {
    pool.query('SELECT name, brand_id, price, imageURL, description FROM Product WHERE brand_id = ?', [req.params.id], function (error, results, fields) {
        // error will be an Error if one occurred during the query
        if (error) throw error;
        // results will contain the results of the query
        res.json(results);
        // fields will contain information about the returned results fields (if any)
    });
});


app.use((req, res) => {
    res.status(404)
    .send('404 error! Resource not found.');
  });
  
  app.listen(8000);