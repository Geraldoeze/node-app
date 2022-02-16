const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/User');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => {
    console.log(err);
  })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then( product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/product'
    });
  } );
  
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    User.addToCart()
    .then(user => {
      const cartProducts = [];
      for (let item of user) {
         console.log(item)
        // const cartProductData = cart.products.find(prod => prod.id === product.id);
        // if(cartProductData) {
        //   cartProducts.push({productData: product, qty: cartProductData.qty})
      }
     setTimeout( function(){
      res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: cartProducts
      });
    }, 500)
  })
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    return req.user.addToCart(product);
  })
  .then( result => console.log(result))
  res.redirect('/cart')
};

// exports.postCartDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findById(prodId, (product) => {
//       Cart.deleteProduct(prodId, product.price);
//   })
//       res.redirect('/cart') 
// } 

// exports.getOrders = (req, res, next) => {
//   res.render('shop/orders', {
//     path: '/orders', 
//     pageTitle: 'Your Orders'
//   });
// };

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };
