import mongoose from 'mongoose'

const districtSchema = new mongoose.Schema({
    district: {
        type: String,
        required: true,
        unique: true,
    },

    performance: Object,

    lastUpdated:{
        type: Date, 
        default: Date.now
    }
});

export default mongoose.model('District', districtSchema);