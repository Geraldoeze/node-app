const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/User')

const MONGODB_URI = "mongodb+srv://gerald:GZ3r0pV0toPBWmCV@node-cluster.uktzq.mongodb.net/shop";

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
}) 

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
        session({
            secret: 'my secret',
            resave: false,
            saveUninitialized: false,
            store: store 
        })
    );

app.use((req, res, next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
    User.findById("620d24db76a055c8f590cf6b")
    .then(user => {
        req.user = new User(user.name, user.email, user.cart, user._id); 
        next();
    })
    .catch(err => console.log(err));
} )

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoConnect( () => {
    app.listen(3500);
    console.log("Server running")
})