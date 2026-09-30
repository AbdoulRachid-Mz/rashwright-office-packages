// configs/status-bar.config.ts

import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { StatusBar as RNStatusBar, Platform } from "react-native";

export const configureStatusBar = (isDark: boolean) => {
  // Android : rend la StatusBar transparente
  if (Platform.OS === "android") {
    RNStatusBar.setTranslucent(true);
    RNStatusBar.setBackgroundColor("transparent");
  }

  return (
    <ExpoStatusBar
      style={isDark ? "light" : "dark"}
      animated
    />
  );
};



// // configs/status-bar.config.ts

// import { StatusBar } from "react-native";

// export const configureStatusBar = (
//   isDark: boolean,
//   translucent: boolean = true
// ) => {
//   return (
//     <StatusBar
//       barStyle={isDark ? "light-content" : "dark-content"}
//       animated
//       translucent={translucent}
//       backgroundColor="transparent"
//     />
//   );
// };

