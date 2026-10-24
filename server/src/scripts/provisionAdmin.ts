import '../env';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db';

async function provisionAdmin() {
  const email = process.env.ADMIN_PROVISION_EMAIL?.trim().toLowerCase();
  const staffId = process.env.ADMIN_PROVISION_STAFF_ID?.trim();
  const password = process.env.ADMIN_PROVISION_PASSWORD;

  if (!email || !staffId || !password) {
    throw new Error('Set ADMIN_PROVISION_EMAIL, ADMIN_PROVISION_STAFF_ID, and ADMIN_PROVISION_PASSWORD privately.');
  }
  if (Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('The administrator password must be 12–72 UTF-8 bytes.');
  }

  const db = await connectDB();
  const users = db.collection('users');
  const account = await users.findOne({
    email,
    studentId: staffId,
    isAdmin: true,
    role: /admin|director/i,
  });

  if (!account) {
    throw new Error('No matching pre-authorized administrator account was found; no account was changed.');
  }

  const hasPassword = [account.passwordHash, account.password].some(
    value => typeof value === 'string' && value.length > 0
  );
  if (hasPassword) {
    throw new Error('The authorized account already has a password credential; no account was changed.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await users.updateOne(
    {
      _id: account._id,
      email,
      studentId: staffId,
      isAdmin: true,
      role: /admin|director/i,
      $and: [
        { $or: [{ passwordHash: { $exists: false } }, { passwordHash: null }, { passwordHash: '' }] },
        { $or: [{ password: { $exists: false } }, { password: null }, { password: '' }] },
      ],
    },
    { $set: { passwordHash } }
  );

  if (result.modifiedCount !== 1) {
    throw new Error('The administrator account changed during provisioning; no password was set.');
  }

  console.log('[Admin Provisioning] Password set for the pre-authorized administrator account.');
}

provisionAdmin()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(
      '[Admin Provisioning] Failed:',
      error instanceof Error ? error.message : 'Unexpected error.'
    );
    process.exit(1);
  });
