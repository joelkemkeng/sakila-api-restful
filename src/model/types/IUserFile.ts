/**
 * Interface représentant un fichier associé à un utilisateur dans le système
 */
export interface IUserFile {
  /**
   * ID unique du fichier
   */
  fileId: number;
  
  /**
   * ID de l'utilisateur propriétaire du fichier
   */
  userId: number;
  
  /**
   * Clé de stockage du fichier (chemin dans le système de stockage)
   */
  storageKey: string;
  
  /**
   * Nom original du fichier
   */
  filename: string;
  
  /**
   * Type MIME du fichier
   */
  mimeType: string;
  
  /**
   * Taille du fichier en octets
   */
  size?: number;
  
  /**
   * Date de création du fichier
   */
  createdAt?: Date;
  
  /**
   * URL publique du fichier (si applicable)
   */
  publicUrl?: string;
}
