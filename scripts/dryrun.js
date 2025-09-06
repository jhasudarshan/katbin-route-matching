import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Trip } from '../src/models/trip.js';
import { findMatchesForTrip } from '../src/services/matchService.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

async function main() {
  await mongoose.connect(MONGODB_URI);

  // ✅ latest 5 trips
  const trips = await Trip.find().sort({ createdAt: -1 }).limit(5);
  if (trips.length < 2) {
    console.log('Seed the DB first: npm run seed');
    process.exit(0);
  }

  const allResults = [];

  for (let i = 0; i < trips.length; i++) {
    const base = trips[i];
    const candidates = trips.filter((_, idx) => idx !== i);
    const matches = await findMatchesForTrip(base, candidates);

    const result = {
      baseTripId: base._id,
      matches,
    };

    console.log(JSON.stringify(result, null, 2));
    allResults.push(result);
  }

  // ✅ write all results to output.json
  const outputPath = path.join(process.cwd(), 'data', 'output.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`📝 Results saved to ${outputPath}`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});