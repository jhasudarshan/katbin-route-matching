import express from 'express';
import tripRoutes from './routes/tripRoutes.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/trips', tripRoutes);

export default app;