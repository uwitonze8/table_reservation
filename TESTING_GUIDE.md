# Quick Table - Testing Guide

## Test Credentials & Dashboard Access

### 1. Admin Dashboard
**Access URL:** `/admin` (Admin Login Page)

**Test Credentials:**
- **Email:** `admin@quicktable.com`
- **Password:** `admin123`

**What You'll See:**
- Admin login page with dark background
- After login: Redirects to `/admin/dashboard`
- Sidebar navigation with:
  - Dashboard (stats, today's reservations)
  - Reservations
  - Tables
  - **Staff** (manage waiters/staff)
  - Customers
  - Analytics

**Key Features:**
- View today's reservation statistics
- Quick actions (new reservation, view tables, customers, reports)
- Staff management page to add new waiters

---

### 2. Waiter/Staff Dashboard
**Access URL:** `/admin` (Same login page - use waiter credentials)

**Test Credentials:**
- **Email:** `waiter@quicktable.com`
- **Password:** `waiter123`

**What You'll See:**
- Same admin login page
- After login: Redirects to `/staff/dashboard`
- Simpler dashboard focused on daily operations:
  - Today's reservation count
  - Currently seated guests
  - Upcoming reservations
  - Available tables
- Quick actions for walk-ins, viewing tables, bookings, messages

---

### 3. Customer/User Dashboard
**Access URL:** `/login` (Customer Login Page)

**Test Credentials:**
- **Email:** Any email (e.g., `customer@example.com`)
- **Password:** Any password

**What You'll See:**
- Customer-facing login page with beige background
- After login: Redirects to homepage (`/`)
- Navbar shows user dropdown with:
  - My Profile
  - My Reservations
  - Loyalty Rewards
  - Preferences
  - Logout
- Access to make reservations, view menu, etc.

---

## Quick Test Flow

### Testing Admin Access:
1. Go to `http://localhost:3000/admin`
2. Login with `admin@quicktable.com` / `admin123`
3. You'll see the admin dashboard with statistics
4. Click "Staff" in sidebar to manage waiters
5. Click "Add New Staff" to create a waiter account

### Testing Waiter Access:
1. Logout (if logged in as admin)
2. Go to `http://localhost:3000/admin`
3. Login with `waiter@quicktable.com` / `waiter123`
4. You'll see the staff dashboard (different from admin)

### Testing User Access:
1. Go to `http://localhost:3000/login`
2. Login with any email/password
3. You'll see the main website with user features
4. Click your avatar in navbar to see profile options

---

## Role-Based Redirects

**Automatic Protection:**
- Admins can't access user routes → redirected to `/admin/dashboard`
- Waiters can't access user routes → redirected to `/staff/dashboard`
- Users can't access admin/staff routes → redirected to `/login`
- Non-logged users can't access protected routes → redirected to `/login`

---

## Current Routes Organization

```
/admin/
  ├── page.tsx              # Admin & Staff login (dark theme)
  ├── dashboard/
  │   └── page.tsx          # Admin dashboard (protected: admin only)
  └── staff/
      └── page.tsx          # Staff management (protected: admin only)

/staff/
  └── dashboard/
      └── page.tsx          # Waiter dashboard (protected: waiter only)

/login                      # Customer login (beige theme)
/register                   # Customer registration

/account/                   # Protected: logged-in users only
  ├── profile/
  ├── rewards/
  └── preferences/

/my-reservations            # Protected: logged-in users only
```

---

## Testing Checklist

- [ ] Admin can login and see admin dashboard
- [ ] Admin can access staff management page
- [ ] Admin can add new waiter accounts
- [ ] Waiter can login and see staff dashboard (different UI)
- [ ] Customer can register and login
- [ ] Customer can access profile/rewards/preferences
- [ ] Unauthorized users are redirected appropriately
- [ ] Logout works for all user types
- [ ] Navbar adapts based on user role
