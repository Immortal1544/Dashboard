import mongoose from 'mongoose';

const seedStateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  completedAt: { type: Date, default: Date.now },
  details: { type: String, default: '' }
}, { timestamps: true });

const SeedState = mongoose.model('SeedState', seedStateSchema);

export default SeedState;
