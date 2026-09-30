import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

export async function copyText(text: string): Promise<boolean> {
  if (!text?.trim()) return false;

  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error("[copyText]", error);
    return false;
  }
}

export async function shareText(
  text: string,
  title = "Partager",
): Promise<boolean> {
  if (!text?.trim()) return false;

  try {
    const result = await Share.share({
      message: text,
      title,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("[shareText]", error);
    return false;
  }
}