import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "TodoListApp",
  slug: "todolist-app",
  scheme: "mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: { supportsTablet: true },
  android: {
    package: "com.nicolas.todolistapp",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
  },
  web: { favicon: "./assets/favicon.png", bundler: "metro" },
  plugins: ["expo-router", "expo-secure-store"],
  extra: {
    apiUrl: process.env["EXPO_PUBLIC_API_URL"],
    eas: {
      projectId: "39631200-6fbd-47e1-a2bf-2be73a2db40d",
    }
  },
});