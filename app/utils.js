const fs = require('fs');

const initialData = () => {
        let brands, products, users;
        fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
            if (error) throw error;
            brands = JSON.parse(data);
            console.log(`Server setup: ${brands.length} brands loaded`);
          });
          fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
            if (error) throw error;
            users = JSON.parse(data);
            console.log(`Server setup: ${users.length} users loaded`);
          });
          fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
            if (error) throw error;
            products = JSON.parse(data);
            console.log(`Server setup: ${products.length} products loaded`);
            });
            return {
                brands, products, users
            };
        } 


module.exports = {initialData};

