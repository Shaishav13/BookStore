import mongoose from 'mongoose'

const bookSchema=mongoose.Schema({
    name:String,
    price:Number,
    category:String,
    image:String,
    title:String,
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    stockCount: { type: Number, default: 100 },
})
const Book=mongoose.model("books",bookSchema);
export default Book;