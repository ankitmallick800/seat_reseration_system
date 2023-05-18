// Function to handle seat reservation
// Function to handle seat reservation
function reserveSeats() {
  const numSeats = parseInt(document.getElementById('numSeats').value, 10);

  // Send a POST request to the server to reserve seats
  fetch('/api/reserve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ numSeats }),
  })
    .then((response) => response.json())
    .then((data) => {
      const { reservedSeats } = data;

      // Reset seat colors to green (available) for all seats
      const seatElements = document.getElementsByClassName('seat');
      for (let i = 0; i < seatElements.length; i++) {
        seatElements[i].classList.remove('reserved');
      }

      // Change the color of reserved seats to red
      if (reservedSeats) {
        reservedSeats.forEach((seatNumber) => {
          const seatElement = document.getElementById(`seat-${seatNumber}`);
          if (seatElement) {
            seatElement.classList.add('reserved');
          }
        });
      }
    })
    .catch((error) => {
      console.error('Error reserving seats:', error);
    });
}


// Fetch seat availability data when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/seats')
    .then((response) => response.json())
    .then((data) => {
      const { seats } = data;

      // Display seat availability status
      const seatsContainer = document.getElementById('seatsContainer');
      seatsContainer.innerHTML = '';

      const seatsPerRow = 7; // Number of seats in each row
      const numRows = 11; // Number of rows with 7 seats
      const lastRowSeats = 3; // Number of seats in the last row

      let seatNumber = 1;

      // Add seats for the first 11 rows
      for (let row = 1; row <= numRows; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'seat-row';

        for (let seat = 1; seat <= seatsPerRow; seat++) {
          const seatElement = createSeatElement(seatNumber, seats.includes(seatNumber));
          rowElement.appendChild(seatElement);
          seatNumber++;
        }

        seatsContainer.appendChild(rowElement);
      }

      // Add seats for the last row
      const lastRowElement = document.createElement('div');
      lastRowElement.className = 'seat-row';

      for (let seat = 1; seat <= lastRowSeats; seat++) {
        const seatElement = createSeatElement(seatNumber, seats.includes(seatNumber));
        lastRowElement.appendChild(seatElement);
        seatNumber++;
      }

      seatsContainer.appendChild(lastRowElement);
    })
    .catch((error) => {
      console.error('Error fetching seat data:', error);
    });
});

// Function to create a seat element
function createSeatElement(seatNumber, isReserved) {
  const seatElement = document.createElement('div');
  seatElement.id = `seat-${seatNumber}`;
  seatElement.className = isReserved ? 'seat reserved' : 'seat available';
  seatElement.textContent = seatNumber;
  return seatElement;
}
