<div align="center">
  <br />
    <a href="#" target="_blank">
      <img src="Assets/banner.png" alt="Project Banner">
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/-NestJS-black?style=for-the-badge&logoColor=white&logo=nestjs&color=E0234E" alt="NestJS" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=4169E1" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/-Prisma-black?style=for-the-badge&logoColor=white&logo=prisma&color=2D3748" alt="Prisma" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="TailwindCSS" />
  </div>

  <h3 align="center">Quantify - A Business Management System with Multi-Role Dashboard</h3>

   <div align="center">
     A comprehensive business management platform featuring role-based access control, analytics dashboards, and review management system built with modern web technologies.
    </div>
</div>

##  <a name="table">Table of Contents</a>

1.  [Introduction](#introduction)
2.  [Tech Stack](#tech-stack)
3.  [Features](#features)
4.  [Quick Start](#quick-start)
5.  [Snippets (Code to Copy)](#snippets)
6.  [Assets](#assets)
7.  [More](#more)

## <a name="introduction"> Introduction</a>

Quantify is a production-grade business management platform built with React, NestJS, and PostgreSQL. It features comprehensive role-based dashboards for administrators, business owners, and customers, offering advanced functionalities like business analytics, review management, store oversight, and user administration with modern UI/UX and real-time data visualization.

The platform provides three distinct user experiences:
- **Admin Panel**: Complete system oversight with user management and business analytics
- **Owner Dashboard**: Business management tools with performance insights and review monitoring
- **User Portal**: Customer-facing interface for business discovery and review submission

## <a name="tech-stack"> Tech Stack</a>

**Frontend:**
- React Router v7
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hot Toast
- Recharts (Data Visualization)

**Backend:**
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Role-based Access Control

**Development Tools:**
- Vite (Build Tool)
- ESLint & Prettier
- Docker Support

## <a name="features"> Features</a>

###  Authentication & Authorization
 **JWT-Based Authentication**: Secure login/signup with HTTP-only cookies  
 **Role-Based Access Control**: Three-tier access system (Admin, Owner, User)  
 **Protected Routes**: Client-side route protection with automatic redirects  
 **Session Management**: Persistent sessions with automatic token refresh  

###  Admin Dashboard
 **User Management**: Complete CRUD operations for all users  
 **Business Analytics**: Comprehensive statistics and performance metrics  
 **Store Oversight**: Monitor and manage all registered businesses  
 **Review Moderation**: Advanced filtering and management of user reviews  
 **Data Visualization**: Interactive charts and graphs for business insights  

###  Owner Dashboard
 **Business Management**: Create, edit, and manage store information  
 **Performance Analytics**: Revenue tracking, customer insights, and growth metrics  
 **Review Management**: Monitor customer feedback and respond to reviews  
 **Dashboard Charts**: Real-time data visualization with:
  - Reviews Over Time
  - Rating Distribution
  - Store Performance Metrics
 **Profile Management**: Update business information and settings  

###  User Portal
 **Store Discovery**: Advanced search and filtering for businesses  
 **Review System**: Submit and manage personal reviews and ratings  
 **Profile Management**: Personal account settings and review history  
 **Store Details**: Comprehensive business information and customer reviews  
 **Rating Analytics**: Visual representation of business ratings  

###  Modern UI/UX Features
 **Responsive Design**: Mobile-first approach with Tailwind CSS  
 **Interactive Animations**: Smooth transitions with Framer Motion  
 **Loading States**: Skeleton screens and loading indicators  
 **Toast Notifications**: Real-time feedback for user actions  
 **Data Tables**: Sortable and filterable tables with pagination  

### 🔧 Advanced Technical Features
 **API Architecture**: RESTful APIs with comprehensive error handling  
 **Database Optimization**: Efficient queries with Prisma ORM  
 **Type Safety**: Full TypeScript implementation  
 **Error Boundaries**: Graceful error handling and user feedback  
 **Code Architecture**: Modular, scalable, and maintainable codebase  

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [PostgreSQL](https://www.postgresql.org/) (Database)

**Cloning the Repository**

```bash
git clone https://github.com/jadhav-prathamesh1/Quantify.git
cd quantify-app
```

**Backend Setup**

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a new file named `.env` in the Backend directory and add the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/quantify_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server Configuration
PORT=3001

# CORS Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# Production URLs (update these for production deployment)
# FRONTEND_URL_PROD=https://your-frontend-domain.com
# BACKEND_URL_PROD=https://your-backend-domain.com
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npm run seed
```

5. Start the backend server:
```bash
npm run start:dev
```

**Frontend Setup**

1. Open a new terminal and navigate to Frontend directory:
```bash
cd Frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a new file named `.env` in the Frontend directory and add the following:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Production API URL (update for production deployment)
# VITE_API_BASE_URL=https://your-backend-domain.com
```

4. Start the frontend development server:
```bash
npm run dev
```

**Access the Application**

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

**Default Login Credentials**

After seeding the database, you can use these credentials:

- **Admin**: admin@quantify.com / password123
- **Owner**: owner@quantify.com / password123
- **User**: user@quantify.com / password123

## <a name="snippets">🕸️ Snippets</a>

<details>
<summary><code>Frontend/tailwind.config.js</code></summary>

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
```

</details>

<details>
<summary><code>Backend/src/app.module.ts</code></summary>

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { OwnerModule } from './owner/owner.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    UserModule,
    AdminModule,
    StoresModule,
    RatingsModule,
    OwnerModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
```

</details>

<details>
<summary><code>Backend/prisma/schema.prisma</code></summary>

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  OWNER
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  status    Status   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ownedStores Store[] @relation("StoreOwner")
  reviews     Review[]

  @@map("users")
}

model Store {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  address     String
  phone       String?
  email       String?
  website     String?
  imageUrl    String?
  ownerId     Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner   User?    @relation("StoreOwner", fields: [ownerId], references: [id])
  reviews Review[]

  @@map("stores")
}

model Review {
  id        Int      @id @default(autoincrement())
  rating    Int      @db.SmallInt
  comment   String?
  userId    Int
  storeId   Int
  flagged   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id])
  store Store @relation(fields: [storeId], references: [id])

  @@map("reviews")
}
```

</details>

## Environment Configuration

The application uses environment variables for configuration management. This ensures easy deployment across different environments (development, staging, production).

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `PORT` | Server port | 3001 | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 | ❌ |
| `BACKEND_URL` | Backend URL for CORS | http://localhost:3001 | ❌ |
| `FRONTEND_URL_PROD` | Production frontend URL | - | ❌ |
| `BACKEND_URL_PROD` | Production backend URL | - | ❌ |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | http://localhost:3001 | ❌ |

**Note**: All environment variables are referenced in the respective `.env.example` files for easy setup.

## Project Structure

```
Quantify_app-main/
├── Backend/
│   ├── src/
│   │   ├── admin/          # Admin module
│   │   ├── auth/           # Authentication
│   │   ├── common/         # Shared services
│   │   ├── owner/          # Owner module
│   │   ├── ratings/        # Rating management
│   │   ├── stores/         # Store management
│   │   ├── user/           # User module
│   │   └── users/          # User administration
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── Frontend/
│   ├── app/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature-based modules
│   │   ├── providers/      # Context providers
│   │   ├── routes/         # Route components
│   │   └── utils/          # Utility functions
│   └── package.json
└── Assets/                 # Screenshots and assets
```

## Screenshots

### Main Homepage - Landing Page
<div align="center">
  <img src="Assets/homepage.png" alt="Quantify Homepage" width="800">
  <p><em>Welcome to Quantify - Modern business management platform with intuitive design</em></p>
</div>

### Admin Dashboard
<div align="center">
  <img src="Assets/admin.png" alt="Admin Dashboard" width="800">
  <p><em>Comprehensive admin panel with user management, analytics, and system oversight</em></p>
</div>

### Owner Dashboard  
<div align="center">
  <img src="Assets/owner.png" alt="Owner Dashboard" width="800">
  <p><em>Business owner interface with performance metrics and review management</em></p>
</div>

### User Portal
<div align="center">
  <img src="Assets/user.png" alt="User Portal" width="800">
  <p><em>Customer-facing portal for business discovery and review submission</em></p>
</div>

## <a name="assets">🔗 Assets</a>

- **Animations**: The project includes a Lottie animation (`man-checking-strategy.json`) for enhanced user experience
- **Icons**: Custom icons for navigation and user interface elements
- **Images**: Screenshots and promotional materials in the Assets directory
- **Styling**: Modern CSS with Tailwind utility classes

**Note**: The Lottie animation file (`Frontend/public/assets/animations/man-checking-strategy.json`) can be displayed in README files on platforms that support animation rendering, though GitHub's markdown renderer shows static content by default.

## <a name="more"> More</a>

**Key Learning Outcomes**

Building this project provides hands-on experience with:

- **Full-Stack Development**: Complete React + NestJS application architecture
- **Authentication Systems**: JWT implementation with role-based access control  
- **Database Design**: PostgreSQL with Prisma ORM for efficient data management
- **API Development**: RESTful API design with comprehensive error handling
- **Modern UI/UX**: Responsive design with Tailwind CSS and smooth animations
- **State Management**: React context and custom hooks for application state
- **TypeScript**: Full type safety across frontend and backend
- **Testing & Deployment**: Production-ready code with proper error handling

**Future Enhancements**

- Email notification system for reviews and updates
- Advanced analytics with export capabilities  
- Mobile application using React Native
- Real-time messaging between owners and customers
- Payment integration for premium features
- Multi-language support
- Advanced search with Elasticsearch

##  Deployment Guide

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Configure Build Settings:**
   - **Build Command**: `cd Backend && npm install && npx prisma generate`
   - **Start Command**: `cd Backend && npm run start:prod`
   - **Environment**: Node.js

4. **Add Environment Variables on Render:**
```env
DATABASE_URL=your_neon_db_url_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=10000
NODE_ENV=production
FRONTEND_URL_PROD=https://your-app-name.vercel.app
BACKEND_URL_PROD=https://your-backend-name.onrender.com
```

### Frontend Deployment (Vercel)

1. **Create a new project on Vercel**
2. **Connect your GitHub repository**
3. **Configure Build Settings:**
   - **Framework Preset**: React
   - **Build Command**: `cd Frontend && npm run build`
   - **Output Directory**: `Frontend/dist`
   - **Install Command**: `cd Frontend && npm install`

4. **Add Environment Variables on Vercel:**
```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com
```

### Deployment URLs Structure

After deployment, your URLs will be:
- **Frontend (Vercel)**: **[Live](https://quantify-prathameshs-projects-1268eb32.vercel.app/)**
- **Backend (Render)**: `https://your-backend-name.onrender.com`

**Important**: Update the CORS configuration in your Backend environment variables with the actual Vercel URL once deployed.

---

<div align="center">
  <p>Built with ❤️ using modern web technologies</p>
  <p>
    <a href="#introduction">🔝 Back to top</a>
  </p>
</div>
