import './env';
import express from 'express';
import type { ErrorRequestHandler, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './db';
import authRoutes from './routes/auth';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.CLIENT_ORIGIN || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)
]);

app.use(cors({
    credentials: true,
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    }
}));
app.use(express.json({ limit: '16kb' }));

app.use('/api/auth', authRoutes);

app.get('/api/health', async (_req: Request, res: Response) => {
    try {
        const db = await connectDB();
        await db.command({ ping: 1 });
        res.status(200).json({
            status: 'success',
            message: 'Server is running',
            database: 'connected',
            databaseName: db.databaseName
        });
    } catch {
        console.error('[Health] MongoDB ping failed.');
        res.status(503).json({
            status: 'error',
            message: 'Server is running, but database connection failed'
        });
    }
});

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const errorType = typeof error === 'object' && error !== null && 'type' in error
        ? error.type
        : undefined;
    const status = errorType === 'entity.parse.failed'
        ? 400
        : errorType === 'entity.too.large'
            ? 413
            : error instanceof Error && error.message === 'Not allowed by CORS'
                ? 403
                : 500;
    const message = status === 400
        ? 'Request body must contain valid JSON.'
        : status === 413
            ? 'Request body is too large.'
            : status === 403
                ? 'Request origin is not allowed.'
                : 'Internal server error.';

    console.error(`[Server] Request failed with status ${status}.`);
    res.status(status).json({ status: 'error', message });
};

app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
    try {
        await connectDB();
    } catch {
        console.warn('[Server] Warning: Failed to connect to the configured database.');
    }
});