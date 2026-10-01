# Spendwise Frontend

React and Vite web application for Spendwise.

## Run with Docker

```bash
docker compose up --build
```

Open `http://localhost:5173`. The Docker image serves the built frontend through Nginx.

## Run locally

Requires Node.js and npm. Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Copy `.envExample` to `.env` and configure the frontend environment values as needed.
