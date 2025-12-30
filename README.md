# Pastebin Lite

A simple Pastebin-like application built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Description

This application allows users to create text pastes and share them via a unique URL.
Features include:
- **Create Pastes**: Store arbitrary text.
- **Constraints**: Optional Time-to-Live (TTL) and Max Views limits.
- **Expiry Logic**: Pastes become unavailable (404) once either constraint is met.
- **Premium UI**: A dark-mode, responsive interface built with React and vanilla CSS.

## How to Run Locally

Prerequisites:
- Node.js (v14+)
- MongoDB (running locally or a URI)

1. **Clone the repository** (if not already done).

2. **Install Dependencies**:
   Run the following command in the root directory:
   ```bash
   npm run install:all
   ```
   (This installs dependencies for both the root, server, and client folders).

3. **Configure Environment**:
   Ensure the `.env` file in the root directory has valid values:
   ```
   MONGODB_URI=mongodb://localhost:27017/pastelink
   FRONTEND_URL=http://localhost:5173
   PORT=3000
   ```
   If using a remote MongoDB, update the `MONGODB_URI`.

4. **Start the Application**:
   Run from the root directory:
   ```bash
   npm run dev
   ```
   This command starts both the Express backend and the Vite frontend concurrently.

5. **Access the App**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000](http://localhost:3000)

## Persistence Layer

**Choice**: MongoDB (via Mongoose)

**Reasoning**:
- **Flexibility**: MongoDB's document model fits well with the variable nature of paste metadata (optional constraints).
- **Scalability**: Capable of handling large amounts of unstructured text data.
- **TTL Support**: While I implemented custom Application-level TTL logic to strictly adhere to the "max views + TTL" combined constraint rules and deterministic testing requirements, MongoDB offers native TTL indexes which are excellent for cleanup of expired documents in a production scenario.

## Design Decisions

- **Monorepo Structure**: Kept client and server in a single repository for easier management and deployment to Vercel as a single project.
- **Deterministic Testing**: Implemented a custom time utility (`server/utils/time.js`) that checks for the `x-test-now-ms` header to allow automated testers to simulate time travel for expiry verification.
- **Atomic View Counting**: Used `findOneAndUpdate` with query conditions to ensure that checking expiry/limits and incrementing the view count happen atomically, preventing race conditions where a paste might be viewed more times than allowed under load.
- **Vercel Deployment**: Configured `vercel.json` to handle routing for both the React SPA (frontend) and the Express API (serverless functions), ensuring a seamless deployment experience on a serverless platform.

## API Endpoints

- `GET /api/healthz`: Health check.
- `POST /api/pastes`: Create a new paste.
- `GET /api/pastes/:id`: Retrieve a paste (increments view count).
