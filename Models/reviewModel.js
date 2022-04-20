const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be more than 1.0'],
      max: [5, 'Rating cannot be more than 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // Use for calculation of another value (want it to show up whenever there is an output)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound Index where every tour must have a combination of tour and review to be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path : "tour",
  //   select : "name"
  // }).populate({
  //   path : "user",
  //   select : "name photo"
  // })
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  }
};

// Post is used as the reviews have to be saved first before calculating the average
reviewSchema.post('save', function (next) {
  // this calls the current review
  this.constructor.calcAverageRatings(this.tour);
});

// To also allow this function to run on update and delete...
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  // await this.findOne() does not work here as the query has already been executed
  await this.r.constructorcalcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
