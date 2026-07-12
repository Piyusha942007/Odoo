# EcoSphere – ESG Management Platform

This is the foundational boilerplate for the **EcoSphere – ESG Management Platform** monorepo project.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- dotenv
- cors
- nodemon (development server)

---

## Folder Structure

```
EcoSphere/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── ui/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Environment Setup

### 1. Root Environment Setup
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecosphere  # Provide your MongoDB URI here
CLIENT_URL=http://localhost:5173
```

### 2. Frontend Environment Setup
Create a `.env` file in the `frontend/` directory based on `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Running the Project

### Install all dependencies
To install all root, backend, and frontend dependencies at once, run:
```bash
npm run install-all
```

### Run both frontend and backend concurrently
To start the Vite dev server and Express API server simultaneously, run:
```bash
npm run dev
```

### Run applications independently

**Frontend only:**
```bash
npm run dev:frontend
```
or inside the `frontend` directory:
```bash
npm install
npm run dev
```

**Backend only:**
```bash
npm run dev:backend
```
or inside the `backend` directory:
```bash
npm install
npm run dev
```

---

## Git & Branching Strategy

The repository follows a clean branch separation model:

```
main
├── feature/environment-core
├── feature/social-gamification
└── feature/governance-reports
```

- **`main`**: Contains the integrated and verified project code. Do not work directly on this branch.
- **`feature/*`**: Individual feature branches. Each developer works in their assigned branch and creates a pull request/merge request back into `main` after validation.
