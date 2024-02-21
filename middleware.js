const Apartment = require('./models/apartment');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const {apartmentSchema, reviewSchema} = require('./schemas')

// internally checks if the user's session contains an authenticated user.
const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // save url of page that requires login before redirecting to login page
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login');
    }
    next();
}

// middleware function to be called before authenticate (before session is wiped) to save url of last page visted 
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const apartment = await Apartment.findById(id);

    if(!apartment) {
        req.flash('error', 'Cannot find that apartment!');
        return res.redirect('/apartments');
    }

    if(!apartment.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/apartments/${id}`);
    }
    next();
}

const isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);

    if(!review) {
        req.flash('error', 'Review does not exist');
        return res.redirect('/apartments');
    }

    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/apartments/${id}`);
    }
    next();
}

// custom middleware to validate body of request from form submission
const validateApartment = (req, res, next) => {
    const {error} = apartmentSchema.validate(req.body);
    if(error) {
        // validateArr object contains an array named details containing objects with the parameter message (a string)
        // we need to join these using map(which performs a function on every element in an array and returns a new array)
        const msg = error.details.map(i => i.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(i => i.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports = {isLoggedIn, storeReturnTo, isAuthor, validateApartment, validateReview, isReviewAuthor};