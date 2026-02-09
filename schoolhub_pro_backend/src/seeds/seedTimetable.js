const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Timetable = require('../models/Timetable');

// Class IDs
const L1 = '698861b52058a9526b7ae82f';
const L2 = '698861b52058a9526b7ae830';
const L3 = '698861b52058a9526b7ae831';

// Subject IDs
const ALGO1 = '698861b52058a9526b7ae83b';
const ANA1  = '698861b52058a9526b7ae841';
const ALG1  = '698861b52058a9526b7ae846';
const PHY1  = '698861b52058a9526b7ae84b';
const ANG1  = '698861b52058a9526b7ae850';
const INFO1 = '698861b52058a9526b7ae855';
const MAD1  = '698861b52058a9526b7ae85b';

const BDD2  = '698861b52058a9526b7ae861';
const POO2  = '698861b52058a9526b7ae867';
const RES2  = '698861b52058a9526b7ae86d';
const SYS2  = '698861b52058a9526b7ae872';
const STAT2 = '698861b52058a9526b7ae877';
const ARCH2 = '698861b52058a9526b7ae87c';
const WEB2  = '698861b52058a9526b7ae881';

const GL3    = '698861b52058a9526b7ae887';
const IA3    = '698861b62058a9526b7ae88d';
const SEC3   = '698861b62058a9526b7ae892';
const ADM3   = '698861b62058a9526b7ae897';
const PFE3   = '698861b62058a9526b7ae89c';
const COMP3  = '698861b62058a9526b7ae8a1';
const CLOUD3 = '698861b62058a9526b7ae8a6';

// Teacher IDs
const Diallo    = '698861b62058a9526b7ae8c5';
const Traore    = '698861b62058a9526b7ae8cb';
const Keita     = '698861b62058a9526b7ae8d1';
const Coulibaly = '698861b62058a9526b7ae8d7';
const Bah       = '698861b62058a9526b7ae8dd';
const Camara    = '698861b62058a9526b7ae8e3';
const Kone      = '698861b62058a9526b7ae8e9';
const Cisse     = '698861b62058a9526b7ae8ef';
const Sylla     = '698861b62058a9526b7ae8f5';
const Sangare   = '698861b62058a9526b7ae8fb';
const Diarra    = '698861b72058a9526b7ae901';
const Toure     = '698861b72058a9526b7ae907';
const Fofana    = '698861b72058a9526b7ae90d';
const Sidibe    = '698861b72058a9526b7ae913';
const Sow       = '698861b72058a9526b7ae919';

// Helper to build an entry
const entry = (classId, day, startTime, endTime, subjectId, teacherId, room, type = 'lecture') => ({
  classId, day, startTime, endTime, subjectId, teacherId, room, type
});

// Time slots: 1h intervals, 08:00-17:00
// Breaks: 09:55-10:05 (10min), 12:00-13:00 (lunch), 14:55-15:05 (10min)
// Course slots: 08:00-09:00, 09:00-09:55, 10:05-11:05, 11:05-12:00,
//               14:00-14:55, 15:05-16:05, 16:05-17:00
// NO courses during lunch (12:00-13:00)
//
// Each subject appears 2x/week. 3 slots/day Mon-Thu, 2 slots Fri = 14/class.
// Shared teachers: Diallo(L1+L2), Traore(L1+L2), Camara(L1+L2), Cisse(L2+L3)

const timetableEntries = [
  // ==================== MONDAY ====================
  entry(L1, 'Monday', '08:00', '09:00', ALGO1, Diallo, 'Amphi A', 'lecture'),
  entry(L2, 'Monday', '09:00', '09:55', BDD2, Kone, 'Salle 201', 'lecture'),
  entry(L3, 'Monday', '08:00', '09:00', GL3, Diarra, 'Salle 301', 'lecture'),

  entry(L1, 'Monday', '10:05', '11:05', ANA1, Traore, 'Amphi A', 'lecture'),
  entry(L2, 'Monday', '11:05', '12:00', POO2, Diallo, 'Salle 201', 'lecture'),
  entry(L3, 'Monday', '10:05', '11:05', IA3, Toure, 'Salle 301', 'lecture'),

  entry(L1, 'Monday', '14:00', '14:55', ALG1, Keita, 'Amphi A', 'lecture'),
  entry(L2, 'Monday', '14:00', '14:55', RES2, Cisse, 'Salle 201', 'lecture'),
  entry(L3, 'Monday', '15:05', '16:05', SEC3, Fofana, 'Salle 301', 'lecture'),

  // ==================== TUESDAY ====================
  entry(L1, 'Tuesday', '08:00', '09:00', PHY1, Coulibaly, 'Amphi B', 'lecture'),
  entry(L2, 'Tuesday', '09:00', '09:55', STAT2, Traore, 'Salle 201', 'lecture'),
  entry(L3, 'Tuesday', '08:00', '09:00', ADM3, Cisse, 'Lab 301', 'lab'),

  entry(L1, 'Tuesday', '10:05', '11:05', INFO1, Camara, 'Lab 101', 'lab'),
  entry(L2, 'Tuesday', '10:05', '11:05', SYS2, Sylla, 'Salle 202', 'lecture'),
  entry(L3, 'Tuesday', '10:05', '11:05', PFE3, Sow, 'Salle 301', 'tutorial'),

  entry(L1, 'Tuesday', '14:00', '14:55', MAD1, Keita, 'Amphi A', 'lecture'),
  entry(L2, 'Tuesday', '15:05', '16:05', ARCH2, Camara, 'Salle 201', 'lecture'),
  entry(L3, 'Tuesday', '14:00', '14:55', COMP3, Sidibe, 'Salle 302', 'lecture'),

  // ==================== WEDNESDAY ====================
  entry(L1, 'Wednesday', '09:00', '09:55', ANG1, Bah, 'Salle 102', 'lecture'),
  entry(L2, 'Wednesday', '08:00', '09:00', WEB2, Sangare, 'Lab 201', 'lab'),
  entry(L3, 'Wednesday', '08:00', '09:00', CLOUD3, Diarra, 'Lab 301', 'lab'),

  entry(L1, 'Wednesday', '11:05', '12:00', ALGO1, Diallo, 'Lab 101', 'lab'),
  entry(L2, 'Wednesday', '10:05', '11:05', BDD2, Kone, 'Lab 201', 'lab'),
  entry(L3, 'Wednesday', '10:05', '11:05', GL3, Diarra, 'Salle 301', 'tutorial'),

  entry(L1, 'Wednesday', '14:00', '14:55', ANA1, Traore, 'Amphi A', 'tutorial'),
  entry(L2, 'Wednesday', '14:00', '14:55', POO2, Diallo, 'Lab 202', 'lab'),
  entry(L3, 'Wednesday', '15:05', '16:05', IA3, Toure, 'Salle 302', 'tutorial'),

  // ==================== THURSDAY ====================
  entry(L1, 'Thursday', '08:00', '09:00', PHY1, Coulibaly, 'Lab 102', 'lab'),
  entry(L2, 'Thursday', '09:00', '09:55', RES2, Cisse, 'Lab 201', 'lab'),
  entry(L3, 'Thursday', '08:00', '09:00', PFE3, Sow, 'Salle 301', 'tutorial'),

  entry(L1, 'Thursday', '10:05', '11:05', ALG1, Keita, 'Amphi A', 'tutorial'),
  entry(L2, 'Thursday', '11:05', '12:00', STAT2, Traore, 'Salle 202', 'tutorial'),
  entry(L3, 'Thursday', '10:05', '11:05', SEC3, Fofana, 'Lab 302', 'lab'),

  entry(L1, 'Thursday', '14:00', '14:55', INFO1, Camara, 'Lab 101', 'lab'),
  entry(L2, 'Thursday', '14:00', '14:55', SYS2, Sylla, 'Lab 202', 'lab'),
  entry(L3, 'Thursday', '15:05', '16:05', ADM3, Cisse, 'Lab 301', 'lab'),

  // ==================== FRIDAY ====================
  entry(L1, 'Friday', '08:00', '09:00', MAD1, Keita, 'Amphi A', 'tutorial'),
  entry(L2, 'Friday', '09:00', '09:55', ARCH2, Camara, 'Salle 201', 'tutorial'),
  entry(L3, 'Friday', '08:00', '09:00', COMP3, Sidibe, 'Salle 302', 'tutorial'),

  entry(L1, 'Friday', '10:05', '11:05', ANG1, Bah, 'Salle 102', 'tutorial'),
  entry(L2, 'Friday', '11:05', '12:00', WEB2, Sangare, 'Lab 201', 'lab'),
  entry(L3, 'Friday', '10:05', '11:05', CLOUD3, Diarra, 'Lab 301', 'lab'),
];

async function seedTimetable() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing timetable data
    const deleted = await Timetable.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing timetable entries`);

    // Insert all entries
    const result = await Timetable.insertMany(timetableEntries);
    console.log(`Successfully created ${result.length} timetable entries`);

    // Summary
    const l1Count = result.filter(e => e.classId.toString() === L1).length;
    const l2Count = result.filter(e => e.classId.toString() === L2).length;
    const l3Count = result.filter(e => e.classId.toString() === L3).length;
    console.log(`  L1: ${l1Count} entries`);
    console.log(`  L2: ${l2Count} entries`);
    console.log(`  L3: ${l3Count} entries`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seedTimetable();
