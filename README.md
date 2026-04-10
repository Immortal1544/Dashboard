# Personal Sales Dashboard

A full-stack sales dashboard application with React, Node.js, Express, MongoDB, Tailwind CSS, and Chart.js.

## Features

- Customer, order, and expense management
- Sales tracking by day/month/year
- Dashboard analytics with pie, bar, and line charts
- Monthly profit and expense summaries
- Filters by month, year, and customer
- Responsive layout with sidebar navigation
- Dark mode toggle and CSV export support

## Folder Structure

- `backend/` - Node.js + Express API
- `frontend/` - React + Vite UI

## Setup

1. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```

2. Install dependencies for frontend:
   ```bash
   cd ../frontend
   npm install
   ```

3. Create `.env` in `backend/` and add:
   ```env
   MONGO_URI=mongodb://localhost:27017/personal-sales-dashboard
   PORT=5000
   ```

4. (Optional) Create `.env` in `frontend/` from `.env.example`:
   ```env
   VITE_API_BASE_URL=/api
   ```
   Use `http://localhost:5000/api` if you want to bypass Vite proxy.

5. Seed sample data (optional):
   ```bash
   cd backend
   node data/seed.js
   ```

6. Start backend server:
   ```bash
   cd backend
   npm run dev
   ```

7. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

8. Open the frontend URL shown by Vite.

## Notes

- The backend API runs on port `5000`.
- The frontend uses a centralized Axios service in `frontend/src/services/api.js`.
- By default, frontend requests go to `/api` and use Vite proxy to forward to backend.
- Set `VITE_API_BASE_URL` in `frontend/.env` for non-proxy deployments.
- Dark mode preference is stored per session in the UI.
- Sample data is available via `backend/data/seed.js`.
