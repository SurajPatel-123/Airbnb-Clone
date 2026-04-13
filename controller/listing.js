const Listing = require("../models/listing");
const cloudinary = require("../config/cloudinary"); // ensure this exists

// ================= INDEX =================
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// ================= NEW FORM =================
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// ================= SHOW LISTING =================
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    return res.render("listings/show.ejs", { listing });
};

// ================= CREATE LISTING =================
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // upload image safely
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);

        newListing.image = {
            url: result.secure_url,
            filename: result.public_id,
        };
    }

    await newListing.save();

    req.flash("success", "New Listing Created");
    return res.redirect("/listings");
};

// ================= EDIT FORM =================
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl,
    });
};

// ================= UPDATE LISTING =================
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);

        listing.image = {
            url: result.secure_url,
            filename: result.public_id,
        };

        await listing.save();
    }

    req.flash("success", "Listing Updated");
    return res.redirect(`/listings/${id}`);
};

// ================= DELETE LISTING =================
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted");
    return res.redirect("/listings");
};