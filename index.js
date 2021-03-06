const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorController = require('./controllers/error');
const User = require('./models/user');

console.log(process.env.NODE_ENV);

const MONGODB_URI = 
 `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@node-cluster.uktzq.mongodb.net/${process.env.MONGO_DEFAULT_DATADASE}?retryWrites=true&w=majority`;

const URI = 'mongodb://127.0.0.1:27017/node-app'

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
}); 

const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename:(req, file, cb) => {
    cb(null, file.filename + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if ( 
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg'){
  cb(null, true);
  } else {
  cb(null, false);
  }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
    { flags: 'a'}
  ) 

app.use(helmet());
app.use(compression());
app.use(morgan("combined", {stream:accessLogStream} ));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
       throw new Error(err)
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)

app.use(errorController.get404);

// Express has a special kind of middleware
app.use((error, req, res, next) => {
  res.redirect('/500');
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('Connected')
    // https.createServer({key: privateKey, cert: certificate} , app)
    app.listen(process.env.PORT || 3500);
  })
  .catch(err => {
    console.log(err);
  })

