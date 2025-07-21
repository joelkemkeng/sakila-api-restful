import { ApiError } from '@error/ApiError';
import { ErrorCode } from '@error/ErrorCode';
import { readFileSync } from 'fs';
import jwt, { JwtPayload, SignOptions, TokenExpiredError, VerifyOptions, Algorithm } from 'jsonwebtoken';
import { join } from 'path';

export class JWT {
  private static PRIVATE_KEY: string;
  private static PUBLIC_KEY: string;
  private static SECRET_KEY: string;

  constructor() {
    // Environment-specific configuration
    const useAsymmetric = process.env.JWT_USE_ASYMMETRIC === 'true';
    
    if (useAsymmetric) {
      try {
        if (!JWT.PRIVATE_KEY) {
          JWT.PRIVATE_KEY = readFileSync(process.env.PRIVATE_KEY_FILE || join('config', 'signing', 'signing.key'), 'utf8');
        }
        if (!JWT.PUBLIC_KEY) {
          JWT.PUBLIC_KEY = readFileSync(process.env.PUBLIC_KEY_FILE || join('config', 'signing', 'signing.pub'), 'utf8');
        }
      } catch (error) {
        console.error('Error loading JWT keys:', error);
        throw new Error('Failed to load JWT keys. Make sure they exist or set JWT_USE_ASYMMETRIC=false');
      }
    } else {
      // Use symmetric encryption with a secret
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        console.error('JWT_SECRET environment variable is not set!');
        throw new Error('JWT_SECRET environment variable must be set when using symmetric encryption');
      }
      JWT.SECRET_KEY = secretKey;
    }
  }

  async create<T extends object>(payload: T, options: SignOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const useAsymmetric = process.env.JWT_USE_ASYMMETRIC === 'true';
      const key = useAsymmetric ? JWT.PRIVATE_KEY : JWT.SECRET_KEY;
      const algorithm = useAsymmetric ? 'RS256' as Algorithm : 'HS256' as Algorithm;
      
      jwt.sign(payload, key, { ...options, algorithm }, (err: any, encoded) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(encoded!);
      });
    });
  }

  async decodeAndVerify<T extends JwtPayload>(token: string, options: VerifyOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const useAsymmetric = process.env.JWT_USE_ASYMMETRIC === 'true';
      const key = useAsymmetric ? JWT.PUBLIC_KEY : JWT.SECRET_KEY;
      const algorithms: Algorithm[] = useAsymmetric ? ['RS256'] : ['HS256'];
      
      jwt.verify(token, key, { ...options, algorithms }, (err: Error | null, decoded: any) => {
        if (err) {
          if (err instanceof TokenExpiredError) {
            reject(new ApiError(ErrorCode.Unauthorized, 'token/expired', 'Token expired'));
          } else {
            reject(new ApiError(ErrorCode.Unauthorized, 'token/invalid', 'Token invalid'));
          }
          return;
        }
        resolve(decoded as T);
      });
    });
  }
}