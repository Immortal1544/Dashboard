import mongoose from 'mongoose';

export const PRODUCT_UNITS = ['kg', 'box', 'packet', 'litre', 'piece'];

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  unit: { type: String, required: true, enum: PRODUCT_UNITS, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

productSchema.index({ name: 1, company: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
