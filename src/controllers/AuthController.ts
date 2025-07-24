import bcrypt from "bcryptjs";
import { DB } from "../utility/ORM/DB";
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { IUser, IUserPayload, IUserLoginResponse } from "../model/types/IUser";
import { ApiError } from "../utility/error/ApiError";
import { ErrorCode } from "../utility/error/ErrorCode";
import { Controller, Route, Post, Body, Get, Security, Request, Tags, SuccessResponse } from "tsoa";
import { IRefreshToken } from "utility/auth/IAccessToken";
import { JWT } from "../utility/JWT/JWT";
import { JWT_ACCESS_AUD, JWT_ISSUER } from "../utility/JWT/JWTConstants";

/**
 * Contrôleur de gestion de l'authentification
 */
@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  private db = DB.Connection;

  /**
   * Enregistre un nouvel utilisateur
   * @param registerRequest Données d'enregistrement de l'utilisateur
   * @returns Informations sur l'utilisateur et tokens d'authentification
   */
  @Post("register")
  async register(@Body() registerRequest: { username: string, email: string, password: string }): Promise<IUserLoginResponse | null> {
    const { username, email, password } = registerRequest;
    try {
      // Vérifier si l'email existe déjà
      const [existingUsers] = await this.db.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        throw new ApiError(ErrorCode.BadRequest, 'auth/email-exists', 'Email already exists');
      }

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insérer l'utilisateur dans la base de données avec rôle par défaut 'customer'
      const [result] = await this.db.query<ResultSetHeader>(
        'INSERT INTO users (username, email, password_hash, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, 'customer', true, false]
      );

      // Récupérer l'utilisateur créé
      const [users] = await this.db.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE user_id = ?',
        [result.insertId]
      );
      
      if (users.length === 0) {
        return null;
      }

      const user = users[0] as IUser;
      
      // Générer les tokens
      const userPayload: IUserPayload = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      const accessToken = await this.generateAccessToken(userPayload);
      const refreshToken = await this.generateRefreshToken(userPayload);

      // Sauvegarder le token de rafraîchissement
      await this.saveRefreshToken(user.user_id, refreshToken);

      return {
        user: userPayload,
        token: accessToken,
        refreshToken: refreshToken
      };
    } catch (error) {
      console.error("❌ Register Error:", error);
      throw error;
    }
  }

  /**
   * Authentifie un utilisateur
   * @param loginRequest Données de connexion de l'utilisateur
   * @returns Informations sur l'utilisateur et tokens d'authentification
   */
  @SuccessResponse(200, "Login successful")
  @Post("login")
  async login(@Body() loginRequest: { email: string, password: string }): Promise<IUserLoginResponse | null> {
    const { email, password } = loginRequest;
    try {
      // Rechercher l'utilisateur par email
      const [users] = await this.db.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        return null;
      }

      const user = users[0] as IUser;
      
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!isMatch) {
        return null;
      }

      // Mettre à jour le dernier login
      await this.db.query(
        'UPDATE users SET last_login = NOW() WHERE user_id = ?',
        [user.user_id]
      );

      // Générer les tokens
      const userPayload: IUserPayload = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      const accessToken = await this.generateAccessToken(userPayload);
      const refreshToken = await this.generateRefreshToken(userPayload);

      // Sauvegarder le token de rafraîchissement
      await this.saveRefreshToken(user.user_id, refreshToken);

      return {
        user: userPayload,
        token: accessToken,
        refreshToken: refreshToken
      };
    } catch (error) {
      console.error("❌ Login Error:", error);
      throw error;
    }
  }

  /**
   * Rafraîchit un token d'accès
   * @param refreshRequest Token de rafraîchissement
   * @returns Nouveau token d'accès
   */
  @Post("renew")
  async refreshToken(@Body() refreshRequest: { refreshToken: string }): Promise<{token: string} | null> {
    const { refreshToken } = refreshRequest;
    try {
      // Vérifier si le token existe en base
      const [tokens] = await this.db.query<RowDataPacket[]>(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
        [refreshToken]
      );
      
      if (tokens.length === 0) {
        return null;
      }

      const tokenData = tokens[0] as IRefreshToken;
      
      // Vérifier et décoder le token
      try {
        const jwt = new JWT();
        const decoded = await jwt.decodeAndVerify<IUserPayload>(refreshToken, {
          issuer: JWT_ISSUER,
          audience: JWT_ACCESS_AUD
        });
        
        // Vérifier que l'utilisateur associé au token existe toujours
        const [users] = await this.db.query<RowDataPacket[]>(
          'SELECT * FROM users WHERE user_id = ?',
          [decoded.user_id]
        );
        
        if (users.length === 0) {
          return null;
        }
        
        const user = users[0] as IUser;
        
        // Générer un nouveau token d'accès
        const userPayload: IUserPayload = {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        };
        
        const newAccessToken = await this.generateAccessToken(userPayload);
        
        return { token: newAccessToken };
      } catch (error) {
        return null;
      }
    } catch (error) {
      console.error("❌ Refresh Token Error:", error);
      throw error;
    }
  }

  /**
   * Vérifie un token JWT
   * @returns Informations sur l'utilisateur décodées du token
   */
  @Get("verify")
  @Security("jwt")
  async verifyToken(@Request() request: any): Promise<IUserPayload> {
    // Le middleware JWT vérifie déjà le token et ajoute les informations décodées à la requête
    return request.user;
  }

  /**
   * Déconnecte un utilisateur (révoque son refresh token)
   * @param logoutRequest Token de rafraîchissement à révoquer
   * @returns Statut de la déconnexion
   */
  @Post("logout")
  @Security("jwt")
  async logout(@Body() logoutRequest: { refreshToken: string }, @Request() request: any): Promise<{ success: boolean }> {
    const { refreshToken } = logoutRequest;
    try {
      // Vérifier que le token appartient bien à l'utilisateur courant
      const jwt = new JWT();
      const decoded = await jwt.decodeAndVerify<IUserPayload>(refreshToken, {
        issuer: JWT_ISSUER,
        audience: JWT_ACCESS_AUD
      });
      
      if (decoded.user_id !== request.user.user_id) {
        return { success: false };
      }
      
      // Révoquer le token
      await this.db.query(
        'UPDATE refresh_tokens SET is_revoked = 1 WHERE token = ?',
        [refreshToken]
      );
      
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Génère un token d'accès
   * @param user Utilisateur
   * @returns Token JWT
   */
  private async generateAccessToken(user: IUserPayload): Promise<string> {
    const jwt = new JWT();
    return await jwt.create(user, {
      expiresIn: '1h',
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUD
    });
  }

  /**
   * Génère un token de rafraîchissement
   * @param user Utilisateur
   * @returns Token JWT
   */
  private async generateRefreshToken(user: IUserPayload): Promise<string> {
    const jwt = new JWT();
    return await jwt.create(user, {
      expiresIn: '7d',
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUD
    });
  }

  /**
   * Enregistre un token de rafraîchissement en base
   * @param userId ID de l'utilisateur
   * @param token Token de rafraîchissement
   */
  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    // Expiration dans 7 jours
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await this.db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }
}
