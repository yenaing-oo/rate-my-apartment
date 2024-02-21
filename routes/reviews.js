const express = require('express');
// apparently, router has separate parameters from the express app. Can override this by "merging" params
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');

const reviews = require('../controllers/reviews');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// the pull method is used to remove elements from an array field in a MongoDB document.
// It allows you to remove one or more values from an array based on specified conditions.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;