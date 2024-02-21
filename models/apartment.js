const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

ImageSchema.virtual('cardImage').get(function() {
    return this.url.replace('/upload', '/upload/ar_5:3,c_crop'); 
})

// to be passed to apartment schema so that virtual properties are also included when converting obj to JSON string
const opts = { toJSON: { virtuals: true } };

const ApartmentSchema = new Schema({
    title: String,
    // storing multiple images
    images: [ImageSchema],
    rent: Number,
    averageRating: {type: Number, default: 0},
    numReviews: {type: Number, default: 0},
    description: String,
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

ApartmentSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/apartments/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,30)}...</p>`; 
})

ApartmentSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews    
            }
        })
    }
})

// compile the schema into a model and export it
module.exports = mongoose.model('Apartment', ApartmentSchema);

