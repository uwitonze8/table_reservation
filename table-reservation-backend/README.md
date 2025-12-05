
# Table Reservation System

## Overview
This project is a Restaurant Table Reservation System built using Java and Spring Boot. It provides a backend API for managing reservations, user authentication, and administrative functionalities. The frontend is developed using Next.js with TypeScript and Tailwind CSS.

## Technology Stack
- **Java 17+**
- **Spring Boot 3**
- **Spring Web**
- **Spring Data JPA**
- **Spring Security**
- **JWT Authentication**
- **PostgreSQL**
- **Lombok**
- **Jakarta Validation**
- **Swagger (OpenAPI)**

## Features

### Public Features
- **Contact Us**: Users can send messages to the restaurant.
- **Signup/Register**: Users can create an account.
- **Login**: Users can log in to their accounts.
- **Forgot Password**: Users can request a password reset.

### Customer Features (Login Required)
- **Reservation**: Users can make reservations in a 3-step process.
- **Customer Dashboard**: Users can view and manage their profiles and reservations.

### Admin Features (Role: ADMIN)
- **Dashboard Overview**: Admins can view daily reservations.
- **Manage Reservations**: Admins can add, edit, delete, and view all reservations.
- **Manage Tables**: Admins can manage restaurant tables.
- **Manage Staff**: Admins can manage staff members.
- **Manage Customers**: Admins can view all registered customers.
- **Reports**: Admins can view reservation statistics.

## Project Structure
```
table-reservation-backend
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── tablereservation
│   │   │               ├── config
│   │   │               ├── controller
│   │   │               ├── dto
│   │   │               ├── entity
│   │   │               ├── exception
│   │   │               ├── mapper
│   │   │               ├── repository
│   │   │               ├── security
│   │   │               ├── service
│   │   │               └── util
│   │   └── resources
│   └── test
├── build
├── scripts
├── docs
├── examples
├── .env.example
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
├── README.md
└── LICENSE
```

# QuickTable - Restaurant Reservation System Backend

A complete Spring Boot backend for a restaurant table reservation system.

## Technology Stack

- Java 17+
- Spring Boot 3.2
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Lombok
- Jakarta Validation
- Swagger/OpenAPI


## Getting Started

### Prerequisites

- Java 17+
- Maven
- PostgreSQL

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd table-reservation-backend
   ```

2. Configure the database in `src/main/resources/application.yml`.

3. Run the application:
   ```
   ./mvnw spring-boot:run
   ```

### API Documentation
API documentation is available via Swagger at `http://localhost:8080/swagger-ui.html` after starting the application.

### Running Tests
To run the tests, use the following command:
```
./mvnw test
```

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
=======

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 14+

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE quicktable;
```

2. Update `application.yml` with your database credentials.

### Running the Application

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Or run with development profile (H2 database)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The server will start at `http://localhost:8080`

### Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@quicktable.com | admin123 | ADMIN |
| waiter@quicktable.com | waiter123 | WAITER |
| customer@example.com | customer123 | USER |

## API Documentation

Swagger UI: `http://localhost:8080/swagger-ui.html`

API Docs: `http://localhost:8080/v3/api-docs`

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |

### Contact (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact message |

### Tables (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tables` | Get all tables |
| GET | `/api/tables/{id}` | Get table by ID |
| POST | `/api/tables/available` | Get available tables |

### Reservations (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reservations` | Create reservation |
| GET | `/api/reservations/{id}` | Get reservation by ID |
| GET | `/api/reservations/code/{code}` | Get by confirmation code |
| GET | `/api/reservations/my-reservations` | Get user's reservations |
| PUT | `/api/reservations/{id}` | Update reservation |
| POST | `/api/reservations/{id}/cancel` | Cancel reservation |

### Customer Profile (Role: USER)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/profile` | Get profile |
| PUT | `/api/customer/profile` | Update profile |
| POST | `/api/customer/change-password` | Change password |
| GET | `/api/customer/loyalty-points` | Get loyalty points |

### Admin Endpoints (Role: ADMIN)

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/dashboard/stats/{date}` | Get stats by date |

#### Reservations Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reservations` | Get all reservations (paged) |
| GET | `/api/admin/reservations/today` | Get today's reservations |
| POST | `/api/admin/reservations` | Create reservation |
| PUT | `/api/admin/reservations/{id}` | Update reservation |
| POST | `/api/admin/reservations/{id}/confirm` | Confirm reservation |
| POST | `/api/admin/reservations/{id}/complete` | Complete reservation |
| POST | `/api/admin/reservations/{id}/cancel` | Cancel reservation |
| DELETE | `/api/admin/reservations/{id}` | Delete reservation |

#### Tables Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tables` | Get all tables |
| POST | `/api/admin/tables` | Create table |
| PUT | `/api/admin/tables/{id}` | Update table |
| PATCH | `/api/admin/tables/{id}/status` | Update table status |
| DELETE | `/api/admin/tables/{id}` | Delete table |

#### Staff Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/staff` | Get all staff |
| POST | `/api/admin/staff` | Create staff member |
| PUT | `/api/admin/staff/{id}` | Update staff member |
| DELETE | `/api/admin/staff/{id}` | Delete staff member |

#### Customers Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/customers` | Get all customers |
| GET | `/api/admin/customers/{id}` | Get customer by ID |
| GET | `/api/admin/customers/{id}/reservations` | Get customer's reservations |

#### Contact Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/messages` | Get all messages |
| GET | `/api/admin/messages/unread` | Get unread messages |
| PATCH | `/api/admin/messages/{id}/read` | Mark as read |
| POST | `/api/admin/messages/{id}/reply` | Reply to message |
| DELETE | `/api/admin/messages/{id}` | Delete message |

### Staff Endpoints (Roles: ADMIN, WAITER, MANAGER, HOST)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff/reservations/today` | Today's reservations |
| GET | `/api/staff/reservations/date/{date}` | Reservations by date |
| PUT | `/api/staff/reservations/{id}` | Update reservation |
| POST | `/api/staff/reservations/{id}/confirm` | Confirm reservation |
| POST | `/api/staff/reservations/{id}/complete` | Complete reservation |
| GET | `/api/staff/tables` | Get all tables |
| PATCH | `/api/staff/tables/{id}/status` | Update table status |

## Example API Calls from Next.js

### Login

```typescript
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    password: 'customer123',
  }),
});

const data = await response.json();
// Save token: localStorage.setItem('token', data.data.accessToken);
```

### Create Reservation

```typescript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8080/api/reservations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '555-0123',
    reservationDate: '2024-12-25',
    reservationTime: '19:00',
    numberOfGuests: 4,
    tableId: 5,
    specialRequests: 'Window seat please',
  }),
});
```

### Get Available Tables

```typescript
const response = await fetch('http://localhost:8080/api/tables/available', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    date: '2024-12-25',
    time: '19:00',
    guests: 4,
  }),
});
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`

Update `app.cors.allowed-origins` in `application.yml` to add more origins.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | Base64 encoded default |
| `MAIL_USERNAME` | SMTP username | - |
| `MAIL_PASSWORD` | SMTP password | - |

## Project Structure

```
src/main/java/com/quicktable/backend/
├── config/           # Configuration classes
├── controller/       # REST controllers
├── dto/              # Data Transfer Objects
├── entity/           # JPA entities
├── exception/        # Custom exceptions
├── repository/       # JPA repositories
├── security/         # JWT & Security
├── service/          # Business logic
└── util/             # Utility classes
```

## License

MIT License

