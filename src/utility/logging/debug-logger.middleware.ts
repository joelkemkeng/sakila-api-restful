import { Request, Response, NextFunction } from 'express';
import { Log } from './Log';

/**
 * Middleware avancé pour le logging détaillé des requêtes et réponses API
 * Utile pour le débogage et les démonstrations
 */
export const debugLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Stocke l'heure de début de la requête
  const startTime = new Date();
  
  // Log de la requête entrante
  const requestBody = req.body && Object.keys(req.body).length > 0 
    ? JSON.stringify(req.body, null, 2) 
    : '(empty)';
  
  Log(`🔍 REQUÊTE ${req.method} ${req.originalUrl}`);
  Log(`📤 HEADERS: ${JSON.stringify(req.headers, null, 2)}`);
  Log(`📦 BODY: ${requestBody}`);
  
  // Capture la méthode originale pour pouvoir intercepter la réponse
  const originalSend = res.send;
  
  // Remplace la méthode send pour intercepter la réponse
  res.send = function(body: any): Response {
    // Restaure la méthode originale
    res.send = originalSend;
    
    // Calcule le temps d'exécution
    const executionTime = new Date().getTime() - startTime.getTime();
    
    // Log de la réponse
    try {
      // Tente de parser le body comme JSON pour un affichage plus propre
      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      Log(`✅ RÉPONSE ${res.statusCode} (${executionTime}ms)`);
      Log(`📥 BODY: ${JSON.stringify(parsedBody, null, 2)}`);
    } catch (e) {
      // Si ce n'est pas du JSON, affiche tel quel
      Log(`✅ RÉPONSE ${res.statusCode} (${executionTime}ms)`);
      Log(`📥 BODY: ${typeof body === 'string' ? body.substring(0, 1000) + (body.length > 1000 ? '...(tronqué)' : '') : '(non textuel)'}`);
    }
    
    // Appelle la méthode originale avec les arguments fournis
    return originalSend.apply(res, [body]);
  };
  
  // Passe au middleware suivant
  next();
};
