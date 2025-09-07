import { Trip } from '../models/trip.js';
import { getOrFetchRoute } from '../services/directionsService.js';
import { findMatchesForTrip } from '../services/matchService.js';

export async function addTrip(req, res) {
  try {
    const { pickup_lat, pickup_lng, drop_lat, drop_lng, departure_time } = req.body;
    if (!pickup_lat || !pickup_lng || !drop_lat || !drop_lng || !departure_time) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const route = await getOrFetchRoute({
      pickup_lat, pickup_lng, drop_lat, drop_lng
    });

    const trip = new Trip({
      pickupLat: pickup_lat,
      pickupLng: pickup_lng,
      dropLat: drop_lat,
      dropLng: drop_lng,
      departureTime: new Date(departure_time),
      routePolyline: route.polyline,
      totalDistanceM: route.distanceM,
      totalDurationS: route.durationS
    });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to add trip' });
  }
}

export async function listTrips(req, res) {
  const trips = await Trip.find().sort({ createdAt: -1 }).limit(100);
  res.json(trips);
}

export async function getMatches(req, res) {
  try {
    const tripId = req.params.tripId;
    const base = await Trip.findById(tripId);
    if (!base) return res.status(404).json({ error: 'Trip not found' });

    const candidates = await Trip.find({ _id: { $ne: base._id } });
    //to improve performance we can add the cache layer to
    //filter the candidate by storing the ongoing trips
    //into the cache, because those trips are only relevant
    //to match the trip
    
    const results = await findMatchesForTrip(base, candidates);
    res.json({ tripId: base._id, matches: results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Match error' });
  }
}