import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  pickupLat: { type: Number, required: true },
  pickupLng: { type: Number, required: true },
  dropLat: { type: Number, required: true },
  dropLng: { type: Number, required: true },
  departureTime: { type: Date, required: true },
  routePolyline: { type: String, required: true },
  totalDistanceM: { type: Number, required: true },
  totalDurationS: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.model('Trip', TripSchema);