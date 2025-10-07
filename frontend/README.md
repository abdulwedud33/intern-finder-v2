# Intern Finder - Frontend

## 🚀 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intern-finder-v2/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the frontend root directory:
   ```env
   # API Configuration (Production)
   NEXT_PUBLIC_SERVER_URL=https://intern-finder-backend-v2.onrender.com
   
   # For local development, use:
   # NEXT_PUBLIC_SERVER_URL=http://localhost:5000
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Intern Finder
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SERVER_URL` | Backend API URL | https://intern-finder-backend-v2.onrender.com | ✅ |
| `NEXT_PUBLIC_APP_NAME` | Application name | Intern Finder | ❌ |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | http://localhost:3000 | ❌ |

## 🛠️ Features

### **Authentication**
- **User Registration** - Separate flows for interns and companies
- **Login/Logout** - JWT-based authentication with httpOnly cookies
- **Role-based Access** - Different dashboards for interns and companies
- **Protected Routes** - Automatic redirects based on authentication status

### **Job Management**
- **Job Listings** - Browse and search available positions
- **Job Creation** - Companies can create detailed job postings
- **Job Editing** - Update job details and requirements
- **Job Photos** - Upload images for job postings
- **Job Statistics** - Track views, applications, and performance

### **Application System**
- **Apply to Jobs** - Interns can apply with cover letters
- **Application Tracking** - View application status and history
- **Application Management** - Companies can review and manage applications
- **Status Updates** - Real-time application status changes

### **Interview Management**
- **Schedule Interviews** - Companies can schedule interviews with applicants
- **Interview Tracking** - View upcoming and past interviews
- **Interview Feedback** - Submit ratings and feedback
- **Meeting Links** - Support for video/phone/onsite interviews

### **Profile Management**
- **Intern Profiles** - Complete profile with skills, experience, education
- **Company Profiles** - Company information, logo, and details
- **File Uploads** - Resume, profile photos, company logos
- **Settings** - Account and notification preferences

### **Review System**
- **Performance Reviews** - Companies can review intern performance
- **Feedback Display** - Interns can view reviews about themselves
- **Rating System** - 5-star rating with detailed feedback

### **Dashboard Features**
- **Real-time Statistics** - Dynamic data and analytics
- **Quick Actions** - Common tasks and shortcuts
- **Recent Activity** - Latest applications and updates
- **Mobile Responsive** - Optimized for all devices

## 🎨 UI/UX Features

### **Modern Design**
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Dark/Light Mode** - Theme switching support
- **Responsive Design** - Mobile-first approach

### **User Experience**
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Comprehensive error messages
- **Toast Notifications** - Success and error feedback
- **Form Validation** - Real-time validation with Zod

### **Accessibility**
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and descriptions
- **Color Contrast** - WCAG compliant colors
- **Focus Management** - Proper focus indicators

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── intern/       # Intern dashboard
│   │   │   └── client/       # Company dashboard
│   │   ├── jobs/             # Job listing pages
│   │   └── page.tsx          # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   └── layout/           # Layout components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   ├── types/                # TypeScript types
│   └── lib/                  # Utility functions
├── public/                   # Static assets
└── package.json
```

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### **Tech Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

### **Key Dependencies**
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "axios": "^1.0.0",
  "lucide-react": "^0.400.0"
}
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Other Platforms**
- **Netlify**: Use `npm run build` and deploy `out` folder
- **AWS Amplify**: Connect repository and set build commands
- **Docker**: Use provided Dockerfile for containerized deployment

## 📱 Mobile Support

- **Responsive Design** - Works on all screen sizes
- **Touch Gestures** - Optimized for mobile interactions
- **PWA Ready** - Can be installed as a mobile app
- **Offline Support** - Basic offline functionality

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **HttpOnly Cookies** - XSS protection
- **CSRF Protection** - Cross-site request forgery prevention
- **Input Validation** - Server-side validation with Zod
- **File Upload Security** - Type and size validation

## 🧪 Testing

- **Unit Tests** - Component and utility testing
- **Integration Tests** - API integration testing
- **E2E Tests** - End-to-end user flow testing
- **Accessibility Tests** - WCAG compliance testing

## 📊 Performance

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Components and images
- **Caching** - React Query caching strategy
- **Bundle Analysis** - Webpack bundle analyzer

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**