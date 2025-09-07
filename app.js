import express from 'express';
import expressSession from 'express-session';
import MySQLStorePkg  from 'express-mysql-session';
import pool from './models/db.js';

import signupRouter from './router/signup.js';
import loginRouter from './router/login.js';
import shopRouter from './router/shop.js'
import productsRouter from './router/products.js';
import productViewRouter from './router/product-view.js';
import cartRouter from './router/cart.js';
import billingRouter from './router/billing.js';
import orderRouter from './router/order.js';
import profileRouter from './router/profile.js';
import contactRouter from './router/contact.js'
import newsLetterRouter from './router/newsletter.js';
import deleteRouter from './router/delet-account.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json()); 

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

const MySQLStore = MySQLStorePkg(expressSession);

const sessionStore = new MySQLStore({}, pool);
  
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false,/* process.env.NODE_ENV === 'production', */
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
}));


const checkUserSession = (req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    if (res.locals.isLoggedIn) {
      res.locals.userName = req.session.userName;
      res.locals.userEmail = req.session.userEmail;
    } else {
      res.locals.userName = null;
    }
    next();
  };
  
app.use(checkUserSession);

  app.set('view cache', false);

app.get("/", (req, res)=>{
    res.render('home_page');
});

app.use('/signup', signupRouter);

app.use("/cart", cartRouter);

app.use('/login', loginRouter);

app.use('/shop', shopRouter);

app.use("/products", productsRouter);

app.use("/product-view", productViewRouter);

app.use("/billing", billingRouter);

app.use("/order", orderRouter);

app.use("/profile", profileRouter);

app.use("/contact", contactRouter);

app.get("/about", (req, res)=>{
    res.render('about', {showSearch: false});
});

app.get("/user-not-found", (req, res)=>{
  res.render("user-not-found");
})

app.get("/seller", (req, res)=>{
  res.render("seller", {showSearch: false});
});

app.get("/faq", (req, res)=>{
  res.render("faq", {showSearch: false});
});

app.get("/terms-and-conditions", (req, res)=>{
  res.render("terms-and-conditions");
});

app.use("/newsletter", newsLetterRouter);

app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/"); 
  });
});

app.get('/privacy', (req, res) => {
  res.render('privacy', {showSearch: false});
});

app.use("/delet-account", deleteRouter);



app.listen(port, ()=>{
    console.log("Running on the port 3000")
});