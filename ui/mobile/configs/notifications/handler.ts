// src/configs/notifications/handler.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configure le handler de notifications global
 * Défini comment les notifications sont affichées quand l'application est OUVERTE
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  console.log('✅ Notification handler configuré');
}

/**
 * Configure les catégories de notifications avec actions
 */
export async function setupNotificationCategories() {
  try {

    // Catégorie pour les rappels quotidiens
    
    console.log('✅ Catégories de notifications configurées');
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des catégories:', error);
  }
}

/**
 * Configure tous les canaux Android
 */
export async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  try {
    // Canal par défaut
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16a34a',
      sound: 'default',
      showBadge: true,
    });

    // Canal pour les rappels quotidiens
    await Notifications.setNotificationChannelAsync('daily_reminder', {
      name: 'Rappel quotidien',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b5cf6',
      sound: 'default',
      showBadge: true,
    });

    console.log('✅ Canaux Android configurés');
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des canaux:', error);
  }
}