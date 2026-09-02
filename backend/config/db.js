import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soc_db';
  
  console.log(`[Database] Attempting to connect to: ${mongoURI.startsWith('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    console.warn('[Database] WARNING: Running in MOCK DATABASE mode. Data will be saved in-memory and lost upon server restart.');
    return false;
  }
};

export default connectDB;
