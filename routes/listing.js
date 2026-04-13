const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../utils/middleware.js")
const listingcontroller=require("../controller/listing.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cloudinary = require("../cloudConfig");

router.route("/")
.get( wrapAsync(listingcontroller.index))
.post( isLoggedIn, upload.single('listing[image]'),validateListing, wrapAsync(listingcontroller.createListing))

//New Route 
router.get("/new", isLoggedIn,listingcontroller.renderNewForm)

router.route("/:id")
.get( wrapAsync(listingcontroller.showListing))
.put(isLoggedIn, isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingcontroller.updateListing))
.delete( isLoggedIn,wrapAsync(listingcontroller.deleteListing));



//Edit Route
router.get("/:id/edit", wrapAsync(listingcontroller.editListing));
module.exports=router;