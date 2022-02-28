const crypto = require('crypto');

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'd.gallant650@gmail.com',
    pass: 'D.gallant701'
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
   res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password; 
  User.findOne({ email: email })
    .then(user => { 
      if (!user) {
        req.flash('error', 'Invaild email or password.')
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
           if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');    
          
            });
          }
          req.flash('error', 'Invalid email or password.')
         res.redirect('/login');
        })
        .catch(err => { 
         console.log(err);
         res.redirect('/login');
    })
  });

};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({email: email})
        .then(userDoc => {
            if(userDoc) {
              req.flash('error', 'E-Mail exists already, please pick a different one.')
                return res.redirect('/signup');
            }
            return bcrypt
             .hash(password, 12)
             .then(hashedPassword => {
               const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
            })
            .then(result => {
              res.redirect('/login');
              return transporter.sendMail({
                to: email,
                from: 'node@shopexpress.com',
                subject: 'Signup Completed',
                html: "<h2> You've successfully signed up!! </h2>"  
              });
            })
            .catch(err => {
              console.log(err);
            })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
 
exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err)
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if(!user) {
          req.flash('error', 'No account found')
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExp = Date.now() + 3600000;
        return  user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'node@shopexpress.com',
          subject: 'Password Reset',
          html: `
            <p>You requested password reset</p>
            <p> Click this <a href='http://localhost:3000/reset/${token}">link</a> to set a new password 
          ` 
        })
      })
      .catch(err => {
        console.log(err)
      })
  });
}


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExp: {$gt: Date.now()}})
  .then(user => {
    let message = req.flash('error');
      if (message) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-passord',
        pageTitle: 'New Password',
        errorMessage: message,
        passwordToken: token, 
        userId: user._id.toString()
      })
  })
  .catch(err => console.log(err))
  
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExp: {$gt: Date.now() },
    _id: userId
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExp = undefined;
    return resetUser.save();
  } )
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  })
};