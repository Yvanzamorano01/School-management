# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SchoolHub Pro is a school management system with a React frontend and Node.js/Express backend using MongoDB. The repo is a monorepo with two top-level directories: `schoolhub_pro/` (frontend) and `schoolhub_pro_backend/` (backend).

## Development Commands

### Frontend (`schoolhub_pro/`)
```bash
npm start          # Vite dev server at http://localhost:4028
npm run build      # Production build → dist/
npm run serve      # Preview production build
```

### Backend (`schoolhub_pro_backend/`)
```bash
npm run dev        # Start with nodemon (auto-reload) on port 5000
npm start          # Production mode
npm run seed       # Clear and repopulate DB with ~4600 sample records
```

### Running Both
Start backend first (`npm run dev`), then frontend (`npm start`) in a separate terminal.

### Environment Variables
- Frontend: `VITE_API_BASE_URL` (default: `http://localhost:5000/api`)
- Backend: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV`, `FRONTEND_URL` (for CORS)
- See `schoolhub_pro_backend/.env.example` for backend defaults

### API Documentation
Swagger UI available at `http://localhost:5000/api-docs` when backend is running.

## Architecture

### Frontend (`schoolhub_pro/src/`)

**Routing**: `Routes.jsx` defines all routes inside `<BrowserRouter>`. Pages are role-specific (admin, teacher, student, parent dashboards and portals).

**API Layer**: All API calls go through service files in `services/`. The base Axios instance (`services/api.js`) handles:
- JWT token injection via request interceptor (token stored in `localStorage`)
- Response normalization: backend returns `{ success: true, data: ... }`, the interceptor unwraps so `response.data` contains the actual payload
- Auto-redirect to login on 401 (except public pages)

**State Management**: No Redux store is wired up despite the dependency. State is managed via:
- `localStorage` for auth (token, user, role)
- `SchoolSettingsContext` for theme/appearance (currency, logo, colors, dark mode)
- Local `useState` within components

**Page Structure**: Each page follows this layout pattern:
```
<RoleSidebar> + <main> with <AuthHeader> + <Breadcrumb> + content
```
Sidebars are role-specific: `AdminSidebar`, `TeacherSidebar`, `StudentSidebar`, `ParentSidebar`.

**Styling**: TailwindCSS with CSS variable-based theming. Theme variables defined in `styles/tailwind.css` (`:root` and `.dark` classes). Custom fonts: Lexend (headings), Source Sans 3 (body), JetBrains Mono (data).

**Imports**: `jsconfig.json` sets `baseUrl: ./src`, enabling absolute imports like `import X from 'components/...'`.

### Backend (`schoolhub_pro_backend/src/`)

**Request Flow**: Route → `auth` middleware (JWT) → `roleCheck`/`hasPermission` → Controller → Response

**Response Format**: All controllers return `{ success: true/false, data/message: ... }`.

**Auth System**:
- 7 roles: `super_admin`, `admin`, `moderator`, `teacher`, `student`, `parent`, `bursar`
- JWT tokens with configurable expiry
- `roleCheck(...roles)` for role gating, `hasPermission(perm)` for granular admin permissions
- Admin rank hierarchy prevents lower-ranked admins from modifying higher-ranked ones
- Common role combos exported: `isAdmin`, `isTeacher`, `isFinance`, `isStaff`

**User Model**: Polymorphic profile references via `profileId` + `profileModel` fields pointing to role-specific models (Admin, Teacher, Student, Parent).

**File Uploads**: Multer middleware (`middleware/upload.js`), files stored in `uploads/` directory.

**Database**: MongoDB via Mongoose. 21 models covering users, academics (Class, Section, Subject, Exam), finance (StudentFee, Payment, FeeType), and operations (Attendance, Timetable, Notice).

### Key Conventions
- Backend controllers use `try/catch` with errors passed to `next()` for the centralized error handler
- Frontend services return axios promises; components handle loading/error states locally
- Student model denormalizes parent info (parentName, parentContact) to avoid joins
- All backend routes have `@swagger` JSDoc annotations

### Seeded Test Credentials
After running `npm run seed`:
- Admin: `admin@schoolhub.com` / `admin123`
- Teacher: `mamadou.diallo@schoolhub.com` / `teacher123`
- Student passwords: `student123`
- Parent passwords: `parent123`
