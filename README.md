# User Management System

A comprehensive user management application built with Next.js, featuring JWT authentication, user CRUD operations, and bulk user upload via Excel files.

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Validation**: Zod
- **State Management**: TanStack Query (React Query)
- **Excel Parsing**: xlsx
- **Containerization**: Docker & Docker Compose

## 📋 Features

- ✅ JWT-based authentication with secure HTTP-only cookies
- ✅ Protected routes with middleware
- ✅ User management dashboard
- ✅ Bulk user upload via Excel files
- ✅ Transaction-based Excel import (all-or-nothing)
- ✅ Duplicate email detection
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Comprehensive input validation
- ✅ Responsive UI with modern design

## 🛠️ Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL (if running locally without Docker)

## 🚀 Getting Started

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-management-case
   ```

2. **Start the development database**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Setup the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with default credentials:
     - Email: `admin@admin.com`
     - Password: `admin`

### Option 2: Full Docker Deployment (Production)

1. **Build and run all services**
   ```bash
   docker compose up --build
   ```

   This will automatically:
   - Start PostgreSQL database
   - Run database migrations
   - Create default admin user
   - Start the Next.js application

2. **Access the application** at [http://localhost:3000](http://localhost:3000)

3. **Default login credentials:**
   - **Email:** `admin@admin.com`
   - **Password:** `admin`

4. **Stop the application:**
   ```bash
   docker compose down
   ```

5. **Run in background (detached mode):**
   ```bash
   docker compose up --build -d
   ```

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   └── users/     # User management endpoints
│   │   ├── dashboard/     # Dashboard page
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Login page
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   ├── providers/     # React context providers
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   └── types/             # TypeScript type definitions
├── docker-compose.yml     # Production Docker configuration
├── docker-compose.dev.yml # Development Docker configuration
├── Dockerfile             # Docker build instructions
└── middleware.ts          # Next.js middleware for auth
```

## 🔐 Authentication Flow

1. User submits login credentials
2. Server validates credentials against database
3. If valid, server generates JWT token
4. Token is stored in HTTP-only cookie (secure, sameSite: lax)
5. Middleware checks token validity on protected routes
6. If token is expired/invalid, user is redirected to login

## 📊 Excel Upload Format

The Excel file should contain the following columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| firstName | Text | Yes | User's first name |
| lastName | Text | Yes | User's last name |
| email | Text | Yes | User's email (must be unique) |
| age | Number | Yes | User's age (1-150) |
| password | Text | No | Password (auto-generated if empty) |

### Excel Upload Rules

- All rows are validated before any insertion
- Duplicate emails within the file are rejected
- Emails that already exist in database are rejected
- If ANY error occurs, NO users are added (transaction rollback)
- Errors include specific row numbers for easy debugging

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Signed with HS256, configurable expiration
- **HTTP-only Cookies**: Prevents XSS attacks
- **Input Validation**: Zod schema validation on all inputs
- **Transaction Safety**: All-or-nothing bulk operations
- **Role-based Access**: Admin-only operations protected

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create single user
- `POST /api/users/upload` - Bulk upload via Excel

## 🧪 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-super-secret-key-minimum-32-characters"
JWT_EXPIRES_IN="1d"

# Application
NODE_ENV="development"
```

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🐳 Docker Commands

```bash
# Development (database only)
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down

# Production (full stack)
docker-compose up --build
docker-compose down

# View logs
docker-compose logs -f app
```

## 📄 License

MIT License - feel free to use this project for learning or production.
