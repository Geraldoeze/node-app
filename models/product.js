const fs = require('fs');
const path = require('path');
const pathHelper = require('../util/path');


const p = path.join(
    pathHelper,
     'data',
      'products.json'
      );


const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
}

module.exports = class Product {
    constructor(title, imageURL, description, price) {
        this.title = title;
        this.imageURL = imageURL;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
            })
        });
        
    }

    static fetchAll( cb ) {
        getProductsFromFile(cb)
    }
} 