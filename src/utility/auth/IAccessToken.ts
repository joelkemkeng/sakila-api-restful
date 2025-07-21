import { UserRole } from "../../model/types/IUserRole";

export interface IAccessToken {
    user_id: number;
    email: string;
    username: string;
    name?: string;
    role: UserRole;
    permissions?: string[];
}

export interface IRefreshToken {
    user_id: number;
    role: UserRole;
}