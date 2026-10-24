import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/basketball_reservation';
const databaseName = 'basketball_reservation';
const client = new MongoClient(uri);

let db: Db;
let connection: Promise<Db> | undefined;

export async function connectDB(): Promise<Db> {
    if (db) return db;
    if (connection) return connection;

    connection = client.connect()
        .then(() => {
            db = client.db(databaseName);
            console.log(`[Database] Successfully connected to MongoDB: ${db.databaseName}`);
            return db;
        })
        .catch((error: unknown) => {
            connection = undefined;
            console.error(
                '[Database] Connection failed:',
                error instanceof Error ? error.name : 'Unknown error'
            );
            throw error;
        });

    return connection;
}