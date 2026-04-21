# CafeFlow Frontend

React frontend for CafeFlow. The app can run as three different portals from the same codebase: client, courier, and cafe administration.

## Requirements

- Node.js 20+
- npm
- Backend API running on `http://localhost:8080`

## Install

```powershell
npm install
```

## Run

```powershell
npm run start:user
npm run start:courier
npm run start:cafe
```

Portal scripts set these values:

```text
start:user     PORT=3000 REACT_APP_PORTAL=user
start:courier  PORT=3001 REACT_APP_PORTAL=courier
start:cafe     PORT=3002 REACT_APP_PORTAL=cafe
```

Run all portals together:

```powershell
npm run start:all
```

## Environment

The frontend uses:

```text
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_PORTAL=user | courier | cafe
```

## Build

```powershell
npm run build
```

The production bundle is written to `build/`, which is intentionally ignored by git.

## Source Layout

```text
src/App.js              Routing, auth state, portal frame
src/config/portal.js    Portal metadata and role routing
src/utils/api.js        API base URL helper
src/utils/authStorage.js Local auth persistence
src/components/         Screens and portal components
```
