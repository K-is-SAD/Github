import mongoose, { Document, Model, Schema } from 'mongoose';

export interface PaymentDocument extends Document {
  userId: string;
  amount?: number;
  currency?: string;
  status?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: String, required: true },
    amount: { type: Number },
    currency: { type: String },
    status: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const PaymentModel =
  (mongoose.models.PaymentModel as Model<PaymentDocument>) ||
  mongoose.model<PaymentDocument>('PaymentModel', PaymentSchema);

export default PaymentModel;
