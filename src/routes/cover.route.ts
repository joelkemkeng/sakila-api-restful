import { Router } from 'express';
import { FilmCoverController } from '../controllers/FilmCoverController';
import multer from 'multer';
import path from 'path';

/**
 * Routes dédiées aux images de couverture des films
 * Ces routes sont configurées manuellement en complément de celles générées par TSOA
 */
const router = Router({ mergeParams: true });
const coverController = new FilmCoverController();

// Configuration de multer pour le téléchargement des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'covers'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cover-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images (jpeg, jpg, png, webp) sont autorisées'));
    }
  }
});

// Routes personnalisées (en plus de celles générées par TSOA)
router.post('/:filmId/upload', upload.single('cover'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé' });
      return;
    }
    
    const filmId = parseInt(req.params.filmId);
    
    if (isNaN(filmId)) {
      res.status(400).json({ error: 'ID de film invalide' });
      return;
    }
    
    // Convertir le fichier au format attendu par le contrôleur
    // Le contrôleur s'attend à un Express.Multer.File, mais notre middleware multer fournit un format différent
    // Nous devons adapter notre objet file
    const fileForController = {
      ...req.file,
      buffer: require('fs').readFileSync(req.file.path)
    };
    
    // Utiliser la méthode uploadCover qui existe réellement dans le contrôleur
    const result = await coverController.uploadCover(filmId, fileForController);
    
    // Supprimer le fichier temporaire créé par multer car le contrôleur crée sa propre copie
    require('fs').unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const coverRoutes = router;
