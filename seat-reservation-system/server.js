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
app.post('/api/reserve', async (req, res) => {
  try {
    const numSeats = parseInt(req.body.numSeats, 10);
    const availableSeats = await Seat.find({ isBooked: false }).limit(numSeats);

    if (availableSeats.length < numSeats) {
      return res.status(400).json({ error: 'Not enough available seats' });
    }

    const reservedSeats = [];

    for (const seat of availableSeats) {
      seat.isBooked = true;
      await seat.save();
      reservedSeats.push(seat.seatNumber);
    }

    res.json({ reservedSeats });
  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

