import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
