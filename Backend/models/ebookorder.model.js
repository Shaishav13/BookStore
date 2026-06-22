import mongoose from 'mongoose';

const ebookOrderSchema = mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  ebookId:         { type: mongoose.Schema.Types.ObjectId, ref: 'ebook', required: true },
  price:           { type: Number, required: true },
  paymentIntentId: { type: String, required: true },
  status:          { type: String, default: 'Paid' },
  createdAt:       { type: Date, default: Date.now },
});

const EBookOrder = mongoose.model('ebookorder', ebookOrderSchema);
export default EBookOrder;
