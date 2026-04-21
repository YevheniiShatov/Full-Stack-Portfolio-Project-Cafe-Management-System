# CafeFlow - Cafe Management System

CafeFlow is a full-stack cafe ordering and delivery management project. The repository is organized as a clean monorepo with a Spring Boot backend, a React frontend, and the existing mobile prototype kept separately.

## Repository Layout

```text
backend/   Spring Boot API, security, order flow, cafe administration, geolocation
frontend/  React app with separate client, courier, and cafe portals
mobile/    Flutter mobile prototype from the original repository
```

## Main Features

- Role-based authentication for clients, couriers, and cafe managers.
- JWT-secured Spring Boot REST API.
- Order creation, order history, cafe order management, and courier delivery workflow.
- Cafe menu and district management.
- Address and geolocation helpers for matching orders to cafe coverage areas.
- Three frontend portal modes from the same React codebase:
  - client portal on port `3000`
  - courier portal on port `3001`
  - cafe portal on port `3002`

## Tech Stack

- Java 21
- Spring Boot 3.1
- Spring Security
- Spring Data JPA
- MySQL
- React 18
- React Router
- Axios
- Leaflet

## Backend Setup

```powershell
cd backend
```

Set local environment variables before running the backend. Keep real secrets outside git.

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/cafeapp"
$env:SPRING_DATASOURCE_USERNAME="cafeappuser"
$env:SPRING_DATASOURCE_PASSWORD="your-local-password"
$env:CAFEAPP_JWT_SECRET="replace-with-a-long-random-secret"
.\gradlew.bat bootRun
```

The backend runs on `http://localhost:8080` by default.

## Frontend Setup

```powershell
cd frontend
npm install
```

Run one portal:

```powershell
npm run start:user
npm run start:courier
npm run start:cafe
```

Run all portals together:

```powershell
npm run start:all
```

The React app reads the API URL from `REACT_APP_API_BASE_URL`; the scripts default it to `http://localhost:8080`.

## Useful Commands

```powershell
# Backend
cd backend
.\gradlew.bat test

# Frontend
cd frontend
npm run build
```

## API Areas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/register-courier`
- `POST /api/auth/login-courier`
- `POST /api/auth/register-cafe`
- `POST /api/auth/login-cafe`
- `/api/orders/**`
- `/api/cafe/**`
- `/api/courier/**`
- `/api/menu/**`
- `/api/geo/**`

## Configuration Notes

The committed backend configuration uses environment-variable placeholders for database credentials and JWT secrets. Do not commit local `application-local.properties`, `.env` files, uploaded files, build outputs, IDE metadata, archives, or `node_modules`.

## Author

Yevhenii Shatov
