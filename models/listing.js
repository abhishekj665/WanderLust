const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type : String,
        require : true
    },

    description : String,
    image: {
  url: {
    type: String,
    default: "https://img.freepik.com/premium-photo/3d-rendering-sea-villa-illustration_62754-2445.jpg",
    set: (v) => v === "" ? "https://img.freepik.com/premium-photo/3d-rendering-sea-villa-illustration_62754-2445.jpg" : v
  }
},
    price : {
      type : Number,
      required : true,
      default : 0,
    },
    location : String,
    country : String
})

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;