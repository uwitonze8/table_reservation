# 🔐 Test Credentials - QuickTable Restaurant Reservation System

## Overview
This document contains all test credentials for the table reservation system. Use these credentials to test different user roles and features.

---

## 👤 Customer Accounts

### Test Customer 1
- **Email:** `customer@test.com`
- **Password:** `customer123`
- **Description:** Any valid email with any password will work for customer login
- **Features Access:**
  - Make reservations
  - View reservation history (from day one)
  - Print tickets with QR codes
  - Earn and view loyalty points
  - Re-book past reservations
  - Edit profile information
  - Change password
  - Receive SMS/Email reminders

### Quick Customer Registration
- You can register a new customer account with any email
- Minimum password length: 8 characters
- Upon registration, you'll be automatically logged in

---

## 👨‍💼 Admin Account (Restaurant Owner)

### Admin User
- **Email:** `admin@quicktable.com`
- **Password:** `admin123`
- **Staff ID:** `STAFF-001`
- **Features Access:**
  - View dashboard with stats (reservations, occupancy, revenue)
  - Manage all reservations
  - Add/edit/remove staff members
  - View comprehensive reports & analytics
  - Export reports (CSV/PDF)
  - Manage tables and customers
  - Full system access

---

## 👔 Waiter/Staff Account

### Waiter User
- **Email:** `waiter@quicktable.com`
- **Password:** `waiter123`
- **Staff ID:** `STAFF-002`
- **Features Access:**
  - View today's reservations
  - Update reservation status
  - Manage walk-in customers
  - View assigned tables
  - Access daily reports (limited)
  - Check-in guests

---

## 🎯 Feature Testing Guide

### 1. **Customer Features**

#### A. Reservation System
1. Login as customer
2. Go to `/reservation` or click "New Reservation"
3. Fill in reservation details
4. Submit and view confirmation

#### B. Print Ticket with QR Code
1. Login as customer
2. Go to `/my-reservations`
3. Find any reservation
4. Click "Print Ticket" button
5. View ticket with QR code
6. Print or close

#### C. Loyalty Points
1. Login as customer
2. Go to `/my-reservations`
3. View loyalty points displayed at top
4. Completed reservations show points earned
5. Go to `/account/rewards` to see full loyalty program

#### D. Re-book Feature
1. Login as customer
2. Go to `/my-reservations`
3. Filter by "Past" or find completed reservations
4. Click "Re-book" button
5. Redirected to reservation page with pre-filled data

#### E. Profile Management
1. Login as customer
2. Go to `/account/profile`
3. Click "Edit" button
4. Update any fields (name, email, phone, birthday, dietary preferences)
5. Click "Save Changes"
6. See success message

#### F. Password Change
1. Login as customer
2. Go to `/account/profile`
3. Scroll to "Security" section
4. Click "Change Password"
5. Enter current password, new password, and confirmation
6. Click "Update Password"

---

### 2. **Admin Features**

#### A. Dashboard
1. Login as admin: `admin@quicktable.com` / `admin123`
2. View dashboard at `/admin/dashboard`
3. See today's stats (reservations, guests, occupancy)
4. View upcoming reservations
5. Use quick actions

#### B. Staff Management
1. Login as admin
2. Go to `/admin/staff`
3. View all staff members
4. Click "Add New Staff" to add waiter/manager
5. Fill in details and submit
6. Toggle staff status (active/inactive)

#### C. Reports & Analytics
1. Login as admin
2. Go to `/admin/reports`
3. Select date range (today, this week, this month, etc.)
4. Choose report type (summary, detailed, financial, customer analytics)
5. View key metrics
6. Export as CSV or PDF

---

### 3. **Waiter/Staff Features**

#### A. Staff Dashboard
1. Login as waiter: `waiter@quicktable.com` / `waiter123`
2. View dashboard at `/staff/dashboard`
3. See today's reservations
4. View currently seated guests
5. Check upcoming reservations

#### B. Update Reservation Status
1. Login as waiter
2. View today's reservations
3. Click "Update" on any reservation
4. Change status (confirmed → arriving → seated → completed)

---

## 📧 SMS/Email Reminder System

### How It Works
When a customer makes a reservation, they automatically receive:

1. **Confirmation Email/SMS** - Immediately after booking
2. **24-Hour Reminder** - Sent 24 hours before reservation
3. **2-Hour Reminder** - Sent 2 hours before reservation

### Testing Reminders
Currently, reminders are logged to the console. In production, they will be sent via:
- **Email:** SendGrid, AWS SES, or similar
- **SMS:** Twilio, AWS SNS, or similar

To test:
1. Make a reservation as a customer
2. Check browser console for notification logs
3. View notification schedule details

---

## 🎟️ Reservation Ticket Details

Each printed ticket includes:
- **QR Code** - Contains reservation data for quick check-in
- **Reservation ID** - Unique identifier
- **Customer Name** - Full name
- **Customer Phone** - Contact number
- **Reservation Date** - Full date
- **Reservation Time** - Time slot
- **Table Name & Number** - Assigned table
- **Party Size** - Number of guests
- **Special Requests** - Any customer notes
- **Printed Date** - When ticket was generated
- **Restaurant Contact Info** - Phone, website, email

---

## 🏆 Loyalty Points System

### How Points Are Earned
- **Completed Reservations:** Points = Guests × 10
  - Example: 4 guests = 40 points
  - Example: 2 guests = 20 points
  - Example: 6 guests = 60 points

### Where to View Points
1. `/my-reservations` - Total points displayed at top
2. Each completed reservation shows "+XX Loyalty Points Earned"
3. `/account/rewards` - Full loyalty program details

### Future Implementation
- Redeem points for discounts
- Special tier benefits (Bronze, Silver, Gold, Platinum)
- Birthday rewards
- Referral bonuses

---

## 🔧 Quick Test Scenarios

### Scenario 1: Complete Customer Journey
```
1. Register: customer@test.com / password123
2. Make reservation for 4 guests on future date
3. Go to "My Reservations"
4. Click "Print Ticket" and verify QR code appears
5. Go to Profile and edit information
6. Logout
```

### Scenario 2: Admin Management
```
1. Login: admin@quicktable.com / admin123
2. View dashboard stats
3. Go to Staff Management
4. Add new waiter
5. Go to Reports
6. Export CSV report
7. Logout
```

### Scenario 3: Waiter Operations
```
1. Login: waiter@quicktable.com / waiter123
2. View today's reservations
3. Update a reservation status
4. View daily reports
5. Logout
```

---

## ⚠️ Important Notes

1. **Mock Data:** Currently using mock/dummy data for testing
2. **No Database:** Data is stored in memory (resets on refresh)
3. **No Real Emails/SMS:** Notifications are logged to console
4. **QR Codes:** Generated with real data but not scanned in current version
5. **Payment:** Not implemented yet (future feature)

---

## 🚀 Getting Started

1. **Start the development server:**
   ```bash
   cd C:\table_reservation\table_reservation
   yarn dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Test customer features:**
   - Register a new account OR
   - Login with `customer@test.com` / `any password`

4. **Test admin features:**
   - Login with `admin@quicktable.com` / `admin123`

5. **Test waiter features:**
   - Login with `waiter@quicktable.com` / `waiter123`

---

## 🐛 Troubleshooting

### Issue: Cannot login
- **Solution:** Check you're using correct credentials from above
- **Customer:** Any email + any password works
- **Admin:** Exact email/password required
- **Waiter:** Exact email/password required

### Issue: QR Code not showing
- **Solution:** Wait for qrcode library to install
- **Check:** Run `npm install qrcode @types/qrcode`

### Issue: Reservation history empty
- **Solution:** Make a reservation first
- **Note:** Data resets on page refresh (no database yet)

### Issue: Profile changes not saving
- **Solution:** This is expected (mock data)
- **Future:** Will connect to real database

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Check `/TEST_CREDENTIALS.md` for credentials
4. Contact development team

---

**Last Updated:** November 24, 2025
**Version:** 1.0.0
**Status:** Development/Testing Phase
