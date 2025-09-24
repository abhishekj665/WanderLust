const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const {listingSchema, reviewSchema} = require("../schema");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",")
            throw new ExpressError(404, errMsg);
        }else{
            next()
        }
}

// Index Route
router.get("/",wrapAsync(async (req, res) => {
    let allListing = await Listing.find({});
    res.render("listings/listing.ejs",{allListing});
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
})

// Read Route
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews"); 
    res.render("listings/show.ejs",{listing});
}));

//Create Route
router.post("/", validateListing, wrapAsync(async(req, res, next) => {
        
        let newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings");
    
})
)

// Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

// Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    res.redirect("/listings");
}));


module.exports = router;