/* ============================================================
   DATA.JS — Booking ID System + localStorage Helpers
   Nishant Events & Catering System
   ============================================================ */

const DB_KEY = 'nis_bookings';
const PACKAGES_KEY = 'nis_packages';

/* ---------- Booking ID Generator ---------- */
function generateBookingId() {
  const year = new Date().getFullYear();
  const bookings = getAllBookings();
  const seq = bookings.length + 1;
  return `NIS-${year}-${String(seq).padStart(3, '0')}`;
}

/* ---------- Get all bookings ---------- */
function getAllBookings() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch (e) { return []; }
}

/* ---------- Save booking ---------- */
function saveBooking(booking) {
  const all = getAllBookings();
  // Check if updating
  const idx = all.findIndex(b => b.id === booking.id);
  if (idx >= 0) {
    all[idx] = booking;
  } else {
    all.unshift(booking);
  }
  localStorage.setItem(DB_KEY, JSON.stringify(all));
  return booking;
}

/* ---------- Get booking by ID ---------- */
function getBookingById(id) {
  return getAllBookings().find(b => b.id === id) || null;
}

/* ---------- Get booking by phone ---------- */
function getBookingsByPhone(phone) {
  const clean = phone.replace(/\D/g, '');
  return getAllBookings().filter(b =>
    b.phone && b.phone.replace(/\D/g, '').includes(clean)
  );
}

/* ---------- Update booking status ---------- */
function updateBookingStatus(id, status) {
  const booking = getBookingById(id);
  if (!booking) return null;
  booking.status = status;
  if (status === 'approved') {
    booking.approvedAt = new Date().toISOString();
    booking.invoiceId = `INV-${id}`;
  }
  return saveBooking(booking);
}

/* ---------- Package Data ---------- */
const DEFAULT_PACKAGES = [
  {
    id: 'veg-basic',
    name: 'Garden Delight',
    type: 'veg',
    price: 500,
    minGuests: 50,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=700',
    desc: 'A fresh, vibrant spread of seasonal Indian vegetarian specialties. Perfect for pooja functions and family gatherings.',
    features: ['Min. 50 Guests', '6 Main Course', '4 Desserts', 'Staff Included']
  },
  {
    id: 'veg-royal',
    name: 'Royal Vaishno',
    type: 'veg',
    price: 700,
    minGuests: 100,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=700',
    desc: 'An elevated all-vegetarian feast with live chaat counter, paneer specialties, and a rich dessert platter.',
    features: ['Min. 100 Guests', '10 Main Dishes', 'Live Counter', '6 Desserts']
  },
  {
    id: 'nonveg-classic',
    name: 'Classic Feast',
    type: 'nonveg',
    price: 800,
    minGuests: 50,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=700',
    desc: 'A wholesome spread including butter chicken, biryani, and a full kebab platter. A crowd-pleaser for all occasions.',
    features: ['Min. 50 Guests', '8 Main Dishes', 'BBQ Corner', 'Welcome Drinks']
  },
  {
    id: 'nonveg-mughlai',
    name: 'Mughlai Grand',
    type: 'nonveg',
    price: 1100,
    minGuests: 100,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=700',
    desc: 'Regal Mughlai cuisine: Dum Biryani, Rogan Josh, Galouti Kebabs, and a dessert bar with gulab jamun and phirni.',
    features: ['Min. 100 Guests', '12 Main Dishes', 'Live Biryani', 'Premium Service']
  },
  {
    id: 'premium-continental',
    name: 'Continental Elite',
    type: 'premium',
    price: 1500,
    minGuests: 50,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=700',
    desc: 'A sophisticated European-style multi-course dinner. Perfect for corporate galas and high-end weddings.',
    features: ['Min. 50 Guests', '4-Course Dinner', 'Sommelier', 'Premium Décor']
  },
  {
    id: 'premium-maharaja',
    name: 'Maharaja Diamond',
    type: 'premium',
    price: 2500,
    minGuests: 200,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=700',
    desc: 'The pinnacle of luxury. Live stations, curated international menu, personal chefs, and butler service for each table.',
    features: ['Min. 200 Guests', '6-Course Meal', 'Personal Chefs', 'Butler Service']
  }
];

function getPackages() {
  try {
    const stored = JSON.parse(localStorage.getItem(PACKAGES_KEY) || 'null');
    return stored || DEFAULT_PACKAGES;
  } catch (e) { return DEFAULT_PACKAGES; }
}

function savePackages(packages) {
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
}

/* ---------- Price calculation ---------- */
function calculatePrice(pricePerHead, guests) {
  const subtotal = pricePerHead * guests;
  const tax = 0;
  const grandTotal = subtotal;
  return { subtotal, tax, grandTotal };
}

/* ---------- Format helpers ---------- */
function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EVENT_LABELS = {
  wedding: '💍 Wedding & Reception',
  corporate: '🏢 Corporate Event',
  birthday: '🎂 Birthday Party',
  graduation: '🎓 Graduation Ceremony',
  festival: '🎊 Festival / Pooja',
  other: '📅 Other'
};

const PKG_LABELS = {
  veg: '🌿 Vegetarian',
  nonveg: '🍗 Non-Vegetarian',
  premium: '👑 Premium'
};

/* ---------- Admin auth ---------- */
function adminLogin(user, pass) {
  if (user === 'admin' && pass === 'admin123') {
    sessionStorage.setItem('nis_admin', '1');
    return true;
  }
  return false;
}

function isAdminLoggedIn() {
  return sessionStorage.getItem('nis_admin') === '1';
}

function adminLogout() {
  sessionStorage.removeItem('nis_admin');
}

function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = '../admin/admin-login.html';
  }
}

/* ---------- Seed demo data (DEV helper) ---------- */
function seedDemoBookings() {
  if (getAllBookings().length > 0) return;
  const demos = [
    { id: 'NIS-2026-001', name: 'Priya Sharma', phone: '9876543210', email: 'priya@example.com', eventType: 'wedding', date: '2026-05-15', pkg: 'premium', pkgName: 'Mughlai Grand', guests: 250, pricePerHead: 1100, subtotal: 275000, tax: 0, grandTotal: 275000, venue: 'Taj Hotel, Delhi', status: 'approved', invoiceId: 'INV-NIS-2026-001', createdAt: '2026-03-10', approvedAt: '2026-03-12' },
    { id: 'NIS-2026-002', name: 'Rajesh Mehra', phone: '9812345678', email: 'rajesh@corp.com', eventType: 'corporate', date: '2026-04-20', pkg: 'premium', pkgName: 'Continental Elite', guests: 150, pricePerHead: 1500, subtotal: 225000, tax: 0, grandTotal: 225000, venue: 'ITC Maurya, Mumbai', status: 'pending', createdAt: '2026-03-18' },
    { id: 'NIS-2026-003', name: 'Sunita Joshi', phone: '9998887776', email: 'sunita@gmail.com', eventType: 'birthday', date: '2026-04-08', pkg: 'veg', pkgName: 'Garden Delight', guests: 80, pricePerHead: 500, subtotal: 40000, tax: 0, grandTotal: 40000, venue: 'Residence, Pune', status: 'rejected', createdAt: '2026-03-05' },
    { id: 'NIS-2026-004', name: 'Arjun Kapoor', phone: '9123456789', email: 'arjun@example.com', eventType: 'festival', date: '2026-06-01', pkg: 'nonveg', pkgName: 'Classic Feast', guests: 120, pricePerHead: 800, subtotal: 96000, tax: 0, grandTotal: 96000, venue: 'Community Hall, Jaipur', status: 'pending', createdAt: '2026-03-22' }
  ];
  localStorage.setItem(DB_KEY, JSON.stringify(demos));
}
