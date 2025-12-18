// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Helper to get auth token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to get auth header
const getAuthHeader = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: Record<string, string> }> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.data,
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
};

// ==================== AUTH API ====================
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresIn: number;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: RegisterData) => {
    return apiRequest<{
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresIn: number;
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  },

  refreshToken: async (refreshToken: string) => {
    return apiRequest<{
      accessToken: string;
      refreshToken: string;
    }>(`/auth/refresh-token?refreshToken=${refreshToken}`, {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest<User>('/auth/me');
  },
};

// ==================== RESERVATION API ====================
export const reservationApi = {
  create: async (data: CreateReservationData) => {
    return apiRequest<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById: async (id: number) => {
    return apiRequest<Reservation>(`/reservations/${id}`);
  },

  getByCode: async (code: string) => {
    return apiRequest<Reservation>(`/reservations/code/${code}`);
  },

  getMyReservations: async () => {
    return apiRequest<Reservation[]>('/reservations/my-reservations');
  },

  getMyReservationsPaged: async (page = 0, size = 10, status?: string) => {
    const statusParam = status ? `&status=${status}` : '';
    return apiRequest<PagedResponse<Reservation>>(
      `/reservations/my-reservations/paged?page=${page}&size=${size}${statusParam}`
    );
  },

  update: async (id: number, data: Partial<CreateReservationData>) => {
    return apiRequest<Reservation>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: number | string, reason?: string) => {
    const reasonParam = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    // Support both numeric ID and reservation code
    const endpoint = typeof id === 'string' ? `/reservations/code/${id}/cancel` : `/reservations/${id}/cancel`;
    return apiRequest<Reservation>(`${endpoint}${reasonParam}`, {
      method: 'POST',
    });
  },
};

// ==================== TABLE API ====================
export const tableApi = {
  getAll: async () => {
    return apiRequest<Table[]>('/tables');
  },

  getById: async (id: number) => {
    return apiRequest<Table>(`/tables/${id}`);
  },

  getAvailable: async (date: string, time: string, guests: number) => {
    return apiRequest<Table[]>('/tables/available', {
      method: 'POST',
      body: JSON.stringify({ date, time, guests }),
    });
  },
};

// ==================== CONTACT API ====================
export const contactApi = {
  submit: async (data: ContactData) => {
    return apiRequest<ContactMessage>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==================== CUSTOMER API ====================
export const customerApi = {
  getProfile: async () => {
    return apiRequest<User>('/customer/profile');
  },

  updateProfile: async (data: UpdateProfileData) => {
    return apiRequest<User>('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    return apiRequest('/customer/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  getLoyaltyPoints: async () => {
    return apiRequest<number>('/customer/loyalty-points');
  },
};

// ==================== ADMIN API ====================
export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    return apiRequest<DashboardStats>('/admin/dashboard');
  },

  getStatsByDate: async (date: string) => {
    return apiRequest<DashboardStats>(`/admin/dashboard/stats/${date}`);
  },

  // Reservations
  getAllReservations: async (page = 0, size = 10, search?: string) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return apiRequest<PagedResponse<Reservation>>(
      `/admin/reservations?page=${page}&size=${size}${searchParam}`
    );
  },

  getTodayReservations: async () => {
    return apiRequest<Reservation[]>('/admin/reservations/today');
  },

  getReservationsByDate: async (date: string) => {
    return apiRequest<Reservation[]>(`/admin/reservations/date/${date}`);
  },

  getReservationsByDateRange: async (startDate: string, endDate: string) => {
    return apiRequest<Reservation[]>(`/admin/reservations/range?startDate=${startDate}&endDate=${endDate}`);
  },

  createReservation: async (data: CreateReservationData) => {
    return apiRequest<Reservation>('/admin/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReservation: async (id: number, data: Partial<CreateReservationData>) => {
    return apiRequest<Reservation>(`/admin/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  confirmReservation: async (id: number) => {
    return apiRequest<Reservation>(`/admin/reservations/${id}/confirm`, {
      method: 'POST',
    });
  },

  completeReservation: async (id: number) => {
    return apiRequest<Reservation>(`/admin/reservations/${id}/complete`, {
      method: 'POST',
    });
  },

  cancelReservation: async (id: number, reason?: string) => {
    const reasonParam = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return apiRequest<Reservation>(`/admin/reservations/${id}/cancel${reasonParam}`, {
      method: 'POST',
    });
  },

  deleteReservation: async (id: number) => {
    return apiRequest(`/admin/reservations/${id}`, {
      method: 'DELETE',
    });
  },

  // Tables
  getAllTables: async () => {
    return apiRequest<Table[]>('/admin/tables');
  },

  createTable: async (data: CreateTableData) => {
    return apiRequest<Table>('/admin/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTable: async (id: number, data: Partial<CreateTableData>) => {
    return apiRequest<Table>(`/admin/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateTableStatus: async (id: number, status: string) => {
    return apiRequest<Table>(`/admin/tables/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  },

  deleteTable: async (id: number) => {
    return apiRequest(`/admin/tables/${id}`, {
      method: 'DELETE',
    });
  },

  // Staff
  getAllStaff: async () => {
    return apiRequest<Staff[]>('/admin/staff');
  },

  createStaff: async (data: CreateStaffData) => {
    return apiRequest<Staff>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStaff: async (id: number, data: Partial<CreateStaffData>) => {
    return apiRequest<Staff>(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStaff: async (id: number) => {
    return apiRequest(`/admin/staff/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStaffStatus: async (id: number) => {
    return apiRequest<Staff>(`/admin/staff/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  // Reports - generates aggregated data from dashboard stats and reservations
  getReports: async (dateRange: string) => {
    return apiRequest<ReportData>(`/admin/reports?range=${dateRange}`);
  },

  // Customers
  getAllCustomers: async (page = 0, size = 10, search?: string) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return apiRequest<PagedResponse<User>>(
      `/admin/customers?page=${page}&size=${size}${searchParam}`
    );
  },

  getCustomerById: async (id: number) => {
    return apiRequest<User>(`/admin/customers/${id}`);
  },

  getCustomerReservations: async (id: number) => {
    return apiRequest<Reservation[]>(`/admin/customers/${id}/reservations`);
  },

  // Messages
  getAllMessages: async (page = 0, size = 10) => {
    return apiRequest<PagedResponse<ContactMessage>>(
      `/admin/messages?page=${page}&size=${size}`
    );
  },

  getUnreadMessages: async () => {
    return apiRequest<ContactMessage[]>('/admin/messages/unread');
  },

  markMessageAsRead: async (id: number) => {
    return apiRequest<ContactMessage>(`/admin/messages/${id}/read`, {
      method: 'PATCH',
    });
  },

  replyToMessage: async (id: number, replyMessage: string) => {
    return apiRequest<ContactMessage>(`/admin/messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyMessage }),
    });
  },

  deleteMessage: async (id: number) => {
    return apiRequest(`/admin/messages/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MENU API ====================
export const menuApi = {
  // Public endpoints
  getAvailableMenuItems: async () => {
    return apiRequest<MenuItem[]>('/menu/available');
  },

  getDrinks: async () => {
    return apiRequest<MenuItem[]>('/menu/drinks');
  },

  getFood: async () => {
    return apiRequest<MenuItem[]>('/menu/food');
  },

  getDrinksGrouped: async () => {
    return apiRequest<Record<string, MenuItem[]>>('/menu/drinks/grouped');
  },

  getFoodGrouped: async () => {
    return apiRequest<Record<string, MenuItem[]>>('/menu/food/grouped');
  },

  getDrinkCategories: async () => {
    return apiRequest<string[]>('/menu/categories/drinks');
  },

  getFoodCategories: async () => {
    return apiRequest<string[]>('/menu/categories/food');
  },

  // Admin endpoints
  getAllMenuItems: async () => {
    return apiRequest<MenuItem[]>('/menu/admin/all');
  },

  getAllDrinks: async () => {
    return apiRequest<MenuItem[]>('/menu/admin/drinks');
  },

  getAllFood: async () => {
    return apiRequest<MenuItem[]>('/menu/admin/food');
  },

  getMenuItemById: async (id: number) => {
    return apiRequest<MenuItem>(`/menu/admin/${id}`);
  },

  createMenuItem: async (data: CreateMenuItemData) => {
    return apiRequest<MenuItem>('/menu/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMenuItem: async (id: number, data: UpdateMenuItemData) => {
    return apiRequest<MenuItem>(`/menu/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleAvailability: async (id: number) => {
    return apiRequest<MenuItem>(`/menu/admin/${id}/toggle-availability`, {
      method: 'PATCH',
    });
  },

  deleteMenuItem: async (id: number) => {
    return apiRequest(`/menu/admin/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== STAFF API ====================
export const staffApi = {
  getTodayReservations: async () => {
    return apiRequest<Reservation[]>('/staff/reservations/today');
  },

  getReservationsByDate: async (date: string) => {
    return apiRequest<Reservation[]>(`/staff/reservations/date/${date}`);
  },

  getReservationsByDateRange: async (startDate: string, endDate: string) => {
    return apiRequest<Reservation[]>(`/staff/reservations/range?startDate=${startDate}&endDate=${endDate}`);
  },

  updateReservation: async (id: number, data: Partial<CreateReservationData>) => {
    return apiRequest<Reservation>(`/staff/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  confirmReservation: async (id: number) => {
    return apiRequest<Reservation>(`/staff/reservations/${id}/confirm`, {
      method: 'POST',
    });
  },

  completeReservation: async (id: number) => {
    return apiRequest<Reservation>(`/staff/reservations/${id}/complete`, {
      method: 'POST',
    });
  },

  cancelReservation: async (id: number, reason?: string) => {
    const reasonParam = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return apiRequest<Reservation>(`/staff/reservations/${id}/cancel${reasonParam}`, {
      method: 'POST',
    });
  },

  getAllTables: async () => {
    return apiRequest<Table[]>('/staff/tables');
  },

  updateTableStatus: async (id: number, status: string) => {
    return apiRequest<Table>(`/staff/tables/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  },
};

// ==================== TYPE DEFINITIONS ====================
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'WAITER' | 'MANAGER' | 'HOST';
  birthday?: string;
  dietaryPreferences?: string;
  favoriteTable?: string;
  specialNotes?: string;
  avatar?: string;
  enabled: boolean;
  loyaltyPoints: number;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface Reservation {
  id: number;
  reservationCode: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  preOrderData?: string;
  dietaryNotes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  loyaltyPointsEarned: number;
  tableId: number;
  tableName: string;
  tableNumber: number;
  tableLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  tableId: number;
  specialRequests?: string;
  preOrderData?: string;
  dietaryNotes?: string;
}

export interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  location: 'WINDOW' | 'CENTER' | 'PATIO' | 'BAR' | 'PRIVATE';
  shape: 'SQUARE' | 'ROUND' | 'RECTANGLE' | 'OVAL';
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
  positionX?: number;
  positionY?: number;
  description?: string;
  tableName: string;
  createdAt: string;
}

export interface CreateTableData {
  tableNumber: number;
  capacity: number;
  location: string;
  shape: string;
  positionX?: number;
  positionY?: number;
  description?: string;
}

export interface Staff {
  id: number;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'WAITER' | 'MANAGER' | 'HOST';
  active: boolean;
  avatar?: string;
  createdAt: string;
}

export interface CreateStaffData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  avatar?: string;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  dietaryPreferences?: string;
  favoriteTable?: string;
  specialNotes?: string;
  avatar?: string;
}

export interface DashboardStats {
  date: string;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  totalGuestsExpected: number;
  totalGuestsServed: number;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  occupancyRate: number;
  totalCustomers: number;
  newCustomersToday: number;
  reservationTrend: number;
  guestTrend: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ReportData {
  summary: {
    totalReservations: number;
    confirmedReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    totalGuests: number;
    averagePartySize: number;
    tableUtilization: number;
    cancellationRate: number;
  };
  topTables: Array<{
    tableNumber: number;
    bookings: number;
    avgGuests: number;
  }>;
  peakHours: Array<{
    hour: string;
    bookings: number;
  }>;
  customerStats: {
    newCustomers: number;
    returningCustomers: number;
    totalUniqueCustomers: number;
  };
  weekdayBreakdown: Array<{
    dayName: string;
    bookings: number;
  }>;
}

export interface MenuItem {
  id: number;
  type: 'DRINK' | 'FOOD';
  category: string;
  name: string;
  description?: string;
  price?: number;
  available: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  type: 'DRINK' | 'FOOD';
  category: string;
  name: string;
  description?: string;
  price?: number;
  available?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuItemData {
  type?: 'DRINK' | 'FOOD';
  category?: string;
  name?: string;
  description?: string;
  price?: number;
  available?: boolean;
  sortOrder?: number;
}
