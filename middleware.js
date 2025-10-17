const Listing = require("./models/listing");
const ExpressError = require("./utils/wrapAsync");
const {listingSchema, reviewSchema} = require("./schema");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        } else {
            req.session.redirectUrl = "/listings"; 
        }
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
    
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }else{
        res.locals.redirectUrl = "/listings";
    }
    next()
};

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next()
}

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",")
            throw new ExpressError(404, errMsg);
        }else{
            next()
        }
}

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body, { convert: true }); 
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log("Review validation failed:", errMsg);
        throw new ExpressError(400, errMsg); 
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next()
}
