# CafeFlow Backend

Spring Boot backend for the CafeFlow cafe ordering and delivery management system.

## Requirements

- Java 21
- MySQL 8+
- Gradle wrapper included in this directory

## Configuration

Runtime configuration is read from environment variables with safe local defaults where possible.

```text
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/cafeapp
SPRING_DATASOURCE_USERNAME=cafeappuser
SPRING_DATASOURCE_PASSWORD=your-local-password
CAFEAPP_JWT_SECRET=replace-with-a-long-random-secret
CAFEAPP_JWT_EXPIRATION_MS=86400000
```

Do not commit real passwords, JWT secrets, `.env` files, local properties, uploads, or generated build output.

## Run

```powershell
.\gradlew.bat bootRun
```

The API starts on `http://localhost:8080`.

## Test

```powershell
.\gradlew.bat test
```

## Main Modules

```text
config/        Spring Security, JWT filter, CORS
controllers/   REST API endpoints
dto/           Request and response payloads
entities/      JPA entities
repositories/  Spring Data repositories
services/      Business logic
utils/         JWT helper utilities
```

## API Areas

- Authentication: `/api/auth/**`
- Orders: `/api/orders/**`
- Cafe operations: `/api/cafe/**`
- Courier operations: `/api/courier/**`
- Menu: `/api/menu/**`
- Geolocation: `/api/geo/**`
