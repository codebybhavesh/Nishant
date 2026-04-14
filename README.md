# Nishant Events & Catering – Booking Platform

A full-stack catering management platform migrated from Firebase to a custom Node.js, Express, and MongoDB architecture. This project allows users to browse catering packages, customize menus, book events, and track their booking status, while providing a secure admin panel for management.

---

Project Structure

The project is divided into two main parts: `frontend` (Static UI) and `backend` (REST API).

### 1. Root Files
- **`README.md`**: This documentation file.
- **`.gitignore`**: Defines files and folders to be ignored by Git (like `node_modules` and `.env`).

### 2. Frontend (`/frontend`)
Contains the user interface and client-side logic.
- **`index.html`**: The landing page with service overview and contact form.
- **`packages.html`**: Displays all available catering packages.
- **`booking.html`**: The first step of the booking wizard (package selection).
- **`final-booking.html`**: The second step of the booking wizard (event details).
- **`track-booking.html`**: Allows users to check status using their Booking ID.
- **`login.html` / `signup.html`**: User authentication pages.
- **`dashboard.html`**: A post-login landing page for users.
- **`history.html`**: Shows a logged-in user's past bookings.
- **`invoice.html`**: The user-facing digital invoice page.
- **`admin/`**: 
    - `admin-login.html`: Secure entry for admins.
    - `admin-dashboard.html`: Overview of system statistics.
    - `admin-bookings.html`: List of all customer bookings with status management.
    - `manage-packages.html`: CRUD interface for adding/editing catering packages.
    - `manage-menu.html`: Interface for managing the global menu repository.
    - `custom-menu-requests.html`: Dashboard for special custom menu inquiries.
    - `admin-invoice.html`: Admin tool to generate and approve final prices.
- **`js/`**:
    - `api.js`: Shared REST client (injects JWT headers).
    - `auth.js`: Logic for registration, login, and auth state listeners.
    - `packages.js`: Logic for fetching and normalizing packages.
    - `database.js`: Logic for creating and updating bookings.
    - `cloudinary.js`: Handles direct image uploads to Cloudinary storage.
    - `main.js`: Shared UI logic (navbar, scroll effects).
- **`css/`**: `styles.css` containing the global design system.

### 3. Backend (`/backend`)
The Node.js/Express server that powers the API.
- **`src/server.js`**: Starts the HTTP server on the configured port.
- **`src/app.js`**: The main Express app configuration (CORS, JSON parsing, Static serving, API routing).
- **`src/config/`**:
    - `db.js`: Mongoose connection logic for MongoDB Atlas.
    - `env.js`: Centralized environment variable loader.
- **`src/models/`**: 
    - `User.js`: Schema for users (Email, Password, Role).
    - `Booking.js`: Schema for event bookings (Date, Guests, Total, etc.).
    - `Package.js`: Schema for catering packages and their menus.
    - `Menu.js`: Schema for individual menu items.
    - `Contact.js`: Schema for homepage contact form inquiries.
- **`src/routes/`**: Route definitions for each model (CRUD endpoints).
- **`src/middleware/`**:
    - `auth.js`: Verifies JWT tokens on protected routes.
    - `requireAdmin.js`: Restricts routes to admin users only.
- **`scripts/`**: 
    - `make-admin.js`: CLI tool to promote a user to admin role.
- **`.env`**: Private credentials. 🚨 **Never commit this file to version control.**

---

## 🚀 Setup & Installation

Follow these steps to set up the project on a new device.

### 1. Prerequisites
- **Node.js**: (v16+ recommended)
- **MongoDB Atlas Account**: For the database.
- **Cloudinary Account**: For package image uploads.

### 2. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd nishant-events

# Install backend dependencies
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file inside the `backend/` directory based on `.env.example`:
```env
PORT=3001
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_string
```

### 4. Running the Project
```bash
# From the backend folder
npm run dev
```
The application will be available at **`http://localhost:3001`**.

---

## 🛠️ Administrative Setup

By default, the admin panel at `/admin/admin-login.html` is restricted. To access it:

1.  Register a normal account at `http://localhost:3001/signup.html`.
2.  Promote yourself to Admin via the terminal:
    ```bash
    npm run make-admin -- your-email@example.com
    ```
3.  Log in at the Admin URL to manage the platform.

---

## ☁️ Image Hosting (Cloudinary)
The project uses Cloudinary for uploading package images. If you wish to use your own Cloudinary account, update the constants in `frontend/js/cloudinary.js`:
- `CLOUD_NAME`
- `UPLOAD_PRESET` (Ensure "Unsigned" upload is enabled in Cloudinary settings).

---

## 📜 Core Technologies
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6 Modules).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT (JSON Web Tokens), Bcryptjs (Password Hashing).
