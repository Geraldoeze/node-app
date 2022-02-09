const path = require('path');

const express = require('express');

const rootDir = require('../util/path')

const routes = express.Router();
const adminData = require('./admin');

routes.get('/', (req, res, next )=> {
    console.log(adminData.products)
    res.sendFile(path.join(rootDir, 'views', 'shop.html'));
})

module.exports = routes;