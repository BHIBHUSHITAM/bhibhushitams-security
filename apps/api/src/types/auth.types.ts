export type UserRole = "student" | "company" | "admin";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email: string;
}
