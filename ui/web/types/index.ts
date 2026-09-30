
import type { User as DbUser, UserRole } from "@/db/schema";

// Firebase User Interface
export interface UserInterface {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  userDocument?: UserDocument;
}

// Database User Document (matches our users table in db/schema)
export interface UserDocument extends Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  authId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  role: UserRole;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  user?: UserInterface;
  userDocument?: UserDocument;
  error?: string;
}

// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register Credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// Reset Password
export interface ResetPasswordCredentials {
  email: string;
}

export interface ConfirmResetPasswordCredentials {
  oobCode: string;
  newPassword: string;
}
