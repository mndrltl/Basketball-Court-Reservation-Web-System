import { CourtOption, EquipmentLoanItem, Reservation, BookingHistoryRecord, UserProfile, StudentMember } from '../types';

export const ASSETS = {
  basketballCourt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzFBD5oC6pEX8_LF3Vgb7GVCSZsKjFF5TQr56o3iV4Q-2XB3JIGmv-_DGy4huzIwCzFYTxwMmPakSoJT56t0nPTKfMPTFTaI-p-t2x81LbWi8azFytHQvNe9SkkUtof3pxXbRcgOM4s8KSNENIZmSqmfkqtGT4I30psgkxSIrqom01UOCba3zCcwwcfzjGIjhTY2W0AxBXM5zdxBBWbsq-cnAPwwiPu134CvtmxLzeDK1JAt0D6v5M',
  volleyballCourt: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBURInLjkcmDHLxFeZeSwL5c30udRD1nl5qTPJl8dDOJVD7Fj6pZ4aFfZqddXUnI5xRzbSL2MxcZposO-MlUVqSU7RtONVLJyqsT155oy5n-y9A2OTkE6gYZ73LJrykqm8y0YkeLeZrp3JoeUXFSTvUBfuBzQv708fvhRE14kfc5S-Ie6trnc63Gu24Q0hwvfcvzu4c54fatmug-uoFeb8eZfwgMiIT7aP9UVY1Q10r4YtnwffEOPQG',
  basketballsEquipment: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALWzjksX27n9RooDV4qZr2QMjRGQvcmiBhJMiXOHaLtJaJ7d9bhWvlwsKJdMw_3kx-nE23e4z41HYZuBARMB8yjMpDvQGCZ5MO74RA2LJhshtST-pXlzgLttbzrf0HVNzaIDGxVQ22SFRsQRpAg_92nLVFRMnCAgGe6nksP8dRGMq3EIaWAKwwZH81578QmM8WmWw7bjrunamHnsyi_OEvPoQTtqx3JgPcw0RU4fbcR0TNHrcwkMSC',
  volleyballsEquipment: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmvAdJ-4mODCHJrpBhnJ7k8qt-qRiRHgf8uPPxuFEIYqmcafD8S21J1gAcVBrxLbMFWKLfNp7Ed0idspxtO7p6aJXv0PBujYUWVEUdllax0cdJdT7UBuu3KoxkvGsH94TVW7QTlLJpshWRQ6bub_SyM-G1hUf65YDq1-DRJeoeCQ00ZBVWpB3HNtI6zHUZCtdtFG10TTFAMwsrBFJo6YvScV_QCu-Q6YpSxOmdlI9-l5nJ0sjaO0_g'
};

export const INITIAL_USER: UserProfile = {
  name: 'Jamin Villareal',
  studentId: '20240396-C',
  email: 'jvillareal@athletics.univ.edu',
  role: 'Student Athlete',
  eligibility: 'Active Full Member',
  avatarUrl: '',
  isAdmin: false
};

export const INITIAL_ADMIN_USER: UserProfile = {
  name: 'Director Marcus Hayes',
  studentId: 'FAC-70192',
  email: 'admin@athletics.univ.edu',
  role: 'Athletic Facilities Administrator',
  eligibility: 'Faculty / Facility Staff',
  avatarUrl: '',
  isAdmin: true
};

export const COURTS_DATA: CourtOption[] = [
  {
    id: 'bb-1',
    name: 'Basketball Court 1',
    type: 'basketball',
    badge: 'Hardwood Arena',
    subLocation: 'East Wing, Hardwood Arena',
    fullLocation: 'East Wing • Ground Level',
    capacity: '10 Regulation Players',
    imageUrl: ASSETS.basketballCourt,
    status: 'Available',
    condition: 'FIBA Hardwood Maple, Resurfaced 2025',
    maintenanceNote: 'Regular inspection passed. Clean traction.'
  },
  {
    id: 'bb-2',
    name: 'Basketball Court 2',
    type: 'basketball',
    badge: 'Main Fieldhouse',
    subLocation: 'West Wing, Main Fieldhouse',
    fullLocation: 'West Wing • Annex Quad',
    capacity: '10 Regulation Players',
    imageUrl: ASSETS.basketballCourt,
    status: 'Available',
    condition: 'Polyurethane Sprung Floor',
    maintenanceNote: 'Scoreboard wireless sync operational.'
  },
  {
    id: 'bb-3',
    name: 'Basketball Court 3',
    type: 'basketball',
    badge: 'North Training Quad',
    subLocation: 'North Wing, Practice Facility',
    fullLocation: 'North Wing • Half-Court Auxiliary',
    capacity: '8 Players',
    imageUrl: ASSETS.basketballCourt,
    status: 'Maintenance',
    condition: 'Under Scheduled Rim Adjustment',
    maintenanceNote: 'Hoop tension calibration in progress until 14:00.'
  },
  {
    id: 'vb-1',
    name: 'Volleyball Court 1',
    type: 'volleyball',
    badge: 'South Pavilion',
    subLocation: 'South Pavilion, Olympic Net',
    fullLocation: 'Olympic Tension Net • Pro Post',
    capacity: '12 Players',
    imageUrl: ASSETS.volleyballCourt,
    status: 'Available',
    condition: 'Senoh Championship Net Post Rigging',
    maintenanceNote: 'Antennae & pads inspected.'
  },
  {
    id: 'vb-2',
    name: 'Volleyball Court 2',
    type: 'volleyball',
    badge: 'North Pavilion',
    subLocation: 'North Pavilion, Training Net',
    fullLocation: 'Standard Training Net Rigging',
    capacity: '12 Players',
    imageUrl: ASSETS.volleyballCourt,
    status: 'Available',
    condition: 'Standard Multi-Sport Hardwood',
    maintenanceNote: 'Ready for general intramural play.'
  }
];

export const INITIAL_EQUIPMENT: EquipmentLoanItem[] = [
  {
    id: 'eq-bb',
    name: 'Official Basketballs',
    category: 'Game Basketballs',
    spec: 'NFHS / NCAA Spec',
    description: 'Full grain composite leather',
    availableStock: 18,
    totalStock: 25,
    loanedStock: 5,
    maintenanceStock: 2,
    imageUrl: ASSETS.basketballsEquipment,
    quantity: 2
  },
  {
    id: 'eq-vb',
    name: 'Indoor Volleyballs',
    category: 'Regulation Volleyballs',
    spec: 'FIVB Tournament Spec',
    description: 'Micro-fiber composite cover',
    availableStock: 14,
    totalStock: 20,
    loanedStock: 4,
    maintenanceStock: 2,
    imageUrl: ASSETS.volleyballsEquipment,
    quantity: 0
  },
  {
    id: 'eq-sc',
    name: 'Portable Digital Scoreboard',
    category: 'Officiating Equipment',
    spec: 'LED Shot-Clock & Period Tracker',
    description: 'Battery powered with wireless remote',
    availableStock: 3,
    totalStock: 4,
    loanedStock: 1,
    maintenanceStock: 0,
    imageUrl: ASSETS.basketballsEquipment,
    quantity: 0
  },
  {
    id: 'eq-wh',
    name: 'Fox 40 Referee Whistles & Lanyards',
    category: 'Officiating Gear',
    spec: 'Pealess 115dB Sonic Whistle',
    description: 'Sanitized individually wrapped sets',
    availableStock: 12,
    totalStock: 15,
    loanedStock: 3,
    maintenanceStock: 0,
    imageUrl: ASSETS.volleyballsEquipment,
    quantity: 0
  }
];

export const INITIAL_ACTIVE_RESERVATION: Reservation = {
  id: 'REC-2025-8841',
  docket: '#CRS-8849-25',
  courtName: 'Basketball Court 1',
  courtSub: 'East Wing, Hardwood Arena',
  facilityDetail: 'East Gymnasium • Full Hardwood Floor A',
  dateStr: 'Today, Oct 24, 2025',
  isoDate: '2025-10-24',
  timeSlot: '04:00 PM – 05:00 PM',
  equipmentSummary: '2 Official Basketballs',
  equipmentDetails: [{ name: 'Official Basketballs', qty: 2 }],
  checkInLocation: 'Desk #2 North Locker Hall',
  status: 'Confirmed',
  studentName: 'Jamin Villareal',
  studentId: '20240396-C',
  studentEmail: 'jvillareal@athletics.univ.edu',
  isCheckedIn: false
};

export const INITIAL_ALL_RESERVATIONS: Reservation[] = [
  {
    id: 'REC-2025-8841',
    docket: '#CRS-8849-25',
    courtName: 'Basketball Court 1',
    courtSub: 'East Wing, Hardwood Arena',
    facilityDetail: 'East Gymnasium • Full Hardwood Floor A',
    dateStr: 'Today, Oct 24, 2025',
    isoDate: '2025-10-24',
    timeSlot: '04:00 PM – 05:00 PM',
    equipmentSummary: '2 Official Basketballs',
    equipmentDetails: [{ name: 'Official Basketballs', qty: 2 }],
    checkInLocation: 'Desk #2 North Locker Hall',
    status: 'Confirmed',
    studentName: 'Jamin Villareal',
    studentId: '20240396-C',
    studentEmail: 'jvillareal@athletics.univ.edu',
    isCheckedIn: false,
    notes: 'Varsity squad scrimmage prep'
  },
  {
    id: 'REC-2025-8839',
    docket: '#CRS-8839-25',
    courtName: 'Basketball Court 2',
    courtSub: 'West Wing, Main Fieldhouse',
    facilityDetail: 'West Wing • Annex Quad',
    dateStr: 'Today, Oct 24, 2025',
    isoDate: '2025-10-24',
    timeSlot: '02:00 PM – 03:00 PM',
    equipmentSummary: '1 Official Basketball',
    equipmentDetails: [{ name: 'Official Basketballs', qty: 1 }],
    checkInLocation: 'Desk #1 West Gate',
    status: 'In Progress',
    studentName: 'Elena Rostova',
    studentId: '20230184-E',
    studentEmail: 'erostova@athletics.univ.edu',
    isCheckedIn: true,
    notes: 'Intramural 3v3 tournament practice'
  },
  {
    id: 'REC-2025-8842',
    docket: '#CRS-8842-25',
    courtName: 'Volleyball Court 1',
    courtSub: 'South Pavilion, Olympic Net',
    facilityDetail: 'Olympic Tension Net • Pro Post',
    dateStr: 'Today, Oct 24, 2025',
    isoDate: '2025-10-24',
    timeSlot: '05:00 PM – 06:00 PM',
    equipmentSummary: '2 Volleyballs, 1 Whistle',
    equipmentDetails: [{ name: 'Indoor Volleyballs', qty: 2 }],
    checkInLocation: 'Desk #3 South Pavilion',
    status: 'Confirmed',
    studentName: 'Mateo Sanchez',
    studentId: '20240412-M',
    studentEmail: 'msanchez@athletics.univ.edu',
    isCheckedIn: false,
    notes: 'Club Volleyball scrimmage'
  },
  {
    id: 'REC-2025-8845',
    docket: '#CRS-8845-25',
    courtName: 'Basketball Court 1',
    courtSub: 'East Wing, Hardwood Arena',
    facilityDetail: 'East Gymnasium • Full Hardwood Floor A',
    dateStr: 'Tomorrow, Oct 25, 2025',
    isoDate: '2025-10-25',
    timeSlot: '09:00 AM – 11:00 AM',
    equipmentSummary: 'Varsity Full Court Gear & Timer',
    equipmentDetails: [{ name: 'Official Basketballs', qty: 4 }],
    checkInLocation: 'Main Arena Tunnel',
    status: 'Blocked / Varsity',
    studentName: 'Head Coach Marcus Hayes',
    studentId: 'FAC-70192',
    studentEmail: 'admin@athletics.univ.edu',
    isCheckedIn: true,
    notes: 'Official NCAA Men’s Varsity Team Practice'
  },
  {
    id: 'REC-2025-8848',
    docket: '#CRS-8848-25',
    courtName: 'Volleyball Court 2',
    courtSub: 'North Pavilion, Training Net',
    facilityDetail: 'Standard Training Net Rigging',
    dateStr: 'Tomorrow, Oct 25, 2025',
    isoDate: '2025-10-25',
    timeSlot: '03:00 PM – 04:00 PM',
    equipmentSummary: '1 Volleyball',
    equipmentDetails: [{ name: 'Indoor Volleyballs', qty: 1 }],
    checkInLocation: 'Desk #2 North Locker Hall',
    status: 'Pending Confirmation',
    studentName: 'Chloe Bennett',
    studentId: '20240529-B',
    studentEmail: 'cbennett@athletics.univ.edu',
    isCheckedIn: false,
    notes: 'Awaiting faculty approval'
  },
  {
    id: 'REC-2025-8835',
    docket: '#CRS-8835-25',
    courtName: 'Basketball Court 2',
    courtSub: 'West Wing, Main Fieldhouse',
    facilityDetail: 'West Wing • Annex Quad',
    dateStr: 'Yesterday, Oct 23, 2025',
    isoDate: '2025-10-23',
    timeSlot: '06:00 PM – 07:00 PM',
    equipmentSummary: '2 Basketballs',
    equipmentDetails: [{ name: 'Official Basketballs', qty: 2 }],
    checkInLocation: 'Desk #1 West Gate',
    status: 'Completed',
    studentName: 'Derrick Vance',
    studentId: '20230671-V',
    studentEmail: 'dvance@athletics.univ.edu',
    isCheckedIn: true,
    notes: 'Returned on schedule, equipment inspected'
  }
];

export const INITIAL_STUDENTS: StudentMember[] = [
  {
    id: 'stu-1',
    studentId: '20240396-C',
    name: 'Jamin Villareal',
    email: 'jvillareal@athletics.univ.edu',
    department: 'Computer Science / Varsity Athletics',
    eligibility: 'Active Full Member',
    activeBookingsCount: 1,
    totalHoursPlayed: 34,
    joinDate: 'Aug 2023'
  },
  {
    id: 'stu-2',
    studentId: '20230184-E',
    name: 'Elena Rostova',
    email: 'erostova@athletics.univ.edu',
    department: 'Mechanical Engineering',
    eligibility: 'Varsity Athlete',
    activeBookingsCount: 1,
    totalHoursPlayed: 52,
    joinDate: 'Jan 2023'
  },
  {
    id: 'stu-3',
    studentId: '20240412-M',
    name: 'Mateo Sanchez',
    email: 'msanchez@athletics.univ.edu',
    department: 'Kinesiology & Sports Science',
    eligibility: 'Active Full Member',
    activeBookingsCount: 1,
    totalHoursPlayed: 28,
    joinDate: 'Sep 2024'
  },
  {
    id: 'stu-4',
    studentId: '20240529-B',
    name: 'Chloe Bennett',
    email: 'cbennett@athletics.univ.edu',
    department: 'Business Administration',
    eligibility: 'Active Full Member',
    activeBookingsCount: 1,
    totalHoursPlayed: 14,
    joinDate: 'Feb 2024'
  },
  {
    id: 'stu-5',
    studentId: '20230671-V',
    name: 'Derrick Vance',
    email: 'dvance@athletics.univ.edu',
    department: 'Biological Sciences',
    eligibility: 'Active Full Member',
    activeBookingsCount: 0,
    totalHoursPlayed: 19,
    joinDate: 'Nov 2023'
  },
  {
    id: 'stu-6',
    studentId: '20240108-Z',
    name: 'Liam Zhang',
    email: 'lzhang@athletics.univ.edu',
    department: 'Architecture & Design',
    eligibility: 'Suspended',
    activeBookingsCount: 0,
    totalHoursPlayed: 8,
    joinDate: 'Mar 2024'
  }
];


export const INITIAL_HISTORY_RECORDS: BookingHistoryRecord[] = [
  {
    id: 'hist-1',
    courtName: 'Basketball Court 2',
    courtType: 'Basketball',
    date: 'Oct 18, 2025',
    timeSlot: '03:00 PM - 04:00 PM',
    equipmentRequested: '1 Basketball',
    status: 'Completed'
  },
  {
    id: 'hist-2',
    courtName: 'Volleyball Court 1',
    courtType: 'Volleyball',
    date: 'Oct 12, 2025',
    timeSlot: '05:00 PM - 06:00 PM',
    equipmentRequested: '2 Volleyballs',
    status: 'Completed'
  },
  {
    id: 'hist-3',
    courtName: 'Basketball Court 1',
    courtType: 'Basketball',
    date: 'Oct 05, 2025',
    timeSlot: '02:00 PM - 03:00 PM',
    equipmentRequested: 'None',
    status: 'Completed'
  },
  {
    id: 'hist-4',
    courtName: 'Volleyball Court 2',
    courtType: 'Volleyball',
    date: 'Sep 29, 2025',
    timeSlot: '04:00 PM - 05:00 PM',
    equipmentRequested: '1 Volleyball',
    status: 'Cancelled by User'
  }
];
