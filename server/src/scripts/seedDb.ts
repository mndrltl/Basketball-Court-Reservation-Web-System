import '../env';
import { connectDB } from '../db';

const courts = [
  { name: 'Basketball Court 1', type: 'basketball', badge: 'Hardwood Arena', subLocation: 'East Wing, Hardwood Arena', fullLocation: 'East Wing • Ground Level', capacity: '10 Regulation Players', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzFBD5oC6pEX8_LF3Vgb7GVCSZsKjFF5TQr56o3iV4Q-2XB3JIGmv-_DGy4huzIwCzFYTxwMmPakSoJT56t0nPTKfMPTFTaI-p-t2x81LbWi8azFytHQvNe9SkkUtof3pxXbRcgOM4s8KSNENIZmSqmfkqtGT4I30psgkxSIrqom01UOCba3zCcwwcfzjGIjhTY2W0AxBXM5zdxBBWbsq-cnAPwwiPu134CvtmxLzeDK1JAt0D6v5M', status: 'Available', condition: 'FIBA Hardwood Maple, Resurfaced 2025', maintenanceNote: 'Regular inspection passed. Clean traction.' },
  { name: 'Basketball Court 2', type: 'basketball', badge: 'Main Fieldhouse', subLocation: 'West Wing, Main Fieldhouse', fullLocation: 'West Wing • Annex Quad', capacity: '10 Regulation Players', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzFBD5oC6pEX8_LF3Vgb7GVCSZsKjFF5TQr56o3iV4Q-2XB3JIGmv-_DGy4huzIwCzFYTxwMmPakSoJT56t0nPTKfMPTFTaI-p-t2x81LbWi8azFytHQvNe9SkkUtof3pxXbRcgOM4s8KSNENIZmSqmfkqtGT4I30psgkxSIrqom01UOCba3zCcwwcfzjGIjhTY2W0AxBXM5zdxBBWbsq-cnAPwwiPu134CvtmxLzeDK1JAt0D6v5M', status: 'Available', condition: 'Polyurethane Sprung Floor', maintenanceNote: 'Scoreboard wireless sync operational.' },
  { name: 'Basketball Court 3', type: 'basketball', badge: 'North Training Quad', subLocation: 'North Wing, Practice Facility', fullLocation: 'North Wing • Half-Court Auxiliary', capacity: '8 Players', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzFBD5oC6pEX8_LF3Vgb7GVCSZsKjFF5TQr56o3iV4Q-2XB3JIGmv-_DGy4huzIwCzFYTxwMmPakSoJT56t0nPTKfMPTFTaI-p-t2x81LbWi8azFytHQvNe9SkkUtof3pxXbRcgOM4s8KSNENIZmSqmfkqtGT4I30psgkxSIrqom01UOCba3zCcwwcfzjGIjhTY2W0AxBXM5zdxBBWbsq-cnAPwwiPu134CvtmxLzeDK1JAt0D6v5M', status: 'Maintenance', condition: 'Under Scheduled Rim Adjustment', maintenanceNote: 'Hoop tension calibration in progress until 14:00.' },
  { name: 'Volleyball Court 1', type: 'volleyball', badge: 'South Pavilion', subLocation: 'South Pavilion, Olympic Net', fullLocation: 'Olympic Tension Net • Pro Post', capacity: '12 Players', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBURInLjkcmDHLxFeZeSwL5c30udRD1nl5qTPJl8dDOJVD7Fj6pZ4aFfZqddXUnI5xRzbSL2MxcZposO-MlUVqSU7RtONVLJyqsT155oy5n-y9A2OTkE6gYZ73LJrykqm8y0YkeLeZrp3JoeUXFSTvUBfuBzQv708fvhRE14kfc5S-Ie6trnc63Gu24Q0hwvfcvzu4c54fatmug-uoFeb8eZfwgMiIT7aP9UVY1Q10r4YtnwffEOPQG', status: 'Available', condition: 'Senoh Championship Net Post Rigging', maintenanceNote: 'Antennae & pads inspected.' },
  { name: 'Volleyball Court 2', type: 'volleyball', badge: 'North Pavilion', subLocation: 'North Pavilion, Training Net', fullLocation: 'Standard Training Net Rigging', capacity: '12 Players', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBURInLjkcmDHLxFeZeSwL5c30udRD1nl5qTPJl8dDOJVD7Fj6pZ4aFfZqddXUnI5xRzbSL2MxcZposO-MlUVqSU7RtONVLJyqsT155oy5n-y9A2OTkE6gYZ73LJrykqm8y0YkeLeZrp3JoeUXFSTvUBfuBzQv708fvhRE14kfc5S-Ie6trnc63Gu24Q0hwvfcvzu4c54fatmug-uoFeb8eZfwgMiIT7aP9UVY1Q10r4YtnwffEOPQG', status: 'Available', condition: 'Standard Multi-Sport Hardwood', maintenanceNote: 'Ready for general intramural play.' }
];

const equipmentList = [
  { name: 'Official Basketballs', category: 'Game Basketballs', spec: 'NFHS / NCAA Spec', description: 'Full grain composite leather', availableStock: 18, totalStock: 25, loanedStock: 5, maintenanceStock: 2, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALWzjksX27n9RooDV4qZr2QMjRGQvcmiBhJMiXOHaLtJaJ7d9bhWvlwsKJdMw_3kx-nE23e4z41HYZuBARMB8yjMpDvQGCZ5MO74RA2LJhshtST-pXlzgLttbzrf0HVNzaIDGxVQ22SFRsQRpAg_92nLVFRMnCAgGe6nksP8dRGMq3EIaWAKwwZH81578QmM8WmWw7bjrunamHnsyi_OEvPoQTtqx3JgPcw0RU4fbcR0TNHrcwkMSC' },
  { name: 'Indoor Volleyballs', category: 'Regulation Volleyballs', spec: 'FIVB Tournament Spec', description: 'Micro-fiber composite cover', availableStock: 14, totalStock: 20, loanedStock: 4, maintenanceStock: 2, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmvAdJ-4mODCHJrpBhnJ7k8qt-qRiRHgf8uPPxuFEIYqmcafD8S21J1gAcVBrxLbMFWKLfNp7Ed0idspxtO7p6aJXv0PBujYUWVEUdllax0cdJdT7UBuu3KoxkvGsH94TVW7QTlLJpshWRQ6bub_SyM-G1hUf65YDq1-DRJeoeCQ00ZBVWpB3HNtI6zHUZCtdtFG10TTFAMwsrBFJo6YvScV_QCu-Q6YpSxOmdlI9-l5nJ0sjaO0_g' },
  { name: 'Portable Digital Scoreboard', category: 'Officiating Equipment', spec: 'LED Shot-Clock & Period Tracker', description: 'Battery powered with wireless remote', availableStock: 3, totalStock: 4, loanedStock: 1, maintenanceStock: 0, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALWzjksX27n9RooDV4qZr2QMjRGQvcmiBhJMiXOHaLtJaJ7d9bhWvlwsKJdMw_3kx-nE23e4z41HYZuBARMB8yjMpDvQGCZ5MO74RA2LJhshtST-pXlzgLttbzrf0HVNzaIDGxVQ22SFRsQRpAg_92nLVFRMnCAgGe6nksP8dRGMq3EIaWAKwwZH81578QmM8WmWw7bjrunamHnsyi_OEvPoQTtqx3JgPcw0RU4fbcR0TNHrcwkMSC' },
  { name: 'Fox 40 Referee Whistles & Lanyards', category: 'Officiating Gear', spec: 'Pealess 115dB Sonic Whistle', description: 'Sanitized individually wrapped sets', availableStock: 12, totalStock: 15, loanedStock: 3, maintenanceStock: 0, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmvAdJ-4mODCHJrpBhnJ7k8qt-qRiRHgf8uPPxuFEIYqmcafD8S21J1gAcVBrxLbMFWKLfNp7Ed0idspxtO7p6aJXv0PBujYUWVEUdllax0cdJdT7UBuu3KoxkvGsH94TVW7QTlLJpshWRQ6bub_SyM-G1hUf65YDq1-DRJeoeCQ00ZBVWpB3HNtI6zHUZCtdtFG10TTFAMwsrBFJo6YvScV_QCu-Q6YpSxOmdlI9-l5nJ0sjaO0_g' }
];

const users = [
  { name: 'Jamin Villareal', studentId: '20240396-C', email: 'jvillareal@athletics.univ.edu', role: 'Student Athlete', eligibility: 'Active Full Member', isAdmin: false },
  { name: 'Director Marcus Hayes', studentId: 'FAC-70192', email: 'admin@athletics.univ.edu', role: 'Athletic Facilities Administrator', eligibility: 'Faculty / Facility Staff', isAdmin: true }
];

async function seedDatabase() {
    try {
        const db = await connectDB();
        console.log('[Seed] Connected to database. Starting seed process...');

        // Seed Courts
        const courtsCol = db.collection('courts');
        for (const court of courts) {
            await courtsCol.updateOne({ name: court.name }, { $setOnInsert: court }, { upsert: true });
        }
        console.log(`[Seed] Upserted ${courts.length} courts.`);

        // Seed Equipment
        const equipCol = db.collection('equipment');
        for (const item of equipmentList) {
            await equipCol.updateOne({ name: item.name }, { $setOnInsert: item }, { upsert: true });
        }
        console.log(`[Seed] Upserted ${equipmentList.length} equipment items.`);

        // Seed Users
        const usersCol = db.collection('users');
        for (const user of users) {
            await usersCol.updateOne({ email: user.email }, { $setOnInsert: user }, { upsert: true });
        }
        console.log(`[Seed] Upserted ${users.length} initial users.`);

        console.log('[Seed] Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('[Seed] Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();