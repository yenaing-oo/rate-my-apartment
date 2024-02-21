const Apartment = require('../models/apartment');

const { cloudinary } = require('../cloudinary');

const mbxClient = require('@mapbox/mapbox-sdk');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const baseClient = mbxClient({ accessToken: process.env.MAPBOX_TOKEN });
const geocoder = mbxGeocoding(baseClient);

const index = async (req, res) => {
    const { sortBy } = req.query;
    let apartments;
    if (sortBy) {
        switch (sortBy) {
            case 'priceAsc':
                apartments = await Apartment.find({}).sort({ rent: 'asc' });
                break;
            case 'priceDesc':
                apartments = await Apartment.find({}).sort({ rent: 'desc' });
                break;
            case 'rating':
                apartments = await Apartment.find({}).sort({ averageRating: 'desc' });
                break;
            case 'reviews':
                apartments = await Apartment.find({}).sort({ numReviews: 'desc' });
                break;
            default:
                break;
        }
    }
    else {
        apartments = await Apartment.find({});
    }
    res.render('apartments/index', { apartments });
}

const renderNewForm = (req, res) => {
    res.render('apartments/new');
}

const showApartment = async (req, res) => {
    const { id } = req.params;

    const apartment = await Apartment.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!apartment) {
        req.flash('error', 'Cannot find that apartment!');
        return res.redirect('/apartments');
    }
    res.render('apartments/show', { apartment: apartment });
};

const createApartment = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.apartment.location,
        limit: 1
    }).send();

    const apartment = new Apartment(req.body.apartment);
    apartment.geometry = geoData.body.features[0].geometry;
    // add the current user's id as the author of the new apartment
    apartment.author = req.user._id;
    // take image information from req.files and create an array containing separate objects with that image info, then set new apartment's
    // images field to that array of objects
    apartment.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await apartment.save();
    req.flash('success', 'Successfully made a new apartment!');
    res.redirect(`/apartments/${apartment._id}`);

}

const renderEditForm = async (req, res) => {
    const apartment = await Apartment.findById(req.params.id);
    res.render('apartments/edit', { apartment });
}

const updateApartment = async (req, res) => {
    const apartment = await Apartment.findByIdAndUpdate(req.params.id, req.body.apartment, { new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    apartment.images.push(...imgs);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await apartment.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    await apartment.save();
    req.flash('success', 'Successfully updated apartment!');
    res.redirect(`/apartments/${apartment._id}`);
}

const deleteApartment = async (req, res) => {
    const apartment = await Apartment.findByIdAndDelete(req.params.id);
    if (apartment.images) {
        for (let file of apartment.images) {
            await cloudinary.uploader.destroy(file.filename);
        }
    }
    req.flash('success', 'Successfully deleted apartment')
    res.redirect('/apartments');
}

module.exports = { index, renderNewForm, createApartment, showApartment, renderEditForm, updateApartment, deleteApartment };