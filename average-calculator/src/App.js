// app.js
const express = require('express');
const axios = require('axios');
const app = express();
const port = 9476;
const windowSize = 10;

let numbers = [];

// Function to fetch numbers from the third-party server
const fetchNumber = async (id) => {
  try {
    const response = await axios.get(`https://api.example.com/numbers/${id}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Failed to fetch numbers for ID ${id}:`, error.message);
    return [];
  }
};

// Function to calculate the average of an array of numbers
const calculateAverage = (nums) => {
  if (nums.length === 0) return '0.00'; // Avoid division by zero
  const sum = nums.reduce((a, b) => a + b, 0);
  return (sum / nums.length).toFixed(2);
};

// Define the route to handle requests
app.get('/numbers/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`Fetching numbers for ID: ${id}`);

  const newNumbers = await fetchNumber(id);
  console.log('Fetched numbers:', newNumbers);

  if (Array.isArray(newNumbers)) {
    // Maintain uniqueness and window size
    newNumbers.forEach(num => {
      if (typeof num === 'number' && !numbers.includes(num)) {
        if (numbers.length >= windowSize) {
          numbers.shift(); // Remove the oldest number if the window is full
        }
        numbers.push(num); // Add the new number to the list
      }
    });

    const windowPrevState = numbers.slice(0, windowSize - newNumbers.length);
    const windowCurrState = [...numbers];
    const avg = calculateAverage(numbers);

    res.json({
      windowPrevState,
      windowCurrState,
      numbers: newNumbers,
      avg
    });
  } else {
    res.status(500).send('Error fetching numbers');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
