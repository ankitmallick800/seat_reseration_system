// models/Seat.js

const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
