import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  quantity: { type: Number, min: 1, default: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Pending'
  },
  paidAmount: { type: Number, min: 0, default: 0 },
  remainingAmount: { type: Number, min: 0, default: 0 },
  orderDate: { type: Date, required: true }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
