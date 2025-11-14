export interface SQLModel {
  id: any;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
}

export interface NoSQLModel {
  id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
