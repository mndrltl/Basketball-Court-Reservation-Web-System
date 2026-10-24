import '../env';
import { connectDB } from '../db';

async function setupDatabase() {
    try {
        const db = await connectDB();
        console.log('[Setup] Starting database configuration...');

        const existingCollections = await db.listCollections().toArray();
        const collectionNames = existingCollections.map(c => c.name);

        // 1. Users Collection
        if (!collectionNames.includes('users')) await db.createCollection('users');
        await db.command({
            collMod: 'users',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'studentId', 'email', 'role', 'eligibility'],
                    properties: {
                        name: { bsonType: 'string', minLength: 1 },
                        studentId: { bsonType: 'string', minLength: 1 },
                        email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
                        role: { bsonType: 'string' },
                        eligibility: { bsonType: 'string' },
                        isAdmin: { bsonType: 'bool' }
                    }
                }
            }
        });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ studentId: 1 }, { unique: true });
        console.log('[Setup] Users collection and indexes configured.');

        // 2. Courts Collection
        if (!collectionNames.includes('courts')) await db.createCollection('courts');
        await db.command({
            collMod: 'courts',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'type', 'status'],
                    properties: {
                        name: { bsonType: 'string' },
                        type: { enum: ['basketball', 'volleyball'] },
                        status: { enum: ['Available', 'Reserved', 'Maintenance', 'Closed'] }
                    }
                }
            }
        });
        await db.collection('courts').createIndex({ name: 1 }, { unique: true });
        console.log('[Setup] Courts collection configured.');

        // 3. Equipment Collection (Enforces Phase 5: No negative inventory)
        if (!collectionNames.includes('equipment')) await db.createCollection('equipment');
        await db.command({
            collMod: 'equipment',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'availableStock', 'totalStock'],
                    properties: {
                        name: { bsonType: 'string' },
                        availableStock: { bsonType: 'int', minimum: 0 },
                        totalStock: { bsonType: 'int', minimum: 0 },
                        loanedStock: { bsonType: 'int', minimum: 0 }
                    }
                }
            }
        });
        await db.collection('equipment').createIndex({ name: 1 }, { unique: true });
        console.log('[Setup] Equipment collection configured.');

        // 4. Reservations Collection
        if (!collectionNames.includes('reservations')) await db.createCollection('reservations');
        await db.command({
            collMod: 'reservations',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['courtName', 'isoDate', 'timeSlot', 'studentId', 'status'],
                    properties: {
                        isoDate: { bsonType: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, // Enforces YYYY-MM-DD
                        status: { enum: ['Confirmed', 'Pending Confirmation', 'In Progress', 'Completed', 'Cancelled by User', 'Blocked / Varsity'] },
                        equipmentDetails: {
                            bsonType: 'array',
                            items: {
                                bsonType: 'object',
                                required: ['name', 'qty'],
                                properties: { qty: { bsonType: 'int', minimum: 0 } }
                            }
                        }
                    }
                }
            }
        });
        // Index to help prevent double booking (Phase 4 concurrency protection)
        await db.collection('reservations').createIndex({ courtName: 1, isoDate: 1, timeSlot: 1 });
        await db.collection('reservations').createIndex({ studentId: 1 });
        console.log('[Setup] Reservations collection and indexes configured.');

        console.log('[Setup] Database configuration complete!');
        process.exit(0);
    } catch (error) {
        console.error('[Setup] Error configuring database:', error);
        process.exit(1);
    }
}

setupDatabase();