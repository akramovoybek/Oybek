# Frontend (React + Vite) - Alternate UI

> **Note:** The primary frontend is now served via **EJS templates** from the Express backend on port 3000. This React/Vite SPA is an alternate frontend that can be used for development or as a future migration path.

## Running the React Frontend

The React frontend runs as a separate dev server and proxies API requests to the backend.

### Prerequisites

- Backend running on `http://localhost:3000`

### Setup

```bash
cd frontend
npm install
npm run dev
```

The React frontend will be available at `http://localhost:5173`.

### Available Scripts

```bash
npm run dev       # Development server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Stack

- React 19 + React Router 7
- Vite (build tool)
- TailwindCSS 4
- CodeMirror 6 (code editor)
- Axios (HTTP client)
