import { Router } from 'express';
import type { Request, Response } from 'express';
import { ObjectId, MongoServerError } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { connectDB } from '../db';

const router = Router();
const SESSION_COOKIE = 'basketball_session';
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET must be set in the workspace root .env file.');
    }
    return secret;
}

const JWT_SECRET = getJwtSecret();

interface UserProfile {
    uid: string;
    name: string;
    studentId: string;
    email: string;
    role: string;
    eligibility: string;
    avatarUrl: string;
    isAdmin: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUniversityEmail(value: string): boolean {
    return isValidEmail(value) && value.endsWith('.edu');
}

function isValidName(value: string): boolean {
    return value.length >= 2
        && value.length <= 100
        && /^[\p{L}\p{M}]+(?:[ .'\u2019-][\p{L}\p{M}]+)*\.?$/u.test(value);
}

function getSessionToken(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return undefined;

    for (const cookie of cookieHeader.split(';')) {
        const separator = cookie.indexOf('=');
        if (separator < 0) continue;
        if (cookie.slice(0, separator).trim() === SESSION_COOKIE) {
            return cookie.slice(separator + 1).trim();
        }
    }
    return undefined;
}

function getProfile(uid: string, user: Record<string, unknown>): UserProfile {
    return {
        uid,
        name: typeof user.name === 'string' ? user.name : '',
        studentId: typeof user.studentId === 'string' ? user.studentId : '',
        email: typeof user.email === 'string' ? user.email : '',
        role: typeof user.role === 'string' ? user.role : 'Student Member',
        eligibility: typeof user.eligibility === 'string' ? user.eligibility : '',
        avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : '',
        isAdmin: user.isAdmin === true
    };
}

function setSessionCookie(response: Response, userId: string): void {
    const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '24h' });
    response.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/api/auth'
    });
}

function clearSessionCookie(response: Response): void {
    response.clearCookie(SESSION_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth'
    });
}

function logAuthFailure(operation: string, error: unknown): void {
    console.error(
        `[Auth API] ${operation} failed:`,
        error instanceof Error ? error.name : 'Unknown error'
    );
}

router.post('/register', async (req: Request, res: Response) => {
    const body: unknown = req.body;
    const errors: Record<string, string> = {};
    const name = isRecord(body) && typeof body.name === 'string' ? body.name.trim() : '';
    const studentId = isRecord(body) && typeof body.studentId === 'string'
        ? body.studentId.trim().toUpperCase()
        : '';
    const email = isRecord(body) && typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const password = isRecord(body) && typeof body.password === 'string' ? body.password : '';

    if (!isValidName(name)) {
        errors.name = 'Enter a valid name using letters, spaces, apostrophes, or hyphens.';
    }
    if (!/^\d{8}-[A-Z]$/.test(studentId)) {
        errors.studentId = 'Use the format 12345678-A.';
    }
    if (!isValidUniversityEmail(email)) {
        errors.email = 'Enter a valid university .edu email address.';
    }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
        errors.password = 'Password must be 8 to 72 UTF-8 bytes long.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Please correct the highlighted fields.',
            errors
        });
    }

    try {
        const db = await connectDB();
        const users = db.collection('users');
        const existingUser = await users.findOne({
            $or: [{ email }, { studentId }]
        });

        if (existingUser) {
            const duplicateErrors: Record<string, string> = {};
            if (existingUser.email === email) {
                duplicateErrors.email = 'An account with this email already exists.';
            }
            if (existingUser.studentId === studentId) {
                duplicateErrors.studentId = 'An account with this student ID already exists.';
            }
            return res.status(409).json({
                status: 'error',
                message: 'An account with those details already exists.',
                errors: duplicateErrors
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = {
            name,
            studentId,
            email,
            passwordHash,
            role: 'Student Member',
            eligibility: 'Active Full Member',
            avatarUrl: '',
            isAdmin: false
        };
        const result = await users.insertOne(newUser);
        const uid = result.insertedId.toHexString();

        setSessionCookie(res, uid);
        return res.status(201).json({
            status: 'success',
            user: getProfile(uid, newUser)
        });
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
            const keys = Object.keys(error.keyPattern ?? {});
            const field = keys.includes('email') ? 'email' : 'studentId';
            return res.status(409).json({
                status: 'error',
                message: 'An account with those details already exists.',
                errors: {
                    [field]: field === 'email'
                        ? 'An account with this email already exists.'
                        : 'An account with this student ID already exists.'
                }
            });
        }
        logAuthFailure('Registration', error);
        return res.status(500).json({
            status: 'error',
            message: 'Unable to create an account right now.'
        });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const body: unknown = req.body;
    const email = isRecord(body) && typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const password = isRecord(body) && typeof body.password === 'string' ? body.password : '';

    if (!isValidEmail(email) || password.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Enter a valid email address and password.'
        });
    }

    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ email });
        const passwordHash = typeof user?.passwordHash === 'string'
            ? user.passwordHash
            : typeof user?.password === 'string'
                ? user.password
                : undefined;

        if (!user || !passwordHash || !(await bcrypt.compare(password, passwordHash))) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password.'
            });
        }

        if (
            user.eligibility === 'Suspended'
            || user.eligibility === 'Inactive'
            || user.eligibility === 'Disabled'
        ) {
            return res.status(403).json({
                status: 'error',
                message: 'This account is not currently eligible to sign in.'
            });
        }

        const uid = user._id.toString();
        setSessionCookie(res, uid);
        return res.status(200).json({
            status: 'success',
            user: getProfile(uid, user)
        });
    } catch (error) {
        logAuthFailure('Login', error);
        return res.status(500).json({
            status: 'error',
            message: 'Unable to log in right now.'
        });
    }
});

router.get('/me', async (req: Request, res: Response) => {
    const token = getSessionToken(req);
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }

    let userId: string;
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        userId = typeof payload === 'object' && typeof payload.sub === 'string'
            ? payload.sub
            : '';
    } catch {
        clearSessionCookie(res);
        return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }

    if (!ObjectId.isValid(userId)) {
        clearSessionCookie(res);
        return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }

    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            clearSessionCookie(res);
            return res.status(401).json({ status: 'error', message: 'Authentication required.' });
        }
        if (
            user.eligibility === 'Suspended'
            || user.eligibility === 'Inactive'
            || user.eligibility === 'Disabled'
        ) {
            clearSessionCookie(res);
            return res.status(403).json({
                status: 'error',
                message: 'This account is not currently eligible to sign in.'
            });
        }
        return res.status(200).json({
            status: 'success',
            user: getProfile(userId, user)
        });
    } catch (error) {
        logAuthFailure('Session verification', error);
        return res.status(500).json({
            status: 'error',
            message: 'Unable to verify the session right now.'
        });
    }
});

router.post('/logout', (_req: Request, res: Response) => {
    clearSessionCookie(res);
    return res.status(204).end();
});

export default router;
