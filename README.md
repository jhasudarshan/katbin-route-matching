
---

# Route Matching Backend (Node.js + MongoDB + Upstash)

This backend service enables rider matching based on **route geometry** (via OSRM) and **time overlap**.
It integrates the [OSRM API](https://project-osrm.org/) for routing, caches results in Upstash Redis, and stores trip data in MongoDB.
Matching is determined by departure time, route similarity, and deviation thresholds.

---

## Features

* Add trips with pickup and drop locations, along with departure time.
* Fetch route polyline, distance, and duration from OSRM (with Redis caching).
* Match trips using the following criteria:

  * **Time window:** ±30 minutes
  * **Route overlap:** polyline similarity ≥ 15%
  * **Deviation:** additional distance ≤ 15%
* Returns overlap percentage, additional distance/time, and a computed match score.

---

## Technology Stack

* **Backend:** Node.js (Express)
* **Database:** MongoDB (Mongoose)
* **Cache:** Upstash Redis (`@upstash/redis`)
* **Routing:** OSRM API (polyline, distance, duration)

---

## Setup Instructions

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment variables

Create a `.env` file (use `.env.example` as a template):

```env
PORT=3000
MONGODB_URI=your_mongo_uri
REDIS_URL=your_upstash_url
CACHE_TTL_SECONDS=3600
```

### 3. Seed sample data

```bash
npm run seed
```

Seeds Bengaluru trip data from `./data/sample_trips_blr.json` into MongoDB.

### 4. Start the development server

```bash
npm run dev
```

The server will be available at [http://localhost:3000](http://localhost:3000).

### 5. Run a dry run (CLI mode)

```bash
npm run dryrun
```

Executes the last 5 trips from the database and evaluates their matches.

---

## API Endpoints

### Add a Trip

**POST** `/trips`

Example request:

```json
{
  "pickup_lat": 12.9800,
  "pickup_lng": 77.6000,
  "drop_lat": 12.9500,
  "drop_lng": 77.6400,
  "departure_time": "2025-09-06T08:30:00Z"
}
```

### List All Trips

**GET** `/trips`

### Get Matches for a Trip

**GET** `/trips/matches/:tripId`

---

## Deliverables

* Matching algorithm based on time and route overlap
* MongoDB storage with Redis caching
* REST APIs for managing trips and matches
* Sample dry run with Bengaluru trips (example output in `./data/output.json`)

---