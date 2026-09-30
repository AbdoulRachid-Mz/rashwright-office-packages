/**
 * @rashwright/upload — types.ts
 *
 * Contrats universels pour l'upload de médias (Web & Mobile).
 */

export interface UploadSource {
  /** Nom du fichier (avec extension). */
  name: string;
  /** Taille en octets. */
  size?: number;
  /** Type MIME (ex : "image/jpeg", "video/mp4"). */
  type: string;
  /** Fichier côté Web (File ou Blob). */
  file?: Blob | File;
  /** URI locale côté Mobile (ex : "file:///var/mobile/..."). */
  uri?: string;
  /** Données Base64 ou Data URI optionnelles. */
  base64?: string;
}

export interface UploadOptions {
  /** Dossier ou préfixe de destination sur le serveur/cloud (ex : "properties/photos"). */
  folder?: string;
  /** Preset d'upload pour les providers qui le requièrent (Cloudinary non signé). */
  preset?: string;
  /** Tags optionnels pour classer le média. */
  tags?: string[];
  /** Callback de progression de l'upload (0 à 100). */
  onProgress?: (progress: number) => void;
  /** Métadonnées personnalisées. */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  /** Indique si le téléversement a réussi. */
  success: boolean;
  /** URL sécurisée finale d'accès au fichier. */
  url: string;
  /** Identifiant unique sur le fournisseur (public_id Cloudinary, Key S3...). */
  publicId?: string | undefined;
  /** Format ou extension du fichier (ex : "jpg", "mp4"). */
  format?: string | undefined;
  /** Taille finale en octets. */
  bytes?: number | undefined;
  /** Largeur de l'image/vidéo si disponible. */
  width?: number | undefined;
  /** Hauteur de l'image/vidéo si disponible. */
  height?: number | undefined;
  /** Taille originale avant compression optionnelle. */
  originalSize?: number | undefined;
  /** Taille après compression optionnelle. */
  compressedSize?: number | undefined;
}

export type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'completed' | 'error';

export interface UploadTaskState {
  id: string;
  fileName: string;
  status: UploadStatus;
  progress: number;
  result?: UploadResult;
  error?: string;
}

/**
 * Interface que tout fournisseur de stockage de fichiers doit implémenter.
 */
export interface IUploadProvider {
  /** Nom du fournisseur (ex : "cloudinary", "s3", "mock"). */
  readonly name: string;

  /** Téléverse un fichier vers la destination. */
  upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult>;

  /** Supprime un fichier à partir de son identifiant distant. */
  delete?(publicId: string): Promise<boolean>;
}
