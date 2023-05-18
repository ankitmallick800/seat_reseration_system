const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Seat = require('./models/Seat');

const app = express();
const PORT = 3000;
const MONGODB_URI = 'mongodb+srv://ankitmallick454:admin@cluster0.r1zyh1r.mongodb.net/';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middleware
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch seat availability data
app.get('/api/seats', async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json({ seats });
  } catch (error) {
    console.error('Error fetching seat data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to handle seat reservation
// Route to handle seat reservation
// Route to handle seat reservation
app.post('/api/reserve', async (req, res) => {
  try {
    const numSeats = parseInt(req.body.numSeats, 10);
    const allSeats = await Seat.find();
    const reservedSeats = [];

    // Find available seats in the same row
    for (const seat of allSeats) {
      if (reservedSeats.length >= numSeats) break; // Exit loop if desired number of seats is reserved

      if (!seat.isBooked && !reservedSeats.includes(seat.seatNumber)) {
        const rowSeats = allSeats.filter((s) => s.row === seat.row && !reservedSeats.includes(s.seatNumber));
        if (rowSeats.length >= numSeats) {
          reservedSeats.push(...rowSeats.slice(0, numSeats).map((s) => s.seatNumber));
          break; // Exit loop if desired number of seats is reserved in the same row
        }
      }
    }

    // If desired number of seats is not available in the same row, book nearby seats
    if (reservedSeats.length < numSeats) {
      const nearbySeats = allSeats
        .filter((seat) => !reservedSeats.includes(seat.seatNumber))
        .sort((a, b) => Math.abs(a.row - b.row) + Math.abs(a.seatNumber - b.seatNumber)); // Sort seats by row and seat number distance
      reservedSeats.push(...nearbySeats.slice(0, numSeats - reservedSeats.length).map((s) => s.seatNumber));
    }

    // If seats are not available, return an error
    if (reservedSeats.length < numSeats) {
      return res.status(400).json({ error: 'Not enough available seats' });
    }

    // Update the booked seats in the database
    await Seat.updateMany({ seatNumber: { $in: reservedSeats } }, { isBooked: true });

    const availableCount = allSeats.filter((seat) => !reservedSeats.includes(seat.seatNumber) && !seat.isBooked).length;

    res.json({ reservedSeats, availableSeats: availableCount });
  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


