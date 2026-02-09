# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start     # Start dev server on http://localhost:4028
npm run build # Build for production (outputs to /build)
npm run serve # Preview production build
```

## Architecture

**SchoolHub Pro** is a school management system built with React 18 + Vite. It provides role-based dashboards for admins, teachers, students, parents, and bursars (finance).

### Import Aliases

The project uses `./src` as baseUrl (jsconfig.json). Import from `src/` directly:
```jsx
import Button from 'components/ui/Button';
import { cn } from 'utils/cn';
```

### Page Structure

Each page follows this pattern:
```
src/pages/{page-name}/
  index.jsx           # Main page component with sidebar layout
  components/         # Page-specific components
```

Pages use role-specific sidebars from `src/components/navigation/`:
- `AdminSidebar.jsx` - Admin dashboard pages
- `TeacherSidebar.jsx` - Teacher pages
- `StudentSidebar.jsx` - Student pages
- `ParentSidebar.jsx` - Parent pages
- `BursarSidebar.jsx` - Finance pages

### UI Components

Reusable components in `src/components/ui/` use:
- **class-variance-authority (cva)** for variant styling
- **cn utility** (`utils/cn.js`) - combines clsx + tailwind-merge
- **lucide-react** icons via `AppIcon.jsx`

Button variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `success`, `warning`, `danger`

### Styling

- **TailwindCSS** with CSS variables for theming (light/dark mode via `.dark` class)
- Design tokens in `src/styles/tailwind.css` (colors, fonts)
- Fonts: Lexend (headings), Source Sans 3 (body), Inter (captions), JetBrains Mono (data/tables)
- Semantic colors: `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `muted`

Portal layout classes defined in tailwind.css:
- `.portal-sidebar` / `.portal-sidebar.collapsed`
- `.main-content` / `.main-content.sidebar-collapsed`
- `.auth-header`

### Routes

All routes defined in `src/Routes.jsx`. Login (`/`) is the entry point. Main routes:
- `/admin-dashboard`, `/teacher-dashboard`, `/student-dashboard`, `/parent-dashboard`
- `/finance-dashboard`, `/finance-overview`
- `/*-management` pages for CRUD operations (students, teachers, classes, fees, etc.)

### Data Visualization

Charts use **Recharts** and **D3.js**. Examples in dashboard components like `RevenueChart.jsx`.
