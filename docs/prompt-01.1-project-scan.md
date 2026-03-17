# Project Scan & Discovery

## 1. Project Tree (Key Directories)

```text
root/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Application shells (DashboardLayout.tsx)
│   │   │   ├── ui/             # Generic UI components (likely Shadcn/Radix+Tailwind)
│   │   │   ├── features/       # Domain-specific components (interventions, employees, users)
│   │   │   └── shared/         # Shared utilities (ProtectedRoute.tsx)
│   │   ├── contexts/           # React Contexts (AuthContext.tsx)
│   │   ├── pages/              # Page components (Login.tsx, DashboardHome.tsx)
│   │   ├── stores/             # Global state (Zustand)
│   │   ├── App.tsx             # Main Router configuration
│   │   └── main.tsx            # Entry point
│   ├── package.json            # Vite + React deps
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── api/                # NestJS Controllers
│   │   ├── core/               # Domain logic
│   │   └── infrastructure/     # Database (Drizzle) & External services
│   ├── package.json            # NestJS + Drizzle deps
│   └── dictionary.json
├── ml-service/
│   ├── api/                    # FastAPI endpoints
│   ├── core/                   # ML Logic
│   └── requirements.txt        # Python dependencies
└── infrastructure/             # Docker/Deployment configs
```

## 2. Tech Stack

### Client
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + generic UI components (likely Radix UI based on deps)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Testing**: Vitest, Playwright

### Server
- **Framework**: NestJS
- **Language**: TypeScript
- **Database Helper**: Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: Passport (JWT)
- **Messaging**: Amqplib (RabbitMQ likely)

### ML Service
- **Framework**: FastAPI
- **Language**: Python
- **Libraries**: Pandas, Scikit-learn, XGBoost, SQLAlchemy

## 3. Conventions Contract

### Architecture
- **Client**: Feature-based organization. Complex logic resides in `features/` or `stores/`. generic UI in `components/ui`.
- **Server**: Modular NestJS architecture separating API (Controllers), Core (Services/Domain), and Infrastructure (Repositories/DAL).

### Development Rules ("Precision Lock")
1.  **Preserve Structure**: Do not create new top-level directories or change the `client/server/ml-service` split.
2.  **No New Libs**: Use existing dependencies (Radix, Tailwind, Zustand, Drizzle).
3.  **Reuse First**: Check `components/ui` and `features` before creating new components.
4.  **Routing**: define routes in `client/src/App.tsx`. Use `DashboardLayout` for authenticated pages.

## 4. Route Mapping

| URL Path | Component Path | Type |
| :--- | :--- | :--- |
| `/login` | `client/src/pages/Login.tsx` | Public Page |
| `/` | Redirects to `/login` | Redirect |
| `/dashboard` | `client/src/components/layout/DashboardLayout.tsx` | Layout |
| `/dashboard` (index) | `client/src/pages/dashboard/DashboardHome.tsx` | Protected Page |
| `/dashboard/interventions` | `client/src/components/features/interventions/InterventionsDashboard.tsx` | Feature Page |
| `/dashboard/users` | `client/src/components/features/users/UserManagement.tsx` | Feature Page |
| `/dashboard/vo-employees` | `client/src/components/features/employees/EmployeeList.tsx` | Feature Page |
| `/dashboard/impact` | `client/src/pages/dashboard/ImpactPage.tsx` | Protected Page |

## 5. Observations
- **RTL**: Not explicitly enabled in `index.html` (`lang="en"`), but folder path suggests Arabic context. Future task may involve RTL support.
- **Auth**: Implemented via `AuthContext` + `useAuthStore` (Zustand) + `ProtectedRoute`.
