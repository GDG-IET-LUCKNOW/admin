# IETECH Admin Platform ⚡

A secure, high-performance internal administration panel for managing the IETECH (GDG IET Lucknow) ecosystem. Built with a heavy focus on speed, aesthetics, and optimal user experience.

## ✨ Core Capabilities

- **Secure Authentication:** JWT-based robust authentication system ensuring safe access to sensitive endpoints.
- **Dynamic Module Management:** Complete Create, Read, Update, and Delete (CRUD) pipelines for:
  - 👥 Team Members
  - 📅 Events
  - 💻 Open Source Projects
  - 📝 Blogs 
- **Universal Dual-Image Engine:** Groundbreaking embedded pipeline allowing admins to either paste living image links OR upload local files. Local files are instantly processed and converted into Base64 strings on the client to circumvent standard storage bottlenecks, mapping directly to native MongoDB string schemas.
- **Real-Time Data Previews:** Instant visual thumbnail generation upon pasting media links or uploading files to prevent blind publications.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with your favorite package manager (npm, yarn, bun). The backend API servers must be running or configured before testing authentication locally.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GDG-IET-LUCKNOW/admin.git
   cd admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔒 Security Note
The temporary development login bypass has been **disabled**. All access strictly requires live authorization tokens verified against the `https://gdg-backend-dx5f.onrender.com` server environment. Emulated or mocked tokens will instantly fail.

---
*Developed with focus and precision for GDG IET Lucknow.*
