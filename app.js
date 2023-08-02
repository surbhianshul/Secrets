//importing all the packages
//dotenv package simplifies the process of reading environment variables from a .env file and make them available to node.js application
import 'dotenv/config';
import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import mongoose from 'mongoose'
//import passport
import session from 'express-session'
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';



//creating a app
const app = express();

const port = 3000;
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//initialize session
app.use(session({
    secret: "Our little secret hush",
    resave: false,
    saveUninitialized: false
}));

//initialize passport and use passport to manage our sessions
app.use(passport.initialize());
app.use(passport.session());

//creating a connection of mongoose
mongoose.connect("mongodb://127.0.0.1:27017/secretsDB");

//creating the schema
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

//create a plugin for passportLocalMongoose with userSchema
userSchema.plugin(passportLocalMongoose);

//Creating model for our data base using above created Schema and connecting it to database we have made
const User = new mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//getting the home page
app.get("/", (req,res)=>{
    res.render("home")
});

//getting login route
app.get("/login", (req,res)=>{
    res.render("login")
});

//getting register page
app.get("/register", (req,res)=>{

    res.render("register")
});

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req,res)=>{
    //this method is from passport-local package
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

//registering the user
app.post("/register", (req,res)=>{
    User.register({username: req.body.username}, req.body.password)
    .then((registeredUser)=>{
     passport.authenticate("local")(req,res, ()=>{
         res.redirect("/secrets")
     });
    })
    .catch((err)=>{
     console.log(err);
    })
});

//checking the user creadential on login page
app.post("/login", (req,res) => {
   const user = new User ({
    username: req.body.username,
    password: req.body.password
   });
   //this method comes from passport
   req.login(user, function(err){
if (err){
    console.log(err);
} else {
    passport.authenticate("local")(req,res, ()=>{
        res.redirect("/secrets")
    });
}
   })
});


app.listen(port, ()=>{
    console.log(`server is running on ${port}.`)
})