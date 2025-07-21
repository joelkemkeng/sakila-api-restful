import { NextFunction, Request, Response, Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DB } from "../utility/ORM/DB";

const router = Router({ mergeParams: true });

router.use(
    (request: Request, response: Response, next: NextFunction) => {
      console.log("this is a middleware");
  
      const auth = request.headers.authorization;
      console.log(auth);
  
      if (!auth || auth !== 'Bearer 12345') {
        next("Unidentified user!");
        return;
      }
  
  
      next();
    }
  )

// Créer un utilisateur
router.put('/',
  async (request: Request, response: Response, next: NextFunction) => {
    console.log(request.body);
    
    try {
      const db = DB.Connection;

      const result = await db.query<ResultSetHeader>(
        'insert into user set ?',
        request.body
      );

      response.send({
        id: result[0].insertId
      });
    } catch (err: any) {
      next(err.message)
    }

  }
)

// Lire les utilisateurs
router.get('/',
  async (request: Request, response: Response, next: NextFunction) => {
    
    const db = DB.Connection;

    const limit = parseInt(request.query.limit as string) || 10;
    const offset = (parseInt(request.query.page as string) || 0) * limit;

    try {
      const data = await db.query("select userId, email, familyName, givenName from user limit ? offset ?", [limit, offset]);
      const count = await db.query<{count: number}[] & RowDataPacket[]>("select count(*) as count from user");

      response.send({
        total: count[0][0].count,
        rows: data[0]
      });
    } catch (err: any) {
      next(err.message);
    }

  }
)

// Lire un utilisateur avec ID userId
router.get('/:userId',
  async (request: Request, response: Response, next: NextFunction) => {
    console.log(`Le userId est: ${request.params.userId}`);

    const db = DB.Connection;
    try {
      const data = await db.query<RowDataPacket[]>('select userId, familyName, givenName, email from user where userId = ?', [ request.params.userId ]);

      response.send(data[0][0]);
    } catch (err: any) {
      next(err.message);
    }

   
  }
);

// Mettre à jour un utilisteur
router.patch('/:userId',
  async (request: Request, response: Response, next: NextFunction) => {
    console.log(`Le userId est: ${request.params.userId}`);
    
    try {
      const db = DB.Connection;

      const result = await db.query<ResultSetHeader>(
        'update user set ? where userId = ?',
        [ request.body, request.params.userId ]
      );

      response.send({
        id: result[0].insertId
      });
    } catch (err: any) {
      next(err.message)
    }

    
  }
);

// Supprimer un utilisateur
router.delete('/:userId',
  async (request: Request, response: Response, next: NextFunction) => {
    console.log(`Le userId est: ${request.params.userId}`);
    
    
    try {
      const db = DB.Connection;

      const result = await db.query<ResultSetHeader>(
        'delete from user where userId = ?',
        [ request.params.userId ]
      );

      response.send({
        id: result[0].insertId
      });
    } catch (err: any) {
      next(err.message)
    }

  }
)

export const ROUTES_USER = router;