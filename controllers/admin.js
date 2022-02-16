const Product = require('../models/product');
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageURL = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageURL, null, req.user._id);
  product.save();
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  // If edit is not added  to  URL param this will run
   if (!editMode) {
     return res.redirect('/');
   }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then( product => {
    if(!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  });
 
};

exports.postEditProducts = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const updatedProduct = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    new ObjectId(prodId)
    );
    updatedProduct.save()
    .then( result => {
      res.redirect('/admin/products');
    });
    
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then( products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};
 

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId)
    .then(() => {
      console.log('DELETED');  
    })
    .catch(err => console.log(err));
  res.redirect('/admin/products')
}
