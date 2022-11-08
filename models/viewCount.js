import mongoose from "mongoose";

const viewCountSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: Number
})

export default mongoose.model('ViewCount', viewCountSchema);