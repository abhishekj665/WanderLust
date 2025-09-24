const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review.js");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");

// Validate Review Middleware
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body, { convert: true }); 
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log("Review validation failed:", errMsg);
        throw new ExpressError(400, errMsg); 
    } else {
        next();
    }
};



// Add a new review
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");

    let newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    console.log(" New review added!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete a review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    // remove reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // delete actual review
    await Review.findByIdAndDelete(reviewId);

    console.log(`🗑️ Review ${reviewId} deleted from listing ${id}`);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
