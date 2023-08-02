//importing all the packages
//dotenv package simplifies the process of reading environment variables from a .env file and make them available to node.js application
import 'dotenv/config';
import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import mongoose from 'mongoose'
//importing md5 for hashing
import md5 from 'md5';



//creating a app
const app = express();
const port = 3000;
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//creating a connection of mongoose
mongoose.connect("mongodb://127.0.0.1:27017/secretsDB");
//creating the schema
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});



//Creating model for our data base using above created Schema and connecting it to database we have made
const User = new mongoose.model("User", userSchema);

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

//registering the user
app.post("/register", (req,res)=>{
    const email = req.body.username;
    const password = req.body.password;
    const newUser = new User({
        email: email,
        password: md5(password)
    });
    //saving in db
    newUser.save()
    .then((savedUser) => {
        console.log("New user is saved");
        res.render('secrets');
      })
      .catch((err)=>{
          throw err;
      })
});

//checking the user creadential on login page
app.post("/login", (req,res) => {
    User.findOne({email: req.body.username})
    .then((existedUser)=>{
        if (existedUser.password === md5(req.body.password)) {
        console.log("User is found.");
        res.render("secrets");
    }
    })
    .catch ((err)=> {
        throw err;
    })
});


app.listen(port, ()=>{
    console.log(`server is running on ${port}.`)
})