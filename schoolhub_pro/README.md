# 🎓 SchoolHub Pro

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-47A248.svg)

**A comprehensive School Management System built with React, Node.js, and MongoDB**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

**SchoolHub Pro** is a full-featured school management system designed to streamline educational administration. It provides dedicated portals for administrators, teachers, students, and parents, each with role-specific features and dashboards.

---

## ✨ Features

### 🔐 Multi-Role Authentication
- **4 user types**: Admin, Teacher, Student, Parent
- JWT-based authentication
- Role-based access control

### 👨‍💼 Admin Portal
- Dashboard with school statistics
- Student, Teacher, and Parent management
- Class and Section management
- Subject and Timetable management
- Exam and Grade system configuration
- Fee management and financial reports
- Notice board management
- School settings customization

### 👨‍🏫 Teacher Portal
- Personal dashboard
- **My Classes** - View assigned classes
- **My Students** - Students from assigned classes
- **My Timetable** - Personal weekly schedule
- **Grades Management** - Enter student grades
- Attendance management
- Course materials management

### 👨‍🎓 Student Portal
- Personal dashboard with academic overview
- **My Fees** - View fee summary and payment status
- **My Attendance** - Attendance history and statistics
- **My Results** - Academic grades and report cards
- Course materials access
- Notices and announcements

### 👨‍👩‍👧 Parent Portal
- Children overview dashboard
- **Child Fees** - View children's fees
- **Child Attendance** - Attendance tracking per child
- **Child Results** - Academic performance
- **Child Timetable** - Class schedule
- School notices

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.0 | Build Tool |
| TailwindCSS | 3.4.6 | Styling |
| React Router | 6.0.2 | Routing |
| Redux Toolkit | 2.6.1 | State Management |
| Axios | 1.8.4 | HTTP Client |
| Recharts | 2.15.2 | Data Visualization |
| Lucide React | 0.484.0 | Icons |
| Framer Motion | 10.16.4 | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0.0 | Runtime |
| Express | 5.2.1 | Web Framework |
| MongoDB | ≥6.0 | Database |
| Mongoose | 9.1.4 | ODM |
| JWT | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password Hashing |
| Swagger | 6.2.8 | API Documentation |

---

## � Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

### Verify Installation

```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
mongod --version  # Should be >= 6.0
```

---

## � Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/schoolhub-pro.git
cd schoolhub-pro
```

### 2. Install Backend Dependencies

```bash
cd schoolhub_pro_backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../schoolhub_pro
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `schoolhub_pro_backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/schoolhub_pro

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Optional: File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend Configuration

Create a `.env` file in the `schoolhub_pro` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Option 1: Development Mode (Recommended)

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd schoolhub_pro_backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd schoolhub_pro
npm start
```

### Option 2: Production Mode

**Build Frontend:**
```bash
cd schoolhub_pro
npm run build
```

**Start Backend:**
```bash
cd schoolhub_pro_backend
npm start
```

### Accessing the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| API Documentation | http://localhost:5000/api-docs |

---

## 🔐 User Roles & Database Seeding

### Seeding the Database

The project includes a comprehensive seed script that populates the database with realistic sample data. This is essential for testing and development.

```bash
cd schoolhub_pro_backend
npm run seed
```

> ⚠️ **Warning**: Running the seed script will **clear all existing data** in the database before inserting new sample data.

### What Gets Created

The seed script creates the following data:

| Category | Count | Description |
|----------|-------|-------------|
| **Grade Scales** | 11 | Grades from A+ to F with GPA points |
| **Academic Years** | 3 | 2023-2024, 2024-2025 (active), 2025-2026 |
| **Semesters** | 2 | Semestre 1 (completed), Semestre 2 (active) |
| **Classes** | 3 | L1, L2, L3 (Licence Informatique) |
| **Sections** | 7 | Groups A, B, C per class level |
| **Subjects** | 21 | 7 subjects per class level |
| **Fee Types** | 7 | Tuition, Registration, Exam fees, etc. |
| **Admins** | 3 | Super Admin, Admin, Moderator |
| **Teachers** | 15 | With qualifications and assigned subjects |
| **Parents** | 100 | With contact info and addresses |
| **Students** | 109 | Distributed across all classes/sections |
| **Timetable Entries** | 42 | Weekly schedule (Mon-Fri) |
| **Exams** | 63 | Partiels and Finals for all subjects |
| **Exam Results** | ~4,600 | Realistic grades with distribution |
| **Attendance Records** | 140 | 20 school days × 7 sections |
| **Student Fees** | 700+ | Various payment statuses |
| **Payments** | 400+ | With receipt numbers |
| **Notices** | 12 | Announcements for all user types |
| **Course Materials** | 63 | PDFs for each subject (3 per subject) |

### Default Test Accounts

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@schoolhub.com | admin123 |
| **Admin** | jb.conde@schoolhub.com | admin123 |
| **Moderator** | mariama.bangoura@schoolhub.com | admin123 |
| **Teacher** (15 accounts) | mamadou.diallo@schoolhub.com | teacher123 |
| **Student** (10 accounts) | *(generated email)*@student.schoolhub.com | student123 |
| **Parent** (10 accounts) | *(generated email)*@email.com | parent123 |

> 💡 **Tip**: The first 10 students and parents have login accounts. Check the console output after seeding for the complete list of generated emails.

### Sample Data Features

- **Realistic Names**: Uses Guinean names (Amadou, Fatou, Diallo, Traore, etc.)
- **Academic Structure**: Based on Licence Informatique curriculum
- **Subjects Include**: 
  - L1: Programming, Mathematics, Physics, English
  - L2: Databases, OOP, Networks, Web Development  
  - L3: Software Engineering, AI, Security, Cloud Computing
- **Attendance**: ~88% present, ~4% late, ~8% absent distribution
- **Exam Grades**: Realistic bell curve around 55-65%
- **Fee Status**: 50% paid, 25% partial, 15% unpaid, 10% overdue


## 📚 API Documentation

The API is documented using Swagger. After starting the backend, visit:

```
http://localhost:5000/api-docs
```

### Main API Endpoints

| Resource | Endpoint | Description |
|----------|----------|-------------|
| Auth | `/api/auth/*` | Authentication (login, register) |
| Users | `/api/users/*` | User management |
| Students | `/api/students/*` | Student CRUD |
| Teachers | `/api/teachers/*` | Teacher CRUD |
| Parents | `/api/parents/*` | Parent CRUD |
| Classes | `/api/classes/*` | Class management |
| Subjects | `/api/subjects/*` | Subject CRUD |
| Exams | `/api/exams/*` | Exam management |
| Results | `/api/results/*` | Exam results |
| Attendance | `/api/attendance/*` | Attendance tracking |
| Fees | `/api/student-fees/*` | Fee management |
| Timetables | `/api/timetables/*` | Timetable CRUD |
| Notices | `/api/notices/*` | Announcements |

---

## 📁 Project Structure

```
schoolhub_pro/
├── schoolhub_pro/              # Frontend (React)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── navigation/     # Sidebars, headers, breadcrumbs
│   │   │   └── ui/             # Buttons, inputs, modals
│   │   ├── contexts/           # React contexts
│   │   ├── pages/              # Page components (40+ pages)
│   │   │   ├── admin-dashboard/
│   │   │   ├── teacher-dashboard/
│   │   │   ├── student-dashboard/
│   │   │   ├── parent-dashboard/
│   │   │   └── ...
│   │   ├── services/           # API service functions
│   │   ├── styles/             # CSS files
│   │   ├── Routes.jsx          # App routing
│   │   └── App.jsx             # Root component
│   ├── package.json
│   └── vite.config.js
│
└── schoolhub_pro_backend/      # Backend (Node.js/Express)
    ├── src/
    │   ├── controllers/        # Request handlers
    │   ├── middleware/         # Auth, validation, error handling
    │   ├── models/             # Mongoose schemas (20 models)
    │   ├── routes/             # API route definitions
    │   ├── app.js              # Express app setup
    │   └── seed.js             # Database seeder
    ├── uploads/                # File uploads
    └── package.json
```

---

## 📸 Screenshots

### Admin Dashboard
Modern admin interface with statistical widgets and quick actions.

### Teacher Portal
Clean teacher workspace with class management and grade entry.

### Student Portal
Student-focused view with academic progress and attendance.

### Parent Portal
Parent-friendly overview of children's academic performance.

---

## 👨‍💻 Author

**Yvan Zamorano**

- GitHub: [@yvan-zamorano](https://github.com/yvan-zamorano)
- Email: contact@yvanzamorano.com

---

## � License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [TailwindCSS](https://tailwindcss.com/) - For styling
- [MongoDB](https://www.mongodb.com/) - Database
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

<div align="center">

**⭐ Star this repository if you find it helpful! ⭐**

Made with ❤️ by Yvan Zamorano

</div>
