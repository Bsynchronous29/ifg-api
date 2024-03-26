const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const machineRoutes = require('./routes/machineRoutes');
const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');
const functions = require('firebase-functions');

const app = express();
const port = 8888;

app.use(cors());

// Middleware to ensure JSON responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/user', userRoutes);
app.use('/machine', machineRoutes);
app.use('/project', projectRoutes);
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

exports.api = functions.https.onRequest(app);
