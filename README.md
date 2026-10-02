# Store Rating App

A role-based web application where users can browse stores and submit ratings from 1 to 5.

## Tech Stack
- **Frontend:** React, Vite, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (`pg`)
- **Authentication:** JWT, bcryptjs

## Features
- **Admin:** Manage users and stores; view dashboard statistics.
- **Normal User:** Register, browse stores, rate stores, and update passwords.
- **Store Owner:** View store ratings and users who submitted them.

## Setup

### 1. Create the database
```powershell
psql -U postgres -c "CREATE DATABASE store_rating;"
```

### 2. Configure and start the backend
```powershell
cd server
npm install
```

Create `server/.env`:
```dotenv
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/store_rating
JWT_SECRET=your_long_random_secret
```

From the project root, run the schema:
```powershell
psql -U postgres -d store_rating -f .\server\schema.sql
```

Then, inside `server/`:
```powershell
npm run seed
npm run dev
```

Development admin: `admin@example.com` / `Admin@1234`

### 3. Start the frontend
Open a second terminal:
```powershell
cd client
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Notes
- Keep the backend and frontend terminals running.
- Change the development admin password after login.
- Never commit `.env` or use the seed credentials in production.