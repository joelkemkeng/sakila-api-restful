import { UserRole } from "./IUserRole";

export interface IUser {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  salt?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
  email_verified: boolean;
}

export interface IUserPayload {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface IUserLoginResponse {
  user: IUserPayload;
  token: string;
  refreshToken: string;
}

export interface IRefreshToken {
  id: number;
  user_id: number | null;
  staff_id?: number | null;
  customer_id?: number | null;
  token: string;
  expires_at: Date | null;
  created_at: Date;
}

// Interface pour la table customer (équivalent à User pour GraphQL)
export interface ICustomer {
  customer_id: number;
  last_name: string;
  first_name: string;
  email: string;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Interface pour la création d'un user via GraphQL
export interface IUserCreate {
  familyName: string;
  givenName: string;
  email: string;
  password?: string;
  active?: boolean;
}

// Interface pour la mise à jour d'un user via GraphQL
export interface IUserUpdate {
  familyName?: string;
  givenName?: string;
  email?: string;
  active?: boolean;
}

// Conversion de Customer vers User pour GraphQL
export function customerToUser(customer: ICustomer): any {
  return {
    userId: customer.customer_id,
    familyName: customer.last_name,
    givenName: customer.first_name,
    email: customer.email,
    active: customer.active,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at
  };
}

// Conversion de User vers Customer pour GraphQL
export function userToCustomer(user: IUserCreate | IUserUpdate): any {
  const customer: any = {};
  
  if ('familyName' in user && user.familyName) customer.last_name = user.familyName;
  if ('givenName' in user && user.givenName) customer.first_name = user.givenName;
  if ('email' in user && user.email) customer.email = user.email;
  if ('active' in user) customer.active = user.active;
  
  return customer;
}
