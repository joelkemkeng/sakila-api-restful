export type UserRole = 'admin' | 'user';

export interface IUserRole {
    user_id: number;
    role: UserRole;
}