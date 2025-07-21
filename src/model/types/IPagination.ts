/**
 * Interface pour les options de pagination
 */
export interface IPaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Interface générique pour les résultats paginés
 */
export interface IPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interface générique pour les réponses paginées
 * @deprecated Utiliser IPaginationResult à la place
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
