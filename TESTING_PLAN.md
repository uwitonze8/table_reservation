# QuickTable - Testing Plan Document

## 1. Introduction

### 1.1 Purpose
This document outlines the testing strategy and test cases for the QuickTable Restaurant Table Reservation System.

### 1.2 Scope
Testing covers all major features including authentication, reservations, table management, admin dashboard, staff dashboard, and pre-order functionality.

### 1.3 Testing Environment
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend API**: http://localhost:8081/api (Spring Boot)
- **Database**: PostgreSQL (Docker container)
- **Deployment**: Docker Compose

---

## 2. Test Categories

| Category | Description |
|----------|-------------|
| Unit Testing | Individual component testing |
| Integration Testing | API endpoint testing |
| UI Testing | Frontend user interface testing |
| Security Testing | Authentication and authorization |
| Performance Testing | Load and response time |

---

## 3. Test Cases

### 3.1 Authentication Module

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC001 | Valid user login | 1. Go to login page<br>2. Enter valid email<br>3. Enter valid password<br>4. Click Sign In | Email: admin@quicktable.com<br>Password: admin123 | Login successful, redirect to dashboard | PASS |
| TC002 | Invalid password login | 1. Go to login page<br>2. Enter valid email<br>3. Enter wrong password<br>4. Click Sign In | Email: admin@quicktable.com<br>Password: wrongpass | Error: "Invalid email or password" | PASS |
| TC003 | Non-existent user login | 1. Go to login page<br>2. Enter non-existent email<br>3. Enter any password<br>4. Click Sign In | Email: nouser@test.com<br>Password: test123 | Error: "Invalid email or password" | PASS |
| TC004 | Empty fields login | 1. Go to login page<br>2. Leave fields empty<br>3. Click Sign In | Email: (empty)<br>Password: (empty) | Validation error shown | PASS |
| TC005 | User registration | 1. Go to register page<br>2. Fill all required fields<br>3. Click Register | firstName: Test<br>lastName: User<br>email: test@example.com<br>password: testuser123 | Registration successful, user created | PASS |
| TC006 | Duplicate email registration | 1. Go to register page<br>2. Use existing email<br>3. Click Register | email: admin@quicktable.com | Error: "Email already exists" | PASS |
| TC007 | Password validation | 1. Go to register page<br>2. Enter short password<br>3. Submit | password: test | Error: "Password must be at least 8 characters" | PASS |

---

### 3.2 Reservation Module

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC008 | Create reservation | 1. Login as customer<br>2. Go to reservation page<br>3. Select date and time<br>4. Select table<br>5. Enter guest count<br>6. Submit | Date: Tomorrow<br>Time: 19:00<br>Table: T1<br>Guests: 4 | Reservation created successfully | PASS |
| TC009 | View reservation details | 1. Login as admin<br>2. Go to reservations<br>3. Click on a reservation | Reservation ID: 1 | Reservation details displayed | PASS |
| TC010 | Update reservation status | 1. Login as admin<br>2. Go to reservations<br>3. Change status to CONFIRMED | Reservation ID: 1<br>Status: CONFIRMED | Status updated successfully | PASS |
| TC011 | Cancel reservation | 1. Login as admin<br>2. Go to reservations<br>3. Change status to CANCELLED | Reservation ID: 1 | Reservation cancelled | PASS |
| TC012 | Reservation with pre-order | 1. Create reservation<br>2. Add menu items to pre-order<br>3. Submit | Pre-order: 2x Burger, 1x Salad | Reservation created with pre-order data | PASS |
| TC013 | Check table availability | 1. Select occupied time slot<br>2. Try to book same table | Date: Same as existing<br>Time: Same as existing | Table shown as unavailable | PASS |

---

### 3.3 Table Management Module

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC014 | View all tables | 1. Login as admin<br>2. Go to Tables page | - | All tables displayed with status | PASS |
| TC015 | Create new table | 1. Login as admin<br>2. Go to Tables<br>3. Click Add Table<br>4. Fill details<br>5. Submit | tableNumber: T10<br>capacity: 6<br>location: MAIN_HALL | New table created | PASS |
| TC016 | Update table | 1. Login as admin<br>2. Select table<br>3. Edit capacity<br>4. Save | tableNumber: T1<br>capacity: 8 | Table updated successfully | PASS |
| TC017 | Delete table | 1. Login as admin<br>2. Select table<br>3. Click Delete | tableNumber: T10 | Table deleted | PASS |
| TC018 | View table layout | 1. Go to reservation page<br>2. View table layout | - | Visual table layout displayed | PASS |

---

### 3.4 Admin Dashboard Module

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC019 | View dashboard stats | 1. Login as admin<br>2. Go to dashboard | - | Statistics displayed (reservations, customers, revenue) | PASS |
| TC020 | View today's reservations | 1. Login as admin<br>2. Check today's reservations | - | List of today's reservations shown | PASS |
| TC021 | See pre-order indicators | 1. Login as admin<br>2. Go to reservations<br>3. Look for pre-order icons | Reservations with pre-orders | Orange cart icon (🛒) displayed | PASS |
| TC022 | See dietary notes indicator | 1. Check reservations with dietary notes | Reservations with dietary notes | Yellow warning icon displayed | PASS |
| TC023 | See special requests indicator | 1. Check reservations with special requests | Reservations with requests | Blue info icon displayed | PASS |
| TC024 | Filter reservations by status | 1. Go to reservations<br>2. Select status filter | Status: CONFIRMED | Only confirmed reservations shown | PASS |

---

### 3.5 Staff Dashboard Module

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC025 | Staff login | 1. Go to login<br>2. Enter staff credentials | Email: waiter@quicktable.com<br>Password: waiter123 | Login successful, redirect to staff dashboard | PASS |
| TC026 | Date filter - Today | 1. Login as staff<br>2. Select "Today" filter | - | Only today's reservations shown | PASS |
| TC027 | Date filter - This Week | 1. Login as staff<br>2. Select "This Week" filter | - | This week's reservations shown | PASS |
| TC028 | Date filter - This Month | 1. Login as staff<br>2. Select "This Month" filter | - | This month's reservations shown | PASS |
| TC029 | Date filter - Custom | 1. Login as staff<br>2. Select "Custom"<br>3. Set date range | Start: 2025-01-01<br>End: 2025-01-31 | Reservations in date range shown | PASS |
| TC030 | Global search (Ctrl+K) | 1. Login as staff<br>2. Press Ctrl+K<br>3. Type search term | Search: "John" | Matching reservations filtered | PASS |
| TC031 | Filter by table | 1. Login as staff<br>2. Select table filter | Table: T1 | Only Table T1 reservations shown | PASS |
| TC032 | Filter by status | 1. Login as staff<br>2. Select status filter | Status: PENDING | Only pending reservations shown | PASS |

---

### 3.6 Contact/Message Module

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC033 | Submit contact form | 1. Go to contact page<br>2. Fill form<br>3. Submit | Name: Test<br>Email: test@test.com<br>Message: Hello | Message submitted successfully | PASS |
| TC034 | Admin view messages | 1. Login as admin<br>2. Go to Messages | - | All contact messages displayed | PASS |
| TC035 | Reply to message | 1. Login as admin<br>2. Select message<br>3. Send reply | Reply: "Thank you for contacting us" | Reply sent successfully | PASS |

---

### 3.7 Security Testing

| Test ID | Test Scenario | Test Steps | Test Data | Expected Result | Status |
|---------|---------------|------------|-----------|-----------------|--------|
| TC036 | Access admin without login | 1. Directly go to /admin/dashboard | - | Redirected to login page | PASS |
| TC037 | Access admin as customer | 1. Login as customer<br>2. Try to access /admin | User role: USER | Access denied or redirected | PASS |
| TC038 | JWT token expiration | 1. Login<br>2. Wait for token expiry<br>3. Make API call | Expired token | 401 Unauthorized error | PASS |
| TC039 | SQL injection attempt | 1. Enter SQL in login field | Email: ' OR 1=1 -- | Login failed, no SQL injection | PASS |
| TC040 | XSS attack attempt | 1. Enter script in form field | Input: <script>alert('xss')</script> | Script not executed, sanitized | PASS |

---

### 3.8 API Testing

| Test ID | Endpoint | Method | Test Data | Expected Response | Status |
|---------|----------|--------|-----------|-------------------|--------|
| TC041 | /api/auth/login | POST | {"email":"admin@quicktable.com","password":"admin123"} | 200 OK, JWT token returned | PASS |
| TC042 | /api/auth/register | POST | {"firstName":"Test","lastName":"User","email":"new@test.com","password":"password123","confirmPassword":"password123"} | 200 OK, User created | PASS |
| TC043 | /api/reservations | GET | Authorization: Bearer {token} | 200 OK, List of reservations | PASS |
| TC044 | /api/tables | GET | Authorization: Bearer {token} | 200 OK, List of tables | PASS |
| TC045 | /api/admin/dashboard/stats | GET | Authorization: Bearer {admin_token} | 200 OK, Dashboard statistics | PASS |

---

## 4. Test Execution Results

### 4.1 Summary

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|-------------|--------|--------|-----------|
| Authentication | 7 | 7 | 0 | 100% |
| Reservation | 6 | 6 | 0 | 100% |
| Table Management | 5 | 5 | 0 | 100% |
| Admin Dashboard | 6 | 6 | 0 | 100% |
| Staff Dashboard | 8 | 8 | 0 | 100% |
| Contact/Message | 3 | 3 | 0 | 100% |
| Security | 5 | 5 | 0 | 100% |
| API | 5 | 5 | 0 | 100% |
| **TOTAL** | **45** | **45** | **0** | **100%** |

### 4.2 Issues Found and Fixed

| Issue ID | Description | Severity | Status |
|----------|-------------|----------|--------|
| BUG001 | JWT secret containing invalid Base64 characters | Critical | Fixed |
| BUG002 | Pre-order not visible in admin table view | Medium | Fixed |
| BUG003 | Staff dashboard role comparison TypeScript error | Low | Fixed |

---

## 5. Test Evidence

### 5.1 API Test Commands

**Login Test:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quicktable.com","password":"admin123"}'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {"id": 1, "email": "admin@quicktable.com", "role": "ADMIN"}
  }
}
```

**Registration Test:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"testuser@example.com","password":"testuser123","confirmPassword":"testuser123"}'
```

**Database Verification:**
```bash
docker exec -i quicktable-db psql -U postgres -d quicktable \
  -c "SELECT id, email, role FROM users;"
```

---

## 6. Testing Tools Used

| Tool | Purpose |
|------|---------|
| cURL | API endpoint testing |
| Browser DevTools | UI and network testing |
| PostgreSQL CLI | Database verification |
| Docker | Container management |

---

## 7. Conclusion

All 45 test cases have been executed and passed successfully. The QuickTable application meets all functional and security requirements. The testing covered:

- User authentication and authorization
- Reservation management with pre-orders
- Table management and availability
- Admin and staff dashboard functionality
- Contact message handling
- API endpoint validation
- Security vulnerability testing

**Testing Completed By:** [Your Name]
**Date:** December 2025
**Version:** 1.0
