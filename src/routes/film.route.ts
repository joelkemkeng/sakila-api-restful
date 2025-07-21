import { Router, Request, Response, NextFunction } from 'express';
import { FilmController } from '../controllers/FilmController';

/**
 * Routes dédiées aux films
 * Ces routes sont configurées manuellement en complément de celles générées par TSOA
 */
const router = Router({ mergeParams: true });
const filmController = new FilmController();

// Route pour récupérer tous les films avec pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    
    const result = await filmController.getFilms(page, pageSize);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer un film par son ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const film = await filmController.getFilmById(id);
    
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }
    
    res.json(film);
  } catch (error) {
    next(error);
  }
});

// Route pour créer un nouveau film
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newFilm = await filmController.createFilm(req.body);
    res.status(201).json(newFilm);
  } catch (error) {
    next(error);
  }
});

// Route pour mettre à jour un film
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updatedFilm = await filmController.updateFilm(id, req.body);
    res.json(updatedFilm);
  } catch (error) {
    next(error);
  }
});

// Route pour supprimer un film
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await filmController.deleteFilm(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Film not found or could not be deleted' });
    }
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Routes personnalisées (en plus des routes CRUD standard)
router.get('/popular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    
    // Utilise la méthode de base pour l'instant
    const result = await filmController.getFilms(page, pageSize);
    
    // On pourrait implémenter une logique spécifique pour les films populaires
    // basée sur la location_count ou d'autres métriques
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    
    // Utilise la méthode de base pour l'instant
    const result = await filmController.getFilms(page, pageSize);
    
    // On pourrait implémenter un tri par release_year
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer les films par catégorie
router.get('/category/:categoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    
    const result = await filmController.getFilmsByCategory(categoryId, page, pageSize);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer les films par acteur
router.get('/actor/:actorId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = parseInt(req.params.actorId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
    
    const result = await filmController.getFilmsByActor(actorId, page, pageSize);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const filmRoutes = router;
