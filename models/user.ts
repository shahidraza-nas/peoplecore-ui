import { SQLModel } from "./default";

export enum Role {
  Admin = "Admin",
  User = "User",
}

export interface User extends SQLModel {
  uid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  profile_image: string;
  enable_2fa: boolean;
  last_login_at: string;
  permission_id: string;
  permissions: string[];
}
