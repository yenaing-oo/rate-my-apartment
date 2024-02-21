const Apartment = require('../models/apartment');
const Review = require('../models/review');

const createReview = async (req, res) => {
    const apartment = await Apartment.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    apartment.reviews.push(review);
    apartment.averageRating = (apartment.averageRating * apartment.numReviews + review.rating) / (apartment.numReviews + 1);
    apartment.numReviews++;
    await review.save();
    await apartment.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/apartments/${apartment._id}`);
}

const deleteReview = async (req, res) => {
    const { id: apartmentId, reviewId } = req.params;
    const apartment = await Apartment.findById(apartmentId);
    const review = await Review.findById(reviewId);

    apartment.averageRating = (apartment.numReviews > 1) ? ((apartment.averageRating * apartment.numReviews - review.rating) / (apartment.numReviews - 1)) : 0;
    apartment.numReviews--;
    apartment.reviews.pull({_id: reviewId});
    await apartment.save();
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/apartments/${apartmentId}`);
}

module.exports = { createReview, deleteReview };