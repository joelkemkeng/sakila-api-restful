import { Router, Request, Response, NextFunction } from 'express';
import { ActorController } from '../controllers/ActorController';
import { expressAuthentication } from '../utility/auth/authentication.middleware';

/**
 * Routes dédiées aux acteurs
 * Ces routes sont configurées manuellement en complément de celles générées par TSOA
 * 
 * Note: Ces routes sont redondantes avec celles générées par TSOA.
 * Il est préférable d'utiliser les routes générées automatiquement qui
 * incluent les annotations de sécurité et de validation définies dans le contrôleur.
 */
const router = Router({ mergeParams: true });
const actorController = new ActorController();

// Helper pour gérer les promesses rejetées dans les middlewares Express
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Middleware de vérification du token JWT et des rôles
const checkJwt = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await expressAuthentication(req, 'jwt', roles);
      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ error: 'Unauthorized', message: error.message || 'Authentication failed' });
    }
  };
};

// Route pour récupérer tous les acteurs avec pagination
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
  
  const result = await actorController.getActors(page, pageSize);
  res.json(result);
}));

// Route pour récupérer un acteur par son ID
router.get('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid actor ID' });
  }
  
  const actor = await actorController.getActorById(id);
  
  if (!actor) {
    return res.status(404).json({ error: 'Actor not found' });
  }
  
  res.json(actor);
}));

// Route pour créer un nouvel acteur (sécurisée - admin uniquement)
router.post('/', checkJwt(['admin']), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const newActor = await actorController.createActor(req.body);
  res.status(201).json(newActor);
}));

// Route pour mettre à jour un acteur (sécurisée - admin uniquement)
router.put('/:id', checkJwt(['admin']), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier que l'ID est un nombre valide
  const idParam = req.params.id;
  const id = Number(idParam);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid actor ID format' });
  }
  
  // Appeler la méthode de mise à jour
  const updatedActor = await actorController.updateActor(id, req.body);
  
  // Vérifier si l'acteur existe
  if (!updatedActor) {
    return res.status(404).json({ error: 'Actor not found' });
  }
  
  // Renvoyer l'acteur mis à jour
  res.json(updatedActor);
}));

// Route pour supprimer un acteur (sécurisée - admin uniquement)
router.delete('/:id', checkJwt(['admin']), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier que l'ID est un nombre valide
  const idParam = req.params.id;
  const id = Number(idParam);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid actor ID format' });
  }
  
  const success = await actorController.deleteActor(id);
  
  if (!success) {
    return res.status(404).json({ error: 'Actor not found or could not be deleted' });
  }
  
  res.status(204).end();
}));

// Route pour récupérer les films d'un acteur
router.get('/:id/films', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier que l'ID est un nombre valide
  const idParam = req.params.id;
  const id = Number(idParam);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid actor ID format' });
  }
  
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
  
  const films = await actorController.getActorFilms(id, page, pageSize);
  res.json(films);
}));

export default router;
