export interface IFilmCover {
    id: number;
    film_id: number;
    cover_path: string;
    file_type: string;
    file_size: number;
    created_at: Date;
    updated_at?: Date;
}
