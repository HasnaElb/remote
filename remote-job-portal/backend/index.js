require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');


const app = express();


//Log the Mongo URI to check if it's loaded correctly
console.log('Mongo URI:', process.env.MONGO_URI);

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => {
	console.log('Server running on port 5000');
});
