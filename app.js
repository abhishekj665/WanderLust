if(process.env.NODE_ENV != "production" ){
    require("dotenv").config()
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const joi = require("joi");
const {listingSchema, reviewSchema} = require("./schema");
const { validateHeaderName } = require("http");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbURL = process.env.ATLAS_URL;

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24 * 3600,
});

store.on("error", () => {
    console.log("Error in MongoDb Session Store", err)
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
}


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



app.engine("ejs", ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

// const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";



main()
    .then(() => console.log("Connected to DB."))
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}



app.listen(port,() => {
    console.log("APP is listening.")
});



app.get("/", (req, res) => {
    res.redirect("/listings");
});



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email : "student@gmail.com",
        username : "delta-student"
    });

    let registeredUser = await User.register(fakeUser, "helloworld");
    console.log(registeredUser);
})

app.use("/listings",listingsRouter);

app.use("/listings/:id/reviews", reviewsRouter);  

app.use("/", userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
    let{statusCode = 404, message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});
