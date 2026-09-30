import AsyncStorage from "@react-native-async-storage/async-storage";

export const Storage = {
  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch {
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const toStore =
        typeof value === "string" ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, toStore);
      return true;
    } catch {
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch {
      return false;
    }
  },

  async getSession(): Promise<string | null> {
    return Storage.getItem<string>("immo360_session_uid");
  },

  async setSession(uid: string): Promise<boolean> {
    return Storage.setItem("immo360_session_uid", uid);
  },

  async removeSession(): Promise<boolean> {
    return Storage.removeItem("immo360_session_uid");
  },

  async getCurrentDeviceId(): Promise<string | null> {
    return Storage.getItem<string>("immo360_device_id");
  },

  async setCurrentDeviceId(deviceId: string): Promise<boolean> {
    return Storage.setItem("immo360_device_id", deviceId);
  },
};

export default Storage;
