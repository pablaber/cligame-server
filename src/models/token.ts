import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastUsed: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

tokenSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

tokenSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;