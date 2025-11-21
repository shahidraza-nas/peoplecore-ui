import { Role } from './user.type';

export interface CreateEmployeeData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_code?: string;
  phone?: string;
  avatar?: string;
  role: Role;
  enable_2fa?: boolean;
  send_email?: boolean;
}
