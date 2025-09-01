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

app.engine("ejs", ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

main()
    .then(() => console.log("Connected to DB."))
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.listen(port,() => {
    console.log("APP is listening.")
});

app.get("/", (req, res) => {
    res.send("Hi I am root !");
});

// Index Route
app.get("/listings",async (req, res) => {
    let allListing = await Listing.find({});
    res.render("listings/listing.ejs",{allListing});
})

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

// Read Route
app.get("/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id); 
    res.render("listings/show.ejs",{listing});
})

//Create Route
app.post("/listings", wrapAsync(async(req, res, next) => {
        let newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings");
    
})
)

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit.ejs",{listing});
})

//Update Route
app.put("/listings/:id",async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
})

// Delete Route
app.delete("/listings/:id", async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    res.redirect("/listings");
})

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
    let{statusCode = 404, message = "something went wrong"} = err;
    res.status(statusCode).send(message);
});
