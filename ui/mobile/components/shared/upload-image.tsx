import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import {
  View,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";

import { Ionicons } from "@expo/vector-icons";
import { useT } from "@/hooks/useT";
import { CloudinaryUploadService } from "@/services/cloudinary/upload.service";

export interface UploadImageFile {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
}

export interface UploadImageRef {
  /**
   * Upload toutes les images locales vers Cloudinary.
   * Utile avec autoUpload={false} au moment du submit.
   */
  uploadAll: () => Promise<string[]>;

  /**
   * Retourne les URI actuellement utilisées.
   */
  getImages: () => string[];
}

export interface UploadImageProps {
  /**
   * Liste des URI / URLs.
   *
   * - autoUpload=true  => URLs Cloudinary
   * - autoUpload=false => URI locales file://
   */
  value: string[];

  onChange: (urls: string[]) => void;

  maxImages?: number;
  multiple?: boolean;

  enableCamera?: boolean;
  enableGallery?: boolean;

  compress?: boolean;

  /**
   * Qualité JPEG entre 0 et 1.
   *
   * Exemple:
   * 0.8 = 80%
   * 0.6 = 60%
   */
  compressionQuality?: number;

  /**
   * Taille minimale avant compression.
   *
   * Exemple:
   * 500 => les images <= 500 Ko ne sont pas compressées.
   *
   * 0 => toutes les images peuvent être compressées.
   */
  minCompressionSizeKb?: number;

  /**
   * Upload automatique vers Cloudinary.
   *
   * true  => upload dès sélection
   * false => garde les images localement
   */
  autoUpload?: boolean;

  /**
   * Ancien nom conservé pour compatibilité.
   *
   * @deprecated Utiliser autoUpload.
   */
  upload?: boolean;

  uploadFn?: (file: UploadImageFile) => Promise<string>;

  size?: number;
  borderRadius?: number;

  /**
   * Autorise le déplacement des images.
   */
  enableReorder?: boolean;

  /**
   * Autorise le remplacement d'une image.
   */
  enableReplace?: boolean;
}

interface ImageItem {
  uri: string;
  uploading?: boolean;
}

const UploadImage = forwardRef<UploadImageRef, UploadImageProps>(
  function UploadImage(
    {
      value = [],
      onChange,

      maxImages = 5,
      multiple = true,

      enableCamera = true,
      enableGallery = true,

      compress = true,
      compressionQuality = 0.8,
      minCompressionSizeKb = 500,

      autoUpload,
      upload,

      uploadFn,

      size = 90,
      borderRadius = 12,

      enableReorder = true,
      enableReplace = true,
    },
    ref
  ) {
    const { t } = useT();

    const [loading, setLoading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    /**
     * Compatibilité avec l'ancien prop `upload`.
     *
     * Si autoUpload est fourni, il est prioritaire.
     */
    const shouldAutoUpload = autoUpload ?? upload ?? true;

    const canAddMore = value.length < maxImages;

    const images: ImageItem[] = useMemo(
      () => value.map((uri) => ({ uri })),
      [value]
    );

    /**
     * Vérifie la taille du fichier.
     */
    const getFileSizeKb = async (uri: string): Promise<number> => {
      try {
        const info = await FileSystem.getInfoAsync(uri);

        if (!info.exists || typeof info.size !== "number") {
          return 0;
        }

        return info.size / 1024;
      } catch (error) {
        console.warn(
          "Impossible de récupérer la taille du fichier:",
          error
        );

        return 0;
      }
    };

    /**
     * Compresse uniquement si :
     *
     * - compress === true
     * - fichier > minCompressionSizeKb
     */
    const prepareImage = async (
      assetUri: string
    ): Promise<string> => {
      if (!compress) {
        return assetUri;
      }

      const sizeKb = await getFileSizeKb(assetUri);

      /**
       * Exemple :
       *
       * minCompressionSizeKb = 500
       *
       * image = 300 Ko
       * => pas de compression
       *
       * image = 2 Mo
       * => compression
       */
      if (
        minCompressionSizeKb > 0 &&
        sizeKb > 0 &&
        sizeKb <= minCompressionSizeKb
      ) {
        return assetUri;
      }

      try {
        const manipulated =
          await ImageManipulator.manipulateAsync(
            assetUri,
            [],
            {
              compress: compressionQuality,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );

        return manipulated.uri;
      } catch (error) {
        console.warn(
          "Erreur compression image, utilisation de l'original:",
          error
        );

        return assetUri;
      }
    };

    /**
     * Upload d'une image.
     */
    const uploadImage = async (
      uri: string,
      fileName = `image_${Date.now()}.jpg`
    ): Promise<string> => {
      const preparedUri = await prepareImage(uri);

      /**
       * Fonction personnalisée.
       */
      if (uploadFn) {
        return uploadFn({
          uri: preparedUri,
          fileName,
          type: "image/jpeg",
        });
      }

      /**
       * Cloudinary.
       */
      const result =
        await CloudinaryUploadService.getInstance().uploadImage(
          preparedUri,
          {
            quality: Math.round(compressionQuality * 100),
            minSizeKb: minCompressionSizeKb,
            skipOptimization: !compress,
          }
        );

      return result.secureUrl;
    };

    /**
     * Ajout des images sélectionnées.
     *
     * Très important :
     *
     * L'image est d'abord ajoutée à value.
     * Elle ne disparaît donc jamais pendant l'upload.
     */
    const addImages = useCallback(
      async (
        assets: ImagePicker.ImagePickerAsset[]
      ) => {
        if (!assets.length) return;

        const availableSlots = maxImages - value.length;

        if (availableSlots <= 0) {
          return;
        }

        const selectedAssets = assets.slice(0, availableSlots);

        /**
         * MODE LOCAL
         *
         * On ajoute immédiatement les URI locales.
         */
        if (!shouldAutoUpload) {
          const localUris = await Promise.all(
            selectedAssets.map((asset) =>
              prepareImage(asset.uri)
            )
          );

          onChange(
            [...value, ...localUris].slice(0, maxImages)
          );

          return;
        }

        /**
         * MODE AUTO UPLOAD
         *
         * On ajoute d'abord les images locales.
         * Ensuite on remplace progressivement chaque URI par
         * son URL Cloudinary.
         */
        const preparedUris = selectedAssets.map(
          (asset) => asset.uri
        );

        const initialValue = [
          ...value,
          ...preparedUris,
        ].slice(0, maxImages);

        onChange(initialValue);

        let runningList = [...initialValue];

        for (let i = 0; i < selectedAssets.length; i++) {
          const asset = selectedAssets[i];
          const currentIndex = value.length + i;

          try {
            setUploadingIndex(currentIndex);

            const cloudinaryUrl = await uploadImage(
              asset.uri,
              asset.fileName ??
                `image_${Date.now()}_${i}.jpg`
            );

            runningList[currentIndex] = cloudinaryUrl;
            onChange([...runningList]);
          } catch (error) {
            console.error(
              "Erreur upload Cloudinary:",
              error
            );
          } finally {
            setUploadingIndex(null);
          }
        }
      },
      [
        value,
        maxImages,
        shouldAutoUpload,
        compress,
        compressionQuality,
        minCompressionSizeKb,
        uploadFn,
        onChange,
      ]
    );

    /**
     * Galerie.
     */
    const pickImage = useCallback(async () => {
      if (!canAddMore || loading) return;

      try {
        setLoading(true);

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: multiple,
            quality: 1,
          });

        if (result.canceled) {
          return;
        }

        await addImages(result.assets);
      } catch (error: any) {
        console.error(
          "Erreur sélection image:",
          error
        );

        Alert.alert(
          t(
            "chat.picker.upload_error",
            "Erreur d'image"
          ),
          error?.message ||
            t(
              "chat.picker.upload_error_msg",
              "Une erreur est survenue."
            )
        );
      } finally {
        setLoading(false);
      }
    }, [
      canAddMore,
      loading,
      multiple,
      addImages,
      t,
    ]);

    /**
     * Caméra.
     */
    const takePhoto = useCallback(async () => {
      if (!canAddMore || loading) return;

      try {
        setLoading(true);

        const result =
          await ImagePicker.launchCameraAsync({
            quality: 1,
          });

        if (result.canceled) {
          return;
        }

        await addImages([result.assets[0]]);
      } catch (error: any) {
        console.error(
          "Erreur caméra:",
          error
        );

        Alert.alert(
          t(
            "chat.picker.upload_error",
            "Erreur caméra"
          ),
          error?.message ||
            t(
              "chat.picker.camera_error_msg",
              "Impossible d'ajouter la photo."
            )
        );
      } finally {
        setLoading(false);
      }
    }, [
      canAddMore,
      loading,
      addImages,
      t,
    ]);

    /**
     * Supprimer une image.
     *
     * Attention :
     * cela supprime l'image de l'UI / value.
     *
     * Pour supprimer réellement Cloudinary, il faut passer
     * par ton backend.
     */
    const remove = useCallback(
      (index: number) => {
        const updated = [...value];

        updated.splice(index, 1);

        onChange(updated);
      },
      [value, onChange]
    );

    /**
     * Déplacer vers la gauche.
     */
    const moveLeft = useCallback(
      (index: number) => {
        if (index <= 0) return;

        const updated = [...value];

        [
          updated[index - 1],
          updated[index],
        ] = [
          updated[index],
          updated[index - 1],
        ];

        onChange(updated);
      },
      [value, onChange]
    );

    /**
     * Déplacer vers la droite.
     */
    const moveRight = useCallback(
      (index: number) => {
        if (index >= value.length - 1) return;

        const updated = [...value];

        [
          updated[index],
          updated[index + 1],
        ] = [
          updated[index + 1],
          updated[index],
        ];

        onChange(updated);
      },
      [value, onChange]
    );

    /**
     * Remplacer une image.
     */
    const replaceImage = useCallback(
      async (index: number) => {
        try {
          const result =
            await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsMultipleSelection: false,
              quality: 1,
            });

          if (result.canceled) {
            return;
          }

          const asset = result.assets[0];

          setUploadingIndex(index);

          /**
           * Mode local.
           */
          if (!shouldAutoUpload) {
            const localUri =
              await prepareImage(asset.uri);

            const updated = [...value];

            updated[index] = localUri;

            onChange(updated);

            return;
          }

          /**
           * Auto upload.
           */
          const cloudinaryUrl = await uploadImage(
            asset.uri,
            asset.fileName ??
              `replacement_${Date.now()}.jpg`
          );

          const updated = [...value];

          updated[index] = cloudinaryUrl;

          onChange(updated);
        } catch (error: any) {
          console.error(
            "Erreur remplacement image:",
            error
          );

          Alert.alert(
            t(
              "chat.picker.upload_error",
              "Erreur"
            ),
            error?.message ||
              "Impossible de remplacer l'image."
          );
        } finally {
          setUploadingIndex(null);
        }
      },
      [
        value,
        shouldAutoUpload,
        uploadFn,
        compressionQuality,
        minCompressionSizeKb,
        compress,
        onChange,
        t,
      ]
    );

    /**
     * Upload manuel de toutes les images locales.
     *
     * C'est la fonction importante pour :
     *
     * autoUpload={false}
     *
     * puis :
     *
     * const urls = await uploadRef.current?.uploadAll();
     */
    const uploadAll = useCallback(async (): Promise<string[]> => {
      if (shouldAutoUpload) {
        return [...value];
      }

      if (!value.length) {
        return [];
      }

      setLoading(true);

      try {
        const uploadedUrls: string[] = [];

        for (let i = 0; i < value.length; i++) {
          const uri = value[i];

          /**
           * Si c'est déjà une URL distante, on la garde.
           */
          if (
            uri.startsWith("http://") ||
            uri.startsWith("https://")
          ) {
            uploadedUrls.push(uri);
            continue;
          }

          setUploadingIndex(i);

          const cloudinaryUrl = await uploadImage(
            uri,
            `image_${Date.now()}_${i}.jpg`
          );

          uploadedUrls.push(cloudinaryUrl);
        }

        onChange(uploadedUrls);

        return uploadedUrls;
      } finally {
        setUploadingIndex(null);
        setLoading(false);
      }
    }, [
      shouldAutoUpload,
      value,
      uploadFn,
      compressionQuality,
      minCompressionSizeKb,
      compress,
      onChange,
    ]);

    /**
     * API impérative.
     */
    useImperativeHandle(
      ref,
      () => ({
        uploadAll,

        getImages: () => [...value],
      }),
      [uploadAll, value]
    );

    return (
      <View style={styles.container}>
        {/* =========================
            GRID
        ========================= */}
        <View style={styles.grid}>
          {images.map((item, index) => {
            const isUploading =
              uploadingIndex === index;

            return (
              <View
                key={`${item.uri}-${index}`}
                style={[
                  styles.imageBox,
                  {
                    width: size,
                    height: size,
                    borderRadius,
                  },
                ]}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={[
                    styles.image,
                    {
                      borderRadius,
                    },
                  ]}
                />

                {/* Uploading */}
                {isUploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                    />

                    <Text style={styles.uploadText}>
                      Upload...
                    </Text>
                  </View>
                )}

                {/* Numéro */}
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>
                    {index + 1}
                  </Text>
                </View>

                {/* Supprimer */}
                <Pressable
                  onPress={() => remove(index)}
                  style={styles.removeBtn}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color="#fff"
                  />
                </Pressable>

                {/* Actions */}
                {!isUploading && (
                  <View style={styles.actions}>
                    {/* Gauche */}
                    {enableReorder &&
                      index > 0 && (
                        <Pressable
                          onPress={() =>
                            moveLeft(index)
                          }
                          style={styles.actionBtn}
                        >
                          <Ionicons
                            name="chevron-back"
                            size={13}
                            color="#fff"
                          />
                        </Pressable>
                      )}

                    {/* Remplacer */}
                    {enableReplace && (
                      <Pressable
                        onPress={() =>
                          replaceImage(index)
                        }
                        style={styles.actionBtn}
                      >
                        <Ionicons
                          name="create-outline"
                          size={13}
                          color="#fff"
                        />
                      </Pressable>
                    )}

                    {/* Droite */}
                    {enableReorder &&
                      index <
                        value.length - 1 && (
                        <Pressable
                          onPress={() =>
                            moveRight(index)
                          }
                          style={styles.actionBtn}
                        >
                          <Ionicons
                            name="chevron-forward"
                            size={13}
                            color="#fff"
                          />
                        </Pressable>
                      )}
                  </View>
                )}
              </View>
            );
          })}

          {/* =========================
              ADD BUTTON
          ========================= */}
          {canAddMore && enableGallery && (
            <Pressable
              onPress={pickImage}
              disabled={loading}
              style={[
                styles.addBox,
                {
                  width: size,
                  height: size,
                  borderRadius,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#999"
                />
              ) : (
                <>
                  <Ionicons
                    name="add"
                    size={24}
                    color="#999"
                  />

                  <Text style={styles.addText}>
                    {t("common.add", "Ajouter")}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Compteur */}
        {maxImages > 1 && (
          <Text style={styles.counter}>
            {value.length}/{maxImages} image
            {value.length > 1 ? "s" : ""}
          </Text>
        )}

        {/* =========================
            CAMERA
        ========================= */}
        {enableCamera && canAddMore && (
          <Pressable
            onPress={takePhoto}
            disabled={loading}
            style={styles.cameraBtn}
          >
            <Ionicons
              name="camera"
              size={20}
              color="#fff"
            />

            <Text style={styles.cameraText}>
              {t("chat.camera", "Caméra")}
            </Text>
          </Pressable>
        )}

        {/* =========================
            GLOBAL LOADING
        ========================= */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color="#0000ff"
            />

            <Text style={styles.loadingText}>
              {shouldAutoUpload
                ? "Traitement des images..."
                : "Préparation des images..."}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

export default UploadImage;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  imageBox: {
    overflow: "hidden",
    backgroundColor: "#eee",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },

  indexBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  indexText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  actions: {
    position: "absolute",
    bottom: 5,
    left: 5,
    right: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },

  actionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 4,
  },

  addBox: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
  },

  addText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  counter: {
    marginTop: 8,
    color: "#777",
    fontSize: 12,
  },

  cameraBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  cameraText: {
    color: "#fff",
    marginLeft: 8,
  },

  loadingContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#777",
  },
});