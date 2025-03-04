const mongoose = require('mongoose');
const dotenv = require('dotenv');
const createApp = require('./app');

dotenv.config();

const PORT = process.env.BACKEND_PORT || 5500;
const app = createApp(PORT);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
