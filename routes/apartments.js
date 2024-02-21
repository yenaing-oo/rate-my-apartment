// Note:
// need to make a separate middleware for checking if apartment exists
// or perform that check as part of validation middleware

const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateApartment} = require('../middleware');
// apartments controller object containing various apartment functions
const apartments = require('../controllers/apartments');

// multer populates request object with info coming back from cloudinary (e.g. url at which image is stored)
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(apartments.index))
    .post(isLoggedIn, upload.array('image'), validateApartment, catchAsync(apartments.createApartment))

// order here matters because if this were below :id route, new would be mistaken for an id
router.get('/new', isLoggedIn, apartments.renderNewForm);

router.route('/:id')
    .get(catchAsync(apartments.showApartment))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateApartment, catchAsync(apartments.updateApartment))
    .delete(isLoggedIn, isAuthor, catchAsync(apartments.deleteApartment))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(apartments.renderEditForm))

module.exports = router;