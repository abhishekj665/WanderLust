const Review = require("../models/review");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const {saveRedirectUrl} = require("../middleware");

module.exports.createReview = async (req, res) => {
    try{
        let listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "Review Added");
    res.redirect(`/listings/${listing._id}`);
    }catch(e) {
        req.flash("error",e);
        res.redirect(res.locals.redirectUrl);
    }
}


module.exports.destroyReview = async (req, res) => {
    try{
    let { id, reviewId } = req.params;

    // remove reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // delete actual review
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
    }catch(e) {
        req.flash("error",e);
        res.redirect(res.locals.redirectUrl);
    }
}