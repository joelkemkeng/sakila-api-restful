import { Controller, Route, Get, Post, Put, Path, FormField, UploadedFile, Tags, SuccessResponse, Security } from "tsoa";
import { IUserFile } from "../model/types/IUserFile";
import { ORM } from "../utility/ORM/ORM";
import { IORMIndexResponse } from "../utility/ORM/interfaces/IORM";
import { ObjectStorage } from "../utility/storage/ObjectStorage";

@Route("/user/{userId}/file")
@Tags("UserFiles")
export class UserFileController extends Controller {

  /**
   * Upload un fichier pour un utilisateur
   * @param userId ID de l'utilisateur
   * @param file Fichier à uploader
   * @param filename Nom du fichier (optionnel)
   */
  @Put()
  @Security("jwt")
  @SuccessResponse(201, "Fichier uploadé avec succès")
  public async uploadFile(
    @Path() userId: number,
    @UploadedFile() file: Express.Multer.File,
    @FormField() filename?: string
  ): Promise<IUserFile> {
    const finalFilename = filename || file.originalname;
    const storageKey = `user/${userId}/${finalFilename}`;

    // Sauvegarder le fichier
    const publicUrl = await ObjectStorage.save(storageKey, file.buffer, file.mimetype);

    // Enregistrer en base de données
    const result = await ORM.Create<IUserFile>({
      table: 'user_files',
      data: {
        userId,
        storageKey,
        filename: finalFilename,
        mimeType: file.mimetype,
        size: file.size,
        publicUrl
      }
    });

    return result;
  }

  /**
   * Récupère la liste des fichiers d'un utilisateur
   * @param userId ID de l'utilisateur
   */
  @Get()
  @Security("jwt")
  @SuccessResponse(200, "Liste des fichiers récupérée")
  public async showFiles(
    @Path() userId: number
  ): Promise<IORMIndexResponse<IUserFile>> {
    return await ORM.Index<IUserFile>({
      table: 'user_files',
      columns: ['fileId', 'userId', 'storageKey', 'filename', 'mimeType', 'size', 'createdAt'],
      where: { userId }
    });
  }

  /**
   * Télécharge un fichier spécifique
   * @param userId ID de l'utilisateur
   * @param fileId ID du fichier
   */
  @Get("{fileId}")
  @Security("jwt")
  @SuccessResponse(200, "Fichier téléchargé")
  public async downloadFile(
    @Path() userId: number,
    @Path() fileId: number
  ): Promise<any> {
    // Récupérer les informations du fichier
    const fileInfo = await ORM.Show<IUserFile>({
      table: 'user_files',
      primaryKey: 'fileId',
      id: fileId,
      where: { userId }
    });

    if (!fileInfo) {
      this.setStatus(404);
      return { error: "Fichier non trouvé" };
    }

    // Récupérer le fichier depuis le stockage
    const fileData = await ObjectStorage.get(fileInfo.storageKey);
    
    this.setHeader('Content-Type', fileInfo.mimeType);
    this.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
    
    return fileData;
  }
}