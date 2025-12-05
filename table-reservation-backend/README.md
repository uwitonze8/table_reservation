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