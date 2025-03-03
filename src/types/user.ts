export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}
