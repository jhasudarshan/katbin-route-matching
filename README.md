# Route Matching Backend (Node.js + MongoDB + Upstash)

A backend service that matches riders using **route geometry** (via OSRM) and **time overlap**.  
Routes are fetched from the public [OSRM API](https://project-osrm.org/) and cached in Upstash Redis.  
Trips are stored in MongoDB and exposed via REST APIs.

---

## 🚀 What it does
- Add trips with pickup/drop + departure time.
- Fetch route polyline + distance/duration via **OSRM API** (cached in Redis).
- Match trips by:
  - **Time window:** ±30 minutes
  - **Route overlap:** polyline similarity (≥ 15%)
  - **Deviation:** extra distance ≤ 15%
- Returns overlap %, extra distance/time, and a match score.

---

## 🛠 Tech Stack
- **Backend:** Node.js (Express)
- **Database:** MongoDB (Mongoose)
- **Cache:** Upstash Redis (via @upstash/redis)
- **Routing:** OSRM API (polyline + distance + duration)

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm ci
````

### 2. Configure environment

Create a `.env` file (copy from `.env.example`):

```
PORT=3000
MONGODB_URI=your_mongo_uri
REDIS_URL=your_upstash_url
CACHE_TTL_SECONDS=3600
```

### 3. Seed sample data

```bash
npm run seed
```

(Seeds sample Bengaluru trips from `./data/sample_trips_blr.json` to the DB)

### 4. Run server

```bash
npm run dev
```

Server runs at: [http://localhost:3000](http://localhost:3000)

### 5. Dry run (CLI mode)

```bash
npm run dryrun
```
(Running the last 5 trips from database to dry run and check the matches of those trips)

---

## 📌 API Endpoints

### Add a trip

**POST** `/trips`
Request:

```json
{
    "pickup_lat": 12.9800,
    "pickup_lng": 77.6000,
    "drop_lat": 12.9500,
    "drop_lng": 77.6400,
    "departure_time": "2025-09-06T08:30:00Z"
}
```

### List all trips

**GET** `/trips`

### Get matches for a trip

**GET** `/trips/matches/:tripId`

---

## ✅ Deliverables

* Matching algorithm with time + route overlap
* MongoDB storage + Redis caching
* REST APIs for trips and matches
* Dry run with Bengaluru trips (sample JSON output : `./data/output.json`)

---