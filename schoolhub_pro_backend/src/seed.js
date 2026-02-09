const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Parent = require('./models/Parent');
const Class = require('./models/Class');
const Section = require('./models/Section');
const Subject = require('./models/Subject');
const AcademicYear = require('./models/AcademicYear');
const Semester = require('./models/Semester');
const GradeScale = require('./models/GradeScale');
const FeeType = require('./models/FeeType');
const Exam = require('./models/Exam');
const ExamResult = require('./models/ExamResult');
const Attendance = require('./models/Attendance');
const StudentFee = require('./models/StudentFee');
const Payment = require('./models/Payment');
const Notice = require('./models/Notice');
const CourseMaterial = require('./models/CourseMaterial');
const Timetable = require('./models/Timetable');

// ============================================================
// HELPER DATA
// ============================================================
const MALE_FIRST = [
  'Amadou','Mamadou','Ousmane','Ibrahim','Moussa','Abdoulaye','Sekou','Bakary',
  'Modibo','Souleymane','Youssouf','Cheick','Boubacar','Adama','Ismael','Tidiane',
  'Lamine','Djibril','Issa','Hamidou','Samba','Aliou','Ibrahima','Malick',
  'Dramane','Siaka','Bassirou','Demba','Kader','Thierno','Pape','Moctar',
  'Jean','Pierre','Paul','Francois','Laurent','Bernard','Philippe','Alassane',
  'Fode','Seydou','Oumar','Mohamed','Abdoul','Habib','Mamady','Lansana',
  'Karamo','Facinet','Alpha','Bangaly','Cece','Naby','Mory','Elhadj'
];
const FEMALE_FIRST = [
  'Fatou','Aminata','Mariam','Aissata','Kadiatou','Fatoumata','Oumou','Djeneba',
  'Awa','Bintou','Hawa','Ramata','Salimata','Rokia','Tenin','Assetou',
  'Korotoumou','Nana','Diariatou','Marie','Sophie','Catherine','Isabelle','Anne',
  'Nathalie','Sylvie','Fanta','Safiatou','Aicha','Maimouna','Djamilatou',
  'Hadja','Saran','Nassira','Mariama','Assitan','Kadidia','Tata','Coumba',
  'Nene','Chata','Sia','Kesso','Yaye','Dado','Binta','Dienaba'
];
const LAST_NAMES = [
  'Diallo','Traore','Coulibaly','Konate','Keita','Toure','Bah','Camara',
  'Diarra','Sylla','Kone','Sangare','Cisse','Dembele','Sacko','Fofana',
  'Sissoko','Maiga','Sidibe','Barry','Sow','Tall','Ndiaye','Fall',
  'Mbaye','Diop','Gueye','Conde','Bangoura','Soumah'
];
const OCCUPATIONS = [
  'Ingenieur','Medecin','Enseignant','Commercant','Comptable','Avocat',
  'Pharmacien','Architecte','Journaliste','Entrepreneur','Fonctionnaire',
  'Informaticien','Banquier','Agriculteur','Militaire','Policier',
  'Douanier','Mecanicien','Electricien','Menuisier'
];
const NEIGHBORHOODS = [
  'Kaloum','Dixinn','Matam','Ratoma','Matoto','Lambanyi','Kipe',
  'Nongo','Hamdallaye','Bambeto','Cosa','Sangoyah','Sonfonia','Koloma','Cimenterie'
];
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const PAYMENT_METHODS = ['Cash','Bank Transfer','Mobile Money','Check','Card'];

// Subject definitions per class level
const L1_SUBJECTS = [
  'Algorithmique et Programmation','Analyse Mathematique','Algebre Lineaire',
  'Physique Generale','Anglais Technique','Introduction a l\'Informatique','Mathematiques Discretes'
];
const L2_SUBJECTS = [
  'Bases de Donnees','Programmation Orientee Objet','Reseaux Informatiques',
  'Systemes d\'Exploitation','Probabilites et Statistiques','Architecture des Ordinateurs','Developpement Web'
];
const L3_SUBJECTS = [
  'Genie Logiciel','Intelligence Artificielle','Securite Informatique',
  'Administration Systemes','Projet de Fin d\'Etudes','Compilation','Cloud Computing'
];

// Subject details (code, hoursPerWeek, chapters)
const SUBJECT_DETAILS = {
  'Algorithmique et Programmation': { code: 'ALGO1', hours: 4, chapters: [
    { number: 1, title: 'Variables et Types', description: 'Types primitifs, variables, constantes', topics: 8 },
    { number: 2, title: 'Structures de Controle', description: 'Conditions, boucles, switch', topics: 10 },
    { number: 3, title: 'Fonctions et Procedures', description: 'Parametres, recursivite, portee', topics: 12 },
    { number: 4, title: 'Tableaux et Chaines', description: 'Tableaux 1D/2D, manipulation de chaines', topics: 8 }
  ]},
  'Analyse Mathematique': { code: 'ANA1', hours: 4, chapters: [
    { number: 1, title: 'Suites Numeriques', description: 'Convergence, series', topics: 10 },
    { number: 2, title: 'Fonctions Continues', description: 'Limites, continuite, derivabilite', topics: 12 },
    { number: 3, title: 'Integration', description: 'Integrales definies et indefinies', topics: 10 }
  ]},
  'Algebre Lineaire': { code: 'ALG1', hours: 3, chapters: [
    { number: 1, title: 'Espaces Vectoriels', description: 'Sous-espaces, bases, dimension', topics: 10 },
    { number: 2, title: 'Applications Lineaires', description: 'Noyau, image, rang', topics: 8 },
    { number: 3, title: 'Matrices et Determinants', description: 'Operations, inversion, systemes', topics: 12 }
  ]},
  'Physique Generale': { code: 'PHY1', hours: 3, chapters: [
    { number: 1, title: 'Mecanique du Point', description: 'Cinematique, dynamique', topics: 10 },
    { number: 2, title: 'Electrostatique', description: 'Charges, champs, potentiel', topics: 8 },
    { number: 3, title: 'Optique Geometrique', description: 'Lentilles, miroirs, instruments', topics: 6 }
  ]},
  'Anglais Technique': { code: 'ANG1', hours: 2, chapters: [
    { number: 1, title: 'Technical Vocabulary', description: 'IT terminology, acronyms', topics: 8 },
    { number: 2, title: 'Reading Comprehension', description: 'Technical articles, documentation', topics: 6 },
    { number: 3, title: 'Writing Skills', description: 'Reports, emails, documentation', topics: 6 }
  ]},
  'Introduction a l\'Informatique': { code: 'INFO1', hours: 3, chapters: [
    { number: 1, title: 'Histoire de l\'Informatique', description: 'Generations d\'ordinateurs', topics: 6 },
    { number: 2, title: 'Systemes de Numeration', description: 'Binaire, octal, hexadecimal', topics: 8 },
    { number: 3, title: 'Architecture de Base', description: 'CPU, memoire, bus', topics: 8 },
    { number: 4, title: 'Logiciels', description: 'Systemes, applications, bureautique', topics: 6 }
  ]},
  'Mathematiques Discretes': { code: 'MAD1', hours: 3, chapters: [
    { number: 1, title: 'Logique Propositionnelle', description: 'Propositions, tables de verite', topics: 8 },
    { number: 2, title: 'Theorie des Ensembles', description: 'Operations, relations', topics: 6 },
    { number: 3, title: 'Combinatoire', description: 'Permutations, combinaisons', topics: 8 },
    { number: 4, title: 'Theorie des Graphes', description: 'Parcours, arbres, plus court chemin', topics: 10 }
  ]},
  'Bases de Donnees': { code: 'BDD2', hours: 4, chapters: [
    { number: 1, title: 'Modele Relationnel', description: 'Relations, cles, contraintes', topics: 10 },
    { number: 2, title: 'SQL', description: 'DDL, DML, requetes complexes', topics: 14 },
    { number: 3, title: 'Normalisation', description: 'Formes normales 1NF-3NF, BCNF', topics: 8 },
    { number: 4, title: 'Administration', description: 'Index, vues, securite', topics: 6 }
  ]},
  'Programmation Orientee Objet': { code: 'POO2', hours: 4, chapters: [
    { number: 1, title: 'Classes et Objets', description: 'Encapsulation, constructeurs', topics: 10 },
    { number: 2, title: 'Heritage et Polymorphisme', description: 'Surcharge, redefinition, interfaces', topics: 12 },
    { number: 3, title: 'Design Patterns', description: 'Singleton, Factory, Observer', topics: 8 },
    { number: 4, title: 'Exceptions et Generiques', description: 'Gestion erreurs, templates', topics: 6 }
  ]},
  'Reseaux Informatiques': { code: 'RES2', hours: 3, chapters: [
    { number: 1, title: 'Modele OSI et TCP/IP', description: 'Couches, protocoles', topics: 10 },
    { number: 2, title: 'Adressage IP', description: 'IPv4, sous-reseaux, CIDR', topics: 8 },
    { number: 3, title: 'Protocoles Applicatifs', description: 'HTTP, DNS, DHCP, FTP', topics: 8 }
  ]},
  'Systemes d\'Exploitation': { code: 'SYS2', hours: 3, chapters: [
    { number: 1, title: 'Gestion des Processus', description: 'Creation, ordonnancement, synchronisation', topics: 10 },
    { number: 2, title: 'Gestion de la Memoire', description: 'Pagination, segmentation', topics: 8 },
    { number: 3, title: 'Systeme de Fichiers', description: 'FAT, NTFS, ext4, permissions', topics: 8 }
  ]},
  'Probabilites et Statistiques': { code: 'STAT2', hours: 3, chapters: [
    { number: 1, title: 'Probabilites', description: 'Evenements, lois, Bayes', topics: 10 },
    { number: 2, title: 'Variables Aleatoires', description: 'Discretes, continues, esperance', topics: 8 },
    { number: 3, title: 'Statistiques Descriptives', description: 'Moyenne, ecart-type, regression', topics: 8 }
  ]},
  'Architecture des Ordinateurs': { code: 'ARCH2', hours: 3, chapters: [
    { number: 1, title: 'Circuits Logiques', description: 'Portes, combinatoires, sequentiels', topics: 10 },
    { number: 2, title: 'Processeur', description: 'UAL, registres, pipeline', topics: 8 },
    { number: 3, title: 'Memoire et E/S', description: 'Hierarchie memoire, bus, peripheriques', topics: 8 }
  ]},
  'Developpement Web': { code: 'WEB2', hours: 3, chapters: [
    { number: 1, title: 'HTML/CSS', description: 'Structure, styles, responsive', topics: 10 },
    { number: 2, title: 'JavaScript', description: 'DOM, evenements, fetch API', topics: 12 },
    { number: 3, title: 'Backend', description: 'Node.js, Express, REST API', topics: 10 },
    { number: 4, title: 'Bases de Donnees Web', description: 'MongoDB, MySQL, ORM', topics: 8 }
  ]},
  'Genie Logiciel': { code: 'GL3', hours: 4, chapters: [
    { number: 1, title: 'Cycle de Vie', description: 'Cascade, Agile, Scrum', topics: 8 },
    { number: 2, title: 'Analyse et Conception', description: 'UML, diagrammes, architecture', topics: 12 },
    { number: 3, title: 'Tests et Qualite', description: 'Unitaires, integration, couverture', topics: 8 },
    { number: 4, title: 'Gestion de Projet', description: 'Planning, risques, outils', topics: 6 }
  ]},
  'Intelligence Artificielle': { code: 'IA3', hours: 3, chapters: [
    { number: 1, title: 'Recherche et Optimisation', description: 'A*, genetiques, heuristiques', topics: 10 },
    { number: 2, title: 'Apprentissage Automatique', description: 'Regression, classification, clustering', topics: 12 },
    { number: 3, title: 'Reseaux de Neurones', description: 'Perceptron, backpropagation, CNN', topics: 10 }
  ]},
  'Securite Informatique': { code: 'SEC3', hours: 3, chapters: [
    { number: 1, title: 'Cryptographie', description: 'Symetrique, asymetrique, hachage', topics: 10 },
    { number: 2, title: 'Securite Reseau', description: 'Firewall, VPN, IDS/IPS', topics: 8 },
    { number: 3, title: 'Securite Applicative', description: 'OWASP, injection, XSS', topics: 8 }
  ]},
  'Administration Systemes': { code: 'ADM3', hours: 3, chapters: [
    { number: 1, title: 'Linux Administration', description: 'Installation, configuration, services', topics: 10 },
    { number: 2, title: 'Virtualisation', description: 'VMware, Docker, conteneurs', topics: 8 },
    { number: 3, title: 'Supervision', description: 'Monitoring, logs, alertes', topics: 6 }
  ]},
  'Projet de Fin d\'Etudes': { code: 'PFE3', hours: 4, chapters: [
    { number: 1, title: 'Methodologie de Recherche', description: 'Problematique, etat de l\'art', topics: 6 },
    { number: 2, title: 'Conception et Realisation', description: 'Analyse, implementation', topics: 10 },
    { number: 3, title: 'Redaction et Soutenance', description: 'Memoire, presentation', topics: 4 }
  ]},
  'Compilation': { code: 'COMP3', hours: 3, chapters: [
    { number: 1, title: 'Analyse Lexicale', description: 'Automates, expressions regulieres', topics: 8 },
    { number: 2, title: 'Analyse Syntaxique', description: 'Grammaires, parsers LL/LR', topics: 10 },
    { number: 3, title: 'Generation de Code', description: 'Code intermediaire, optimisation', topics: 8 }
  ]},
  'Cloud Computing': { code: 'CLOUD3', hours: 3, chapters: [
    { number: 1, title: 'Concepts Cloud', description: 'IaaS, PaaS, SaaS, modeles', topics: 8 },
    { number: 2, title: 'Services Cloud', description: 'AWS, Azure, GCP, deploiement', topics: 10 },
    { number: 3, title: 'DevOps', description: 'CI/CD, Kubernetes, infrastructure as code', topics: 8 }
  ]}
};

// Teacher definitions
const TEACHER_DEFS = [
  { name: 'Dr. Mamadou Diallo', email: 'mamadou.diallo@schoolhub.com', phone: '+224620100001', subjects: ['Algorithmique et Programmation','Programmation Orientee Objet'], qualification: 'Doctorat en Informatique', experience: '12 ans' },
  { name: 'Prof. Aissata Traore', email: 'aissata.traore@schoolhub.com', phone: '+224620100002', subjects: ['Analyse Mathematique','Probabilites et Statistiques'], qualification: 'Doctorat en Mathematiques', experience: '15 ans' },
  { name: 'Dr. Ibrahim Keita', email: 'ibrahim.keita@schoolhub.com', phone: '+224620100003', subjects: ['Algebre Lineaire','Mathematiques Discretes'], qualification: 'Doctorat en Mathematiques', experience: '10 ans' },
  { name: 'M. Ousmane Coulibaly', email: 'ousmane.coulibaly@schoolhub.com', phone: '+224620100004', subjects: ['Physique Generale'], qualification: 'Master en Physique', experience: '8 ans' },
  { name: 'Mme. Catherine Bah', email: 'catherine.bah@schoolhub.com', phone: '+224620100005', subjects: ['Anglais Technique'], qualification: 'Master en Anglais', experience: '9 ans' },
  { name: 'Dr. Sekou Camara', email: 'sekou.camara@schoolhub.com', phone: '+224620100006', subjects: ['Introduction a l\'Informatique','Architecture des Ordinateurs'], qualification: 'Doctorat en Informatique', experience: '11 ans' },
  { name: 'Dr. Bakary Kone', email: 'bakary.kone@schoolhub.com', phone: '+224620100007', subjects: ['Bases de Donnees'], qualification: 'Doctorat en Informatique', experience: '9 ans' },
  { name: 'M. Tidiane Cisse', email: 'tidiane.cisse@schoolhub.com', phone: '+224620100008', subjects: ['Reseaux Informatiques','Administration Systemes'], qualification: 'Master en Reseaux', experience: '7 ans' },
  { name: 'Dr. Fatoumata Sylla', email: 'fatoumata.sylla@schoolhub.com', phone: '+224620100009', subjects: ['Systemes d\'Exploitation'], qualification: 'Doctorat en Informatique', experience: '8 ans' },
  { name: 'M. Lamine Sangare', email: 'lamine.sangare@schoolhub.com', phone: '+224620100010', subjects: ['Developpement Web'], qualification: 'Master en Informatique', experience: '5 ans' },
  { name: 'Dr. Boubacar Diarra', email: 'boubacar.diarra@schoolhub.com', phone: '+224620100011', subjects: ['Genie Logiciel','Cloud Computing'], qualification: 'Doctorat en Genie Logiciel', experience: '13 ans' },
  { name: 'Prof. Abdoulaye Toure', email: 'abdoulaye.toure@schoolhub.com', phone: '+224620100012', subjects: ['Intelligence Artificielle'], qualification: 'Doctorat en IA', experience: '14 ans' },
  { name: 'Dr. Aminata Fofana', email: 'aminata.fofana@schoolhub.com', phone: '+224620100013', subjects: ['Securite Informatique'], qualification: 'Doctorat en Cybersecurite', experience: '6 ans' },
  { name: 'M. Modibo Sidibe', email: 'modibo.sidibe@schoolhub.com', phone: '+224620100014', subjects: ['Compilation'], qualification: 'Master en Informatique', experience: '7 ans' },
  { name: 'Mme. Mariam Sow', email: 'mariam.sow@schoolhub.com', phone: '+224620100015', subjects: ['Projet de Fin d\'Etudes'], qualification: 'Doctorat en Informatique', experience: '10 ans' }
];

// ============================================================
// HELPERS
// ============================================================
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const generateSchoolDays = (startDate, count) => {
  const days = [];
  const d = new Date(startDate);
  while (days.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected for seeding...\n');
};

const seedData = async () => {
  try {
    await connectDB();

    // ==================== CLEAR ====================
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), Admin.deleteMany({}), Teacher.deleteMany({}),
      Student.deleteMany({}), Parent.deleteMany({}), Class.deleteMany({}),
      Section.deleteMany({}), Subject.deleteMany({}), AcademicYear.deleteMany({}),
      Semester.deleteMany({}), GradeScale.deleteMany({}), FeeType.deleteMany({}),
      Exam.deleteMany({}), ExamResult.deleteMany({}), Attendance.deleteMany({}),
      StudentFee.deleteMany({}), Payment.deleteMany({}), Notice.deleteMany({}),
      CourseMaterial.deleteMany({}), Timetable.deleteMany({})
    ]);
    console.log('  All collections cleared\n');

    // ==================== 1. GRADE SCALE ====================
    console.log('1/20 - Grade Scale...');
    const gradeScales = await GradeScale.insertMany([
      { grade: 'A+', minScore: 95, maxScore: 100, gpaPoints: 4.0, description: 'Excellent' },
      { grade: 'A',  minScore: 90, maxScore: 94,  gpaPoints: 4.0, description: 'Tres Bien' },
      { grade: 'A-', minScore: 85, maxScore: 89,  gpaPoints: 3.7, description: 'Tres Bien' },
      { grade: 'B+', minScore: 80, maxScore: 84,  gpaPoints: 3.3, description: 'Bien' },
      { grade: 'B',  minScore: 75, maxScore: 79,  gpaPoints: 3.0, description: 'Bien' },
      { grade: 'B-', minScore: 70, maxScore: 74,  gpaPoints: 2.7, description: 'Assez Bien' },
      { grade: 'C+', minScore: 65, maxScore: 69,  gpaPoints: 2.3, description: 'Passable' },
      { grade: 'C',  minScore: 60, maxScore: 64,  gpaPoints: 2.0, description: 'Passable' },
      { grade: 'C-', minScore: 55, maxScore: 59,  gpaPoints: 1.7, description: 'Insuffisant' },
      { grade: 'D',  minScore: 50, maxScore: 54,  gpaPoints: 1.0, description: 'Mediocre' },
      { grade: 'F',  minScore: 0,  maxScore: 49,  gpaPoints: 0.0, description: 'Echec' }
    ]);
    const getGrade = (pct) => {
      for (const g of gradeScales) {
        if (pct >= g.minScore && pct <= g.maxScore) return g.grade;
      }
      return 'F';
    };
    console.log(`  ${gradeScales.length} grade scales`);

    // ==================== 2. ACADEMIC YEARS ====================
    console.log('2/20 - Academic Years...');
    const ay1 = await AcademicYear.create({ name: '2023-2024', startDate: new Date('2023-10-01'), endDate: new Date('2024-07-31'), status: 'Completed' });
    const ay2 = await AcademicYear.create({ name: '2024-2025', startDate: new Date('2024-10-01'), endDate: new Date('2025-07-31'), status: 'Active' });
    const ay3 = await AcademicYear.create({ name: '2025-2026', startDate: new Date('2025-10-01'), endDate: new Date('2026-07-31'), status: 'Upcoming' });
    const currentYear = ay2;
    console.log('  3 academic years');

    // ==================== 3. SEMESTERS ====================
    console.log('3/20 - Semesters...');
    const sem1 = await Semester.create({ name: 'Semestre 1', academicYearId: currentYear._id, startDate: new Date('2024-10-01'), endDate: new Date('2025-02-15'), status: 'Completed' });
    const sem2 = await Semester.create({ name: 'Semestre 2', academicYearId: currentYear._id, startDate: new Date('2025-02-17'), endDate: new Date('2025-07-31'), status: 'Active' });
    console.log('  2 semesters');

    // ==================== 4. CLASSES ====================
    console.log('4/20 - Classes...');
    const classDocs = await Class.insertMany([
      { name: '1ere Annee (L1)', code: 'L1', description: 'Licence 1 - Informatique', academicYearId: currentYear._id, subjects: L1_SUBJECTS, isActive: true },
      { name: '2eme Annee (L2)', code: 'L2', description: 'Licence 2 - Informatique', academicYearId: currentYear._id, subjects: L2_SUBJECTS, isActive: true },
      { name: '3eme Annee (L3)', code: 'L3', description: 'Licence 3 - Informatique', academicYearId: currentYear._id, subjects: L3_SUBJECTS, isActive: true }
    ]);
    const [classL1, classL2, classL3] = classDocs;
    console.log(`  ${classDocs.length} classes`);

    // ==================== 5. SECTIONS ====================
    console.log('5/20 - Sections...');
    const sectionDocs = await Section.insertMany([
      { name: 'Groupe A', classId: classL1._id, room: 'Salle 101', capacity: 40 },
      { name: 'Groupe B', classId: classL1._id, room: 'Salle 102', capacity: 40 },
      { name: 'Groupe C', classId: classL1._id, room: 'Salle 103', capacity: 40 },
      { name: 'Groupe A', classId: classL2._id, room: 'Salle 201', capacity: 35 },
      { name: 'Groupe B', classId: classL2._id, room: 'Salle 202', capacity: 35 },
      { name: 'Groupe A', classId: classL3._id, room: 'Salle 301', capacity: 30 },
      { name: 'Groupe B', classId: classL3._id, room: 'Salle 302', capacity: 30 }
    ]);
    console.log(`  ${sectionDocs.length} sections`);

    // ==================== 6. SUBJECTS ====================
    console.log('6/20 - Subjects...');
    const subjectDocs = [];
    const classSubjectMap = [
      { cls: classL1, subjectNames: L1_SUBJECTS },
      { cls: classL2, subjectNames: L2_SUBJECTS },
      { cls: classL3, subjectNames: L3_SUBJECTS }
    ];
    for (const { cls, subjectNames } of classSubjectMap) {
      for (const sName of subjectNames) {
        const det = SUBJECT_DETAILS[sName];
        const sub = await Subject.create({
          name: sName, code: det.code, classId: cls._id,
          hoursPerWeek: det.hours, chapters: det.chapters
        });
        subjectDocs.push(sub);
      }
    }
    console.log(`  ${subjectDocs.length} subjects`);

    // ==================== 7. FEE TYPES ====================
    console.log('7/20 - Fee Types...');
    const feeTypes = await FeeType.insertMany([
      { name: 'Frais de Scolarite', description: 'Frais de scolarite annuels', amount: 500000, frequency: 'Annual', isActive: true },
      { name: 'Frais d\'Inscription', description: 'Frais d\'inscription unique', amount: 50000, frequency: 'One-time', isActive: true },
      { name: 'Frais d\'Examen', description: 'Frais d\'examen par semestre', amount: 25000, frequency: 'Semester', isActive: true },
      { name: 'Frais Informatiques', description: 'Acces salle informatique', amount: 35000, frequency: 'Annual', isActive: true },
      { name: 'Frais de Bibliotheque', description: 'Acces bibliotheque et ressources', amount: 15000, frequency: 'Annual', isActive: true },
      { name: 'Frais de Laboratoire', description: 'Acces laboratoire physique/electronique', amount: 30000, frequency: 'Annual', classId: classL1._id, isActive: true },
      { name: 'Frais de Sport', description: 'Activites sportives et equipements', amount: 10000, frequency: 'Annual', isActive: true }
    ]);
    console.log(`  ${feeTypes.length} fee types`);

    // ==================== 8. ADMINS ====================
    console.log('8/20 - Admins...');
    const adminDefs = [
      { name: 'Directeur General', email: 'admin@schoolhub.com', phone: '+224620200001', role: 'Super Admin', permissions: ['All'], userRole: 'super_admin' },
      { name: 'Jean-Baptiste Conde', email: 'jb.conde@schoolhub.com', phone: '+224620200002', role: 'Admin', permissions: ['Students','Teachers','Parents','Classes','Sections','Subjects','Exams','Attendance','Fees','Notices','Reports'], userRole: 'admin' },
      { name: 'Mariama Bangoura', email: 'mariama.bangoura@schoolhub.com', phone: '+224620200003', role: 'Moderator', permissions: ['Students','Parents','Notices'], userRole: 'moderator' }
    ];
    const admins = [];
    for (const a of adminDefs) {
      const admin = await Admin.create({ name: a.name, email: a.email, phone: a.phone, role: a.role, permissions: a.permissions, status: 'Active' });
      const user = await User.create({ email: a.email, password: 'admin123', role: a.userRole, profileId: admin._id, profileModel: 'Admin', isActive: true });
      admin.userId = user._id;
      await admin.save();
      admins.push(admin);
    }
    console.log(`  ${admins.length} admins`);

    // ==================== 9. TEACHERS ====================
    console.log('9/20 - Teachers...');
    const teachers = [];
    for (let i = 0; i < TEACHER_DEFS.length; i++) {
      const t = TEACHER_DEFS[i];
      // Determine classIds based on subjects
      const classIds = [];
      if (t.subjects.some(s => L1_SUBJECTS.includes(s))) classIds.push(classL1._id);
      if (t.subjects.some(s => L2_SUBJECTS.includes(s))) classIds.push(classL2._id);
      if (t.subjects.some(s => L3_SUBJECTS.includes(s))) classIds.push(classL3._id);

      const teacher = await Teacher.create({
        name: t.name, email: t.email, phone: t.phone,
        subjects: t.subjects, classIds,
        qualification: t.qualification, experience: t.experience,
        status: 'Active', joinDate: new Date(2024 - randomInt(0, 8), randomInt(0, 11), 1)
      });
      const user = await User.create({ email: t.email, password: 'teacher123', role: 'teacher', profileId: teacher._id, profileModel: 'Teacher', isActive: true });
      teacher.userId = user._id;
      await teacher.save();
      teachers.push(teacher);
    }
    console.log(`  ${teachers.length} teachers`);

    // ==================== 10. PARENTS ====================
    console.log('10/20 - Parents (100)...');
    const parents = [];
    for (let i = 0; i < 100; i++) {
      const isMale = i % 2 === 0;
      const firstName = isMale ? MALE_FIRST[i % MALE_FIRST.length] : FEMALE_FIRST[i % FEMALE_FIRST.length];
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      const emailBase = removeAccents(`${firstName}.${lastName}`).toLowerCase().replace(/[^a-z.]/g, '');

      const parent = await Parent.create({
        name: `${firstName} ${lastName}`,
        email: `${emailBase}${i}@email.com`,
        phone: `+224621${String(i).padStart(6, '0')}`,
        occupation: OCCUPATIONS[i % OCCUPATIONS.length],
        address: `${NEIGHBORHOODS[i % NEIGHBORHOODS.length]}, Conakry`,
        status: 'Active'
      });

      // Create user accounts for first 10 parents
      if (i < 10) {
        const user = await User.create({ email: parent.email, password: 'parent123', role: 'parent', profileId: parent._id, profileModel: 'Parent', isActive: true });
        parent.userId = user._id;
        await parent.save();
      }
      parents.push(parent);
      if ((i + 1) % 25 === 0) process.stdout.write(`  ... ${i + 1}/100\n`);
    }
    console.log(`  ${parents.length} parents`);

    // ==================== 11. STUDENTS ====================
    console.log('11/20 - Students (109)...');
    const allStudents = [];
    const sectionStudentMap = {}; // sectionId -> [student]

    // Distribution: L1 (3 sections x 18/18/16=52), L2 (2 x 16=32), L3 (2 x 13/12=25) = 109
    const classDistribution = [
      { cls: classL1, sections: sectionDocs.slice(0, 3), counts: [18, 18, 16] },
      { cls: classL2, sections: sectionDocs.slice(3, 5), counts: [16, 16] },
      { cls: classL3, sections: sectionDocs.slice(5, 7), counts: [13, 12] }
    ];

    let studentIdx = 0;
    for (const { cls, sections, counts } of classDistribution) {
      for (let si = 0; si < sections.length; si++) {
        const section = sections[si];
        sectionStudentMap[section._id.toString()] = [];

        for (let j = 0; j < counts[si]; j++) {
          const isMale = studentIdx % 2 === 0;
          const firstName = isMale
            ? MALE_FIRST[studentIdx % MALE_FIRST.length]
            : FEMALE_FIRST[studentIdx % FEMALE_FIRST.length];
          const parentIdx = studentIdx % 100;
          const parent = parents[parentIdx];
          const lastName = parent.name.split(' ').slice(-1)[0];
          const emailBase = removeAccents(`${firstName}.${lastName}`).toLowerCase().replace(/[^a-z.]/g, '');

          // Birth year based on class level
          const yearOffset = cls.code === 'L1' ? 2004 : cls.code === 'L2' ? 2003 : 2002;

          const student = await Student.create({
            name: `${firstName} ${lastName}`,
            email: `${emailBase}${studentIdx}@student.schoolhub.com`,
            phone: `+224622${String(studentIdx).padStart(6, '0')}`,
            dateOfBirth: new Date(yearOffset, randomInt(0, 11), randomInt(1, 28)),
            gender: isMale ? 'Male' : 'Female',
            bloodGroup: randomItem(BLOOD_GROUPS),
            address: parent.address,
            rollNumber: String(j + 1).padStart(3, '0'),
            classId: cls._id,
            sectionId: section._id,
            parentId: parent._id,
            parentName: parent.name,
            parentContact: parent.phone,
            parentEmail: parent.email,
            relationship: randomItem(['Father', 'Mother', 'Guardian']),
            status: 'Active',
            admissionDate: new Date(2024, 9, 1)
          });

          // User accounts for first 10 students
          if (studentIdx < 10) {
            const sUser = await User.create({ email: student.email, password: 'student123', role: 'student', profileId: student._id, profileModel: 'Student', isActive: true });
            student.userId = sUser._id;
            await student.save();
          }

          // Link to parent
          if (!parent.childrenIds) parent.childrenIds = [];
          parent.childrenIds.push(student._id);

          allStudents.push(student);
          sectionStudentMap[section._id.toString()].push(student);
          studentIdx++;
        }
      }
    }
    // Save parent childrenIds
    for (const parent of parents) {
      if (parent.childrenIds && parent.childrenIds.length > 0) await parent.save();
    }
    console.log(`  ${allStudents.length} students`);

    // ==================== 12. SECTION-TEACHER ASSIGNMENTS ====================
    console.log('12/20 - Section teacher assignments...');
    // Map teacher index -> subjects they teach
    const sectionTeacherMap = {
      L1: [
        { tIdx: 0, subject: 'Algorithmique et Programmation' },
        { tIdx: 1, subject: 'Analyse Mathematique' },
        { tIdx: 2, subject: 'Algebre Lineaire' },
        { tIdx: 2, subject: 'Mathematiques Discretes' },
        { tIdx: 3, subject: 'Physique Generale' },
        { tIdx: 4, subject: 'Anglais Technique' },
        { tIdx: 5, subject: 'Introduction a l\'Informatique' }
      ],
      L2: [
        { tIdx: 6, subject: 'Bases de Donnees' },
        { tIdx: 0, subject: 'Programmation Orientee Objet' },
        { tIdx: 7, subject: 'Reseaux Informatiques' },
        { tIdx: 8, subject: 'Systemes d\'Exploitation' },
        { tIdx: 1, subject: 'Probabilites et Statistiques' },
        { tIdx: 5, subject: 'Architecture des Ordinateurs' },
        { tIdx: 9, subject: 'Developpement Web' }
      ],
      L3: [
        { tIdx: 10, subject: 'Genie Logiciel' },
        { tIdx: 11, subject: 'Intelligence Artificielle' },
        { tIdx: 12, subject: 'Securite Informatique' },
        { tIdx: 7, subject: 'Administration Systemes' },
        { tIdx: 14, subject: 'Projet de Fin d\'Etudes' },
        { tIdx: 13, subject: 'Compilation' },
        { tIdx: 10, subject: 'Cloud Computing' }
      ]
    };
    for (const section of sectionDocs) {
      const classCode = classDocs.find(c => c._id.toString() === section.classId.toString()).code;
      const mapping = sectionTeacherMap[classCode] || [];
      section.teachers = mapping.map(m => ({
        teacherId: teachers[m.tIdx]._id,
        subject: m.subject
      }));
      await section.save();
    }
    console.log('  7 sections updated with teacher assignments');

    // ==================== 12b. TIMETABLE ====================
    console.log('12b/20 - Timetable...');
    // Build subject lookup: subjectName -> subjectDoc
    const subjectByName = {};
    for (const s of subjectDocs) subjectByName[s.name] = s;

    const ttEntry = (cls, day, startTime, endTime, subjectName, teacherIdx, room, type = 'lecture') => ({
      classId: cls._id,
      day, startTime, endTime,
      subjectId: subjectByName[subjectName]._id,
      teacherId: teachers[teacherIdx]._id,
      room, type
    });

    const timetableEntries = [
      // MONDAY
      ttEntry(classL1, 'Monday', '08:00', '09:00', 'Algorithmique et Programmation', 0, 'Amphi A'),
      ttEntry(classL2, 'Monday', '09:00', '09:55', 'Bases de Donnees', 6, 'Salle 201'),
      ttEntry(classL3, 'Monday', '08:00', '09:00', 'Genie Logiciel', 10, 'Salle 301'),
      ttEntry(classL1, 'Monday', '10:05', '11:05', 'Analyse Mathematique', 1, 'Amphi A'),
      ttEntry(classL2, 'Monday', '11:05', '12:00', 'Programmation Orientee Objet', 0, 'Salle 201'),
      ttEntry(classL3, 'Monday', '10:05', '11:05', 'Intelligence Artificielle', 11, 'Salle 301'),
      ttEntry(classL1, 'Monday', '14:00', '14:55', 'Algebre Lineaire', 2, 'Amphi A'),
      ttEntry(classL2, 'Monday', '14:00', '14:55', 'Reseaux Informatiques', 7, 'Salle 201'),
      ttEntry(classL3, 'Monday', '15:05', '16:05', 'Securite Informatique', 12, 'Salle 301'),

      // TUESDAY
      ttEntry(classL1, 'Tuesday', '08:00', '09:00', 'Physique Generale', 3, 'Amphi B'),
      ttEntry(classL2, 'Tuesday', '09:00', '09:55', 'Probabilites et Statistiques', 1, 'Salle 201'),
      ttEntry(classL3, 'Tuesday', '08:00', '09:00', 'Administration Systemes', 7, 'Lab 301', 'lab'),
      ttEntry(classL1, 'Tuesday', '10:05', '11:05', 'Introduction a l\'Informatique', 5, 'Lab 101', 'lab'),
      ttEntry(classL2, 'Tuesday', '10:05', '11:05', 'Systemes d\'Exploitation', 8, 'Salle 202'),
      ttEntry(classL3, 'Tuesday', '10:05', '11:05', 'Projet de Fin d\'Etudes', 14, 'Salle 301', 'tutorial'),
      ttEntry(classL1, 'Tuesday', '14:00', '14:55', 'Mathematiques Discretes', 2, 'Amphi A'),
      ttEntry(classL2, 'Tuesday', '15:05', '16:05', 'Architecture des Ordinateurs', 5, 'Salle 201'),
      ttEntry(classL3, 'Tuesday', '14:00', '14:55', 'Compilation', 13, 'Salle 302'),

      // WEDNESDAY
      ttEntry(classL1, 'Wednesday', '09:00', '09:55', 'Anglais Technique', 4, 'Salle 102'),
      ttEntry(classL2, 'Wednesday', '08:00', '09:00', 'Developpement Web', 9, 'Lab 201', 'lab'),
      ttEntry(classL3, 'Wednesday', '08:00', '09:00', 'Cloud Computing', 10, 'Lab 301', 'lab'),
      ttEntry(classL1, 'Wednesday', '11:05', '12:00', 'Algorithmique et Programmation', 0, 'Lab 101', 'lab'),
      ttEntry(classL2, 'Wednesday', '10:05', '11:05', 'Bases de Donnees', 6, 'Lab 201', 'lab'),
      ttEntry(classL3, 'Wednesday', '10:05', '11:05', 'Genie Logiciel', 10, 'Salle 301', 'tutorial'),
      ttEntry(classL1, 'Wednesday', '14:00', '14:55', 'Analyse Mathematique', 1, 'Amphi A', 'tutorial'),
      ttEntry(classL2, 'Wednesday', '14:00', '14:55', 'Programmation Orientee Objet', 0, 'Lab 202', 'lab'),
      ttEntry(classL3, 'Wednesday', '15:05', '16:05', 'Intelligence Artificielle', 11, 'Salle 302', 'tutorial'),

      // THURSDAY
      ttEntry(classL1, 'Thursday', '08:00', '09:00', 'Physique Generale', 3, 'Lab 102', 'lab'),
      ttEntry(classL2, 'Thursday', '09:00', '09:55', 'Reseaux Informatiques', 7, 'Lab 201', 'lab'),
      ttEntry(classL3, 'Thursday', '08:00', '09:00', 'Projet de Fin d\'Etudes', 14, 'Salle 301', 'tutorial'),
      ttEntry(classL1, 'Thursday', '10:05', '11:05', 'Algebre Lineaire', 2, 'Amphi A', 'tutorial'),
      ttEntry(classL2, 'Thursday', '11:05', '12:00', 'Probabilites et Statistiques', 1, 'Salle 202', 'tutorial'),
      ttEntry(classL3, 'Thursday', '10:05', '11:05', 'Securite Informatique', 12, 'Lab 302', 'lab'),
      ttEntry(classL1, 'Thursday', '14:00', '14:55', 'Introduction a l\'Informatique', 5, 'Lab 101', 'lab'),
      ttEntry(classL2, 'Thursday', '14:00', '14:55', 'Systemes d\'Exploitation', 8, 'Lab 202', 'lab'),
      ttEntry(classL3, 'Thursday', '15:05', '16:05', 'Administration Systemes', 7, 'Lab 301', 'lab'),

      // FRIDAY
      ttEntry(classL1, 'Friday', '08:00', '09:00', 'Mathematiques Discretes', 2, 'Amphi A', 'tutorial'),
      ttEntry(classL2, 'Friday', '09:00', '09:55', 'Architecture des Ordinateurs', 5, 'Salle 201', 'tutorial'),
      ttEntry(classL3, 'Friday', '08:00', '09:00', 'Compilation', 13, 'Salle 302', 'tutorial'),
      ttEntry(classL1, 'Friday', '10:05', '11:05', 'Anglais Technique', 4, 'Salle 102', 'tutorial'),
      ttEntry(classL2, 'Friday', '11:05', '12:00', 'Developpement Web', 9, 'Lab 201', 'lab'),
      ttEntry(classL3, 'Friday', '10:05', '11:05', 'Cloud Computing', 10, 'Lab 301', 'lab')
    ];

    const timetableDocs = await Timetable.insertMany(timetableEntries);
    console.log(`  ${timetableDocs.length} timetable entries`);

    // ==================== 13. EXAMS ====================
    console.log('13/20 - Exams...');
    const examBulk = [];
    for (const sub of subjectDocs) {
      const classCode = classDocs.find(c => c._id.toString() === sub.classId.toString()).code;

      // Partiel S1 (completed)
      examBulk.push({
        title: `Partiel S1 - ${sub.name}`,
        subjectId: sub._id, classId: sub.classId, semesterId: sem1._id,
        date: new Date('2024-12-' + String(randomInt(10, 20)).padStart(2, '0')),
        duration: 90, totalMarks: 100, passingMarks: 50, status: 'completed'
      });
      // Examen Final S1 (completed)
      examBulk.push({
        title: `Examen Final S1 - ${sub.name}`,
        subjectId: sub._id, classId: sub.classId, semesterId: sem1._id,
        date: new Date('2025-02-' + String(randomInt(1, 10)).padStart(2, '0')),
        duration: 120, totalMarks: 100, passingMarks: 50, status: 'completed'
      });
      // Partiel S2 (upcoming)
      examBulk.push({
        title: `Partiel S2 - ${sub.name}`,
        subjectId: sub._id, classId: sub.classId, semesterId: sem2._id,
        date: new Date('2025-04-' + String(randomInt(14, 25)).padStart(2, '0')),
        duration: 90, totalMarks: 100, passingMarks: 50, status: 'upcoming'
      });
    }
    const examDocs = await Exam.insertMany(examBulk);
    console.log(`  ${examDocs.length} exams`);

    // ==================== 14. EXAM RESULTS ====================
    console.log('14/20 - Exam Results...');
    const completedExams = examDocs.filter(e => e.status === 'completed');
    let resultsBatch = [];
    let resultsCount = 0;

    for (const exam of completedExams) {
      const examStudents = allStudents.filter(s => s.classId.toString() === exam.classId.toString());
      for (const student of examStudents) {
        // Realistic distribution around 55-65
        const marks = Math.min(100, Math.max(5, Math.floor(55 + (Math.random() + Math.random() + Math.random() - 1.5) * 25)));
        const percentage = (marks / exam.totalMarks) * 100;
        resultsBatch.push({
          examId: exam._id, studentId: student._id,
          marksObtained: marks, grade: getGrade(percentage),
          percentage, isPassed: marks >= exam.passingMarks,
          remarks: marks >= 80 ? 'Excellent travail' : marks >= 60 ? 'Bon travail' : marks >= 50 ? 'Passable' : 'A ameliorer'
        });
        resultsCount++;
      }
      // Insert in batches of 500
      if (resultsBatch.length >= 500) {
        await ExamResult.insertMany(resultsBatch);
        resultsBatch = [];
      }
    }
    if (resultsBatch.length > 0) await ExamResult.insertMany(resultsBatch);
    console.log(`  ${resultsCount} exam results`);

    // ==================== 15. ATTENDANCE ====================
    console.log('15/20 - Attendance...');
    const schoolDays = generateSchoolDays(new Date('2025-01-06'), 20);
    const attendanceBulk = [];

    for (const section of sectionDocs) {
      const students = sectionStudentMap[section._id.toString()] || [];
      // Find a teacher for this section
      const classCode = classDocs.find(c => c._id.toString() === section.classId.toString()).code;
      const teacherIdx = classCode === 'L1' ? 0 : classCode === 'L2' ? 6 : 10;

      for (const day of schoolDays) {
        attendanceBulk.push({
          classId: section.classId,
          sectionId: section._id,
          date: day,
          records: students.map(s => ({
            studentId: s._id,
            status: Math.random() > 0.12 ? (Math.random() > 0.08 ? 'present' : 'late') : 'absent'
          })),
          recordedBy: teachers[teacherIdx]._id
        });
      }
    }
    await Attendance.insertMany(attendanceBulk);
    console.log(`  ${attendanceBulk.length} attendance records`);

    // ==================== 16. STUDENT FEES ====================
    console.log('16/20 - Student Fees...');
    const studentFeeBulk = [];
    for (const student of allStudents) {
      // Assign all 7 fee types, but Frais de Laboratoire (index 5) only for L1 students
      const studentFeeTypes = feeTypes.filter(ft =>
        !ft.classId || ft.classId.toString() === student.classId.toString()
      );
      for (const ft of studentFeeTypes) {
        const rand = Math.random();
        let paidAmount, status;
        if (rand < 0.50) {
          paidAmount = ft.amount; status = 'Paid';
        } else if (rand < 0.75) {
          paidAmount = Math.round(ft.amount * (0.2 + Math.random() * 0.6));
          status = 'Partially Paid';
        } else if (rand < 0.90) {
          paidAmount = 0; status = 'Unpaid';
        } else {
          paidAmount = 0; status = 'Overdue';
        }

        studentFeeBulk.push({
          studentId: student._id,
          feeTypeId: ft._id,
          academicYearId: currentYear._id,
          totalAmount: ft.amount,
          paidAmount,
          dueDate: new Date('2025-01-31'),
          status
        });
      }
    }
    const studentFeeDocs = await StudentFee.insertMany(studentFeeBulk);
    console.log(`  ${studentFeeDocs.length} student fees`);

    // ==================== 17. PAYMENTS ====================
    console.log('17/20 - Payments...');
    const paymentBulk = [];
    let receiptIdx = 0;
    const paidFees = studentFeeDocs.filter(f => f.paidAmount > 0);

    for (const fee of paidFees) {
      receiptIdx++;
      paymentBulk.push({
        studentFeeId: fee._id,
        studentId: fee.studentId,
        amount: fee.paidAmount,
        paymentMethod: randomItem(PAYMENT_METHODS),
        paymentDate: new Date(new Date().getFullYear(), new Date().getMonth() - randomInt(0, 5), randomInt(1, 28)),
        receiptNumber: `RCP2425${String(receiptIdx).padStart(4, '0')}`,
        receivedBy: 'Bureau des Finances',
        notes: fee.paidAmount >= fee.totalAmount ? 'Paiement complet' : 'Paiement partiel'
      });
    }
    await Payment.insertMany(paymentBulk);
    console.log(`  ${paymentBulk.length} payments`);

    // ==================== 18. NOTICES ====================
    console.log('18/20 - Notices...');
    const notices = await Notice.insertMany([
      { title: 'Rentree Universitaire 2024-2025', content: 'La rentree universitaire est fixee au 1er Octobre 2024. Tous les etudiants sont pries de se presenter munis de leur carte d\'etudiant et du recu de paiement des frais d\'inscription.', target: 'All', priority: 'High', author: 'Direction Generale', publishDate: new Date('2024-09-15'), status: 'Published', views: 2340 },
      { title: 'Calendrier des Examens Semestre 1', content: 'Les examens du premier semestre se derouleront du 1er au 15 Fevrier 2025. Les emplois du temps detailles seront affiches une semaine avant le debut des epreuves. Tout etudiant n\'ayant pas regle ses frais d\'examen ne sera pas autorise a composer.', target: 'Students', priority: 'High', author: 'Service de la Scolarite', publishDate: new Date('2025-01-10'), status: 'Published', views: 1890 },
      { title: 'Reunion Pedagogique - Corps Enseignant', content: 'Une reunion pedagogique est programmee le 20 Janvier 2025 a 10h dans l\'amphitheatre A. Tous les enseignants sont tenus d\'y participer. Ordre du jour: bilan du semestre 1, preparation du semestre 2.', target: 'Teachers', priority: 'High', author: 'Doyen de la Faculte', publishDate: new Date('2025-01-15'), status: 'Published', views: 42 },
      { title: 'Paiement des Frais - Rappel', content: 'Chers parents, nous vous rappelons que les frais de scolarite du second semestre sont a regler avant le 31 Janvier 2025. Passe ce delai, une penalite de 10% sera appliquee. Le bureau des finances est ouvert du lundi au vendredi de 8h a 16h.', target: 'Parents', priority: 'High', author: 'Bureau des Finances', publishDate: new Date('2025-01-20'), status: 'Published', views: 1456 },
      { title: 'Concours de Programmation Inter-Universitaire', content: 'L\'universite organise un concours de programmation ouvert aux etudiants de toutes les annees. Les inscriptions sont ouvertes jusqu\'au 15 Mars 2025. Les equipes de 3 personnes sont invitees a s\'inscrire aupres du Dr. Mamadou Diallo.', target: 'Students', priority: 'Normal', author: 'Departement Informatique', publishDate: new Date('2025-02-01'), status: 'Published', views: 678 },
      { title: 'Stage Obligatoire - L3', content: 'Les etudiants de 3eme annee sont informes que le stage de fin d\'etudes de 3 mois debutera en Mai 2025. Les conventions de stage doivent etre deposees avant le 15 Mars. Contactez Mme. Mariam Sow pour plus d\'informations.', target: 'Students', priority: 'High', author: 'Service des Stages', publishDate: new Date('2025-02-03'), status: 'Published', views: 234 },
      { title: 'Nouvelles Ressources Bibliotheque', content: 'La bibliotheque universitaire a acquis de nouveaux ouvrages et abonnements numeriques couvrant: intelligence artificielle, cybersecurite, cloud computing et genie logiciel. Consultation libre avec carte d\'etudiant.', target: 'All', priority: 'Low', author: 'Bibliotheque', publishDate: new Date('2025-02-05'), status: 'Published', views: 345 },
      { title: 'Journee Portes Ouvertes', content: 'La faculte organise une journee portes ouvertes le 1er Mars 2025 destinee aux futurs bacheliers. Les enseignants et etudiants volontaires sont invites a participer pour presenter les formations et les debouches.', target: 'All', priority: 'Normal', author: 'Service Communication', publishDate: new Date('2025-02-06'), status: 'Published', views: 567 },
      { title: 'Maintenance Salle Informatique', content: 'La salle informatique sera fermee pour maintenance les 10 et 11 Fevrier 2025. Les travaux pratiques prevus ces jours-la seront reprogrammes. Veuillez consulter le nouvel emploi du temps sur le portail.', target: 'Students', priority: 'Normal', author: 'Service Technique', publishDate: new Date('2025-02-07'), status: 'Published', views: 456 },
      { title: 'Tournoi Sportif Inter-Facultes', content: 'Le tournoi sportif inter-facultes (football, basketball, volleyball) se tiendra du 10 au 14 Mars 2025. Les inscriptions sont ouvertes. Venez representer la faculte d\'informatique!', target: 'Students', priority: 'Normal', author: 'Service des Sports', publishDate: new Date('2025-02-07'), status: 'Published', views: 389 },
      { title: 'Conference: IA et Developpement en Afrique', content: 'Le Prof. Abdoulaye Toure donnera une conference sur l\'Intelligence Artificielle et son impact sur le developpement en Afrique le 20 Fevrier 2025 a 14h dans l\'amphitheatre principal. Entree libre.', target: 'All', priority: 'Normal', author: 'Departement Informatique', publishDate: new Date('2025-02-08'), status: 'Published', views: 234 },
      { title: 'Resultats Semestre 1 - Deliberation', content: 'Les deliberations du premier semestre auront lieu le 25 Fevrier 2025. Les resultats seront affiches le lendemain au tableau d\'affichage et disponibles sur le portail etudiant.', target: 'Students', priority: 'High', author: 'Jury d\'Examen', publishDate: new Date('2025-02-08'), status: 'Draft', views: 0 }
    ]);
    console.log(`  ${notices.length} notices`);

    // ==================== 19. COURSE MATERIALS ====================
    console.log('19/20 - Course Materials...');
    const materialBulk = [];
    const materialTypes = ['Course', 'Assignment', 'Worksheet', 'Solution'];

    for (const sub of subjectDocs) {
      const teacherDef = TEACHER_DEFS.find(t => t.subjects.includes(sub.name));
      const teacherDoc = teacherDef ? teachers[TEACHER_DEFS.indexOf(teacherDef)] : teachers[0];

      for (let i = 0; i < 3; i++) {
        const mType = materialTypes[i % materialTypes.length];
        materialBulk.push({
          title: `${sub.name} - ${mType === 'Course' ? 'Cours' : mType === 'Assignment' ? 'TD' : mType === 'Worksheet' ? 'TP' : 'Corrige'} ${i + 1}`,
          description: `${mType} pour ${sub.name} - Chapitre ${i + 1}`,
          type: mType,
          subjectId: sub._id,
          classId: sub.classId,
          fileName: `${sub.code.toLowerCase()}_${mType.toLowerCase()}_${i + 1}.pdf`,
          fileSize: 1024 * randomInt(200, 2000),
          fileType: 'application/pdf',
          uploadedBy: teacherDoc._id,
          downloads: randomInt(5, 80)
        });
      }
    }
    const materials = await CourseMaterial.insertMany(materialBulk);
    console.log(`  ${materials.length} course materials`);

    // ==================== 20. SUMMARY ====================
    const totalFeesPaid = paidFees.reduce((s, f) => s + f.paidAmount, 0);
    const totalFeesExpected = studentFeeDocs.reduce((s, f) => s + f.totalAmount, 0);

    console.log('\n========================================================');
    console.log('         SEED COMPLETE - UNIVERSITE SCHOOLHUB PRO');
    console.log('         Departement d\'Informatique');
    console.log('========================================================');
    console.log(`\n  Grade Scales:       ${gradeScales.length}`);
    console.log(`  Academic Years:     3`);
    console.log(`  Semesters:          2`);
    console.log(`  Classes:            ${classDocs.length} (L1, L2, L3)`);
    console.log(`  Sections:           ${sectionDocs.length}`);
    console.log(`  Subjects:           ${subjectDocs.length}`);
    console.log(`  Fee Types:          ${feeTypes.length}`);
    console.log(`  Admins:             ${admins.length}`);
    console.log(`  Teachers:           ${teachers.length}`);
    console.log(`  Parents:            ${parents.length}`);
    console.log(`  Students:           ${allStudents.length}`);
    console.log(`  Exams:              ${examDocs.length}`);
    console.log(`  Exam Results:       ${resultsCount}`);
    console.log(`  Attendance Records: ${attendanceBulk.length}`);
    console.log(`  Student Fees:       ${studentFeeDocs.length}`);
    console.log(`  Payments:           ${paymentBulk.length}`);
    console.log(`  Notices:            ${notices.length}`);
    console.log(`  Timetable Entries:  ${timetableDocs.length}`);
    console.log(`  Course Materials:   ${materials.length}`);
    console.log(`\n  Finances:`);
    console.log(`  - Total attendu:    ${totalFeesExpected.toLocaleString()} FCFA`);
    console.log(`  - Total paye:       ${totalFeesPaid.toLocaleString()} FCFA`);
    console.log(`  - Taux recouvrement: ${Math.round(totalFeesPaid / totalFeesExpected * 100)}%`);
    console.log(`\n  Comptes de Test:`);
    console.log(`  - Admin:    admin@schoolhub.com / admin123`);
    console.log(`  - Teacher:  mamadou.diallo@schoolhub.com / teacher123`);
    console.log(`  - Student:  ${allStudents[0].email} / student123`);
    console.log(`  - Parent:   ${parents[0].email} / parent123`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\nSeed error:', err);
    process.exit(1);
  }
};

seedData();
