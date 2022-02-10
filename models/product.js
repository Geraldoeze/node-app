const fs = require('fs');
const path = require('path');
const pathHelper = require('../util/path');

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    save() {
        const p = path.join(
            pathHelper,
             'data',
              'products.json'
              );
        fs.readFile(p, (err, fileContent) => {
            console.log(fileContent);
        });      
    }

    static fetchAll() {
        return products;
    }
}