import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Trip } from '../src/models/trip.js';
import { getOrFetchRoute } from '../src/services/directionsService.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('❌ MONGODB_URI missing');

async function main() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean old trips for fresh seeding
    await Trip.deleteMany({});
    console.log('🧹 Cleared old trips');

    // Load Bengaluru sample trips JSON
    const p = path.join(process.cwd(), 'data', 'sample_trips_blr.json');
    const raw = fs.readFileSync(p, 'utf8');
    const items = JSON.parse(raw);

    console.log(`📦 Found ${items.length} trips to seed`);

    // Process trips in parallel with safety
    await Promise.all(
      items.map(async (t, idx) => {
        try {
          const route = await getOrFetchRoute({
            pickup_lat: t.pickup_lat,
            pickup_lng: t.pickup_lng,
            drop_lat: t.drop_lat,
            drop_lng: t.drop_lng,
          });

          const trip = new Trip({
            pickupLat: t.pickup_lat,
            pickupLng: t.pickup_lng,
            dropLat: t.drop_lat,
            dropLng: t.drop_lng,
            departureTime: new Date(t.departure_time),
            routePolyline: route?.polyline ?? null,
            totalDistanceM: route?.distanceM ?? null,
            totalDurationS: route?.durationS ?? null,
          });

          await trip.save();
          console.log(`✅ Seeded trip #${idx + 1}: ${trip._id}`);
        } catch (err) {
          console.error(`❌ Failed to seed trip #${idx + 1}:`, err.message);
        }
      })
    );

    console.log('🎉 Done seeding all trips');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();