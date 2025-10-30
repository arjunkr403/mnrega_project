import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();

const dbConnect = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('MONGODB connected'))
    .catch(err => {
      console.log('MongoDB error', err);
      process.exit(1);
    });
};

export default dbConnect;