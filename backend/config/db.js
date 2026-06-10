const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/social';
  
  try {
    console.log(`Attempting to connect to MongoDB at: ${dbUri}`);
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const isLocal = dbUri.includes('localhost') || dbUri.includes('127.0.0.1');
    if (isLocal) {
      console.warn(`Local MongoDB connection failed: ${error.message}`);
      console.log('Starting automated local In-Memory MongoDB Server fallback...');
      try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        console.log(`In-Memory MongoDB Server started successfully at: ${mongoUri}`);
        
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      } catch (memError) {
        console.error(`Failed to start In-Memory MongoDB: ${memError.message}`);
        process.exit(1);
      }
    } else {
      console.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
