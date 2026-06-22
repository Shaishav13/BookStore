import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  label:   { type: String, default: "Home" }, // Home / Work / Other
  street:  { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  zip:     { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  date:      { type: Date, default: Date.now() },
  addresses: { type: [AddressSchema], default: [] },
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'books' }],
});

const model = mongoose.model('user', UserSchema);
export default model;
