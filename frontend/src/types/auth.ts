// User types
export type UserRole = 'intern' | 'company' | 'admin';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InternProfile extends BaseUser {
  role: 'intern';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  institution: string;
  degree: string;
  fieldOfStudy: string;
  skills: string[];
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface CompanyProfile extends BaseUser {
  role: 'company';
  industry: string;
  description: string;
  companySize?: string;
  website?: string;
  foundedYear?: number;
  founded?: number;
  employees?: string;
  headquarters?: string;
  logo?: string;
  techStack?: string[];
  officeLocations?: Array<{
    address: string;
    city: string;
    country: string;
    isHeadquarters?: boolean;
  }>;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export type AuthUser = InternProfile | CompanyProfile;

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterBase {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: UserRole;
}

export interface RegisterIntern extends Omit<RegisterBase, 'role'> {
  role: 'intern';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  institution: string;
  degree: string;
  fieldOfStudy: string;
}

export interface RegisterCompany extends Omit<RegisterBase, 'role'> {
  role: 'company';
  industry: string;
  description: string;
  companySize?: string;
  website?: string;
}

export type RegisterData = RegisterIntern | RegisterCompany;

// API response types
export interface AuthResponse {
  token: string;
  user: AuthUser;
  expiresIn: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  validationErrors?: {
    [key: string]: string[];
  };
}

// Password reset types
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Verification types
export interface VerifyEmailData {
  token: string;
}

// Session types
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Context types
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}
