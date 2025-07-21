/**
 * Interface représentant un membre du personnel dans la base de données Sakila
 */
export interface IStaff {
  staff_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  username: string;
  password?: string;
}
