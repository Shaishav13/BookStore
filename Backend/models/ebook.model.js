import mongoose from 'mongoose';

const ebookSchema = mongoose.Schema({
  name:     { type: String, required: true },
  author:   { type: String, required: true },
  title:    { type: String },
  price:    { type: Number, required: true },
  category: { type: String, required: true },
  image:    { type: String, required: true },
  pdfUrl:   { type: String, required: true },
  pages:    { type: Number, default: 0 },
  language: { type: String, default: 'English' },
  inStock:  { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
});

const EBook = mongoose.model('ebook', ebookSchema);
export default EBook;
