# Intern Finder - Backend

## 🚀 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intern-finder-v2/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend root directory (you can use `ENV.EXAMPLE` as a template):
   ```bash
   # Windows (PowerShell)
   Copy-Item ENV.EXAMPLE .env
   # macOS/Linux
   cp ENV.EXAMPLE .env
   ```
   
   Update the `.env` file with your configuration (including Cloudinary):
   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/intern-finder
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # (Optional) Local upload fallback
   MAX_FILE_UPLOAD=5000000
   FILE_UPLOAD_PATH=./public/uploads
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | - | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `JWT_EXPIRE` | JWT token expiration | 30d | ❌ |
| `JWT_COOKIE_EXPIRE` | Cookie expiration in days | 30 | ❌ |
| `PORT` | Server port | 5000 | ❌ |
| `NODE_ENV` | Environment mode | development | ❌ |
| `MAX_FILE_UPLOAD` | Max file size in bytes | 5000000 | ❌ |
| `FILE_UPLOAD_PATH` | File upload directory | ./public/uploads | ❌ |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 | ❌ |
| `FRONTEND_URL` | Frontend application URL | http://localhost:3000 | ❌ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | ✅ |

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/register/intern` — Register as intern
- `POST /api/auth/register/company` — Register as company
- `POST /api/auth/login` — User login
- `GET /api/auth/logout` — User logout
- `GET /api/auth/me` — Get current user

### **Jobs**
- `GET /api/jobs` — Get all jobs
- `GET /api/jobs/detail/:id` — Get job by ID
- `POST /api/jobs` — Create job (company only)
- `PUT /api/jobs/:id` — Update job (company only)
- `DELETE /api/jobs/:id` — Delete job (company only)
- `PUT /api/jobs/:id/close` — Close job (company only)
- `PUT /api/jobs/:id/photo` — Upload job photo (company only)
- `GET /api/jobs/stats/company` — Get job statistics (company only)

### **Applications**
- `POST /api/applications` — Create application (intern only)
- `GET /api/applications/me` — Get my applications (intern only)
- `GET /api/applications/company` — Get company applications (company only)
- `PUT /api/applications/:id/status` — Update application status (company only)

### **Interviews**
- `POST /api/interviews` — Schedule interview (company only)
- `GET /api/interviews/me` — Get my interviews (intern only)
- `GET /api/interviews/company` — Get company interviews (company only)
- `PUT /api/interviews/:id` — Update interview
- `DELETE /api/interviews/:id` — Cancel interview

### **File Uploads (Cloudinary)**
- `POST /api/uploads/cloudinary/avatar` — Upload avatar (intern only)
- `POST /api/uploads/cloudinary/resume` — Upload resume (intern only)
- `POST /api/uploads/cloudinary/logo` — Upload company logo (company only)
- `DELETE /api/uploads/cloudinary/delete` — Delete file
- `POST /api/uploads/cloudinary/signature` — Get upload signature for direct uploads

### **Reviews**
- `GET /api/reviews` — Get all reviews
- `POST /api/reviews` — Create review
- `GET /api/reviews/me` — Get my reviews
- `GET /api/reviews/about-me` — Get reviews about me

### **Companies**
- `GET /api/companies` — Get all companies
- `GET /api/companies/:id` — Get company by ID
- `GET /api/companies/me` — Get my company profile
- `PUT /api/companies/me` — Update company profile
- `PUT /api/companies/me/logo` — Upload company logo

### **Interns**
- `GET /api/interns` — Get all interns
- `GET /api/interns/:id` — Get intern by ID
- `GET /api/interns/me` — Get my intern profile
- `PUT /api/interns/me` — Update intern profile
- `PUT /api/interns/me/photo` — Upload profile photo
- `PUT /api/interns/me/resume` — Upload resume

## 🛠️ Features

- **Authentication & Authorization** - JWT-based auth with role-based access
- **File Upload** - Support for images and documents
- **Interview Management** - Schedule, manage, and track interviews
- **Application System** - Complete job application workflow
- **Review System** - Company and intern review functionality
- **Real-time Statistics** - Dynamic dashboard data
- **Security** - CORS, rate limiting, input sanitization
- **Error Handling** - Comprehensive error management

## 📁 Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── public/          # Static files
└── server.js        # Main server file
```

## 🔧 Development

- **Hot Reload**: `npm run dev`
- **Production Build**: `npm start`
- **Linting**: `npm run lint`
- **Testing**: `npm test`

---