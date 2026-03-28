import { ConfigContext } from "expo/config";

export default ({ config }: ConfigContext) => ({
  ...config,
  name: "Yumail",
  slug: "yumail-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "yumailapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.BUNDLE_ID_IOS,
    icon: "./assets/images/yumail.icon",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    package: process.env.BUNDLE_ID_ANDROID,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon-dark.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/images/splash-icon-light.png",
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Inter-Regular.ttf",
          "./assets/fonts/Inter-Medium.ttf",
          "./assets/fonts/Inter-SemiBold.ttf",
          "./assets/fonts/PlayfairDisplay-Regular.ttf",
          "./assets/fonts/PlayfairDisplay-Italic.ttf",
          "./assets/fonts/PlayfairDisplay-Medium.ttf",
          "./assets/fonts/PlayfairDisplay-SemiBold.ttf",
        ],
      },
    ],
    "expo-image",
    "expo-web-browser",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#202646",
        defaultChannel: "emails",
      },
    ],
  ],
  extra: {
    eas: {
      projectId:
        process.env.EAS_PROJECT_ID ?? "1a144acb-56b8-4557-b14f-d1c63215e5bc",
    },
    router: {},
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  owner: "yushanwebdev",
});
