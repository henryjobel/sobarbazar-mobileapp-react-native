import 'dotenv/config';

export default {
  expo: {
    name: "sobarbazar",
    slug: "sobarbazar",
    owner: "jobelhenry",
    version: "1.0.0",

    android: {
      package: "com.jobelhenry.sobarbazar",
    },

    ios: {
      bundleIdentifier: "com.jobelhenry.sobarbazar",
    },

    extra: {
      apiUrl: process.env.API_URL || "https://api.hetdcl.com",
      authApiUrl: process.env.AUTH_API_URL || "https://api.hetdcl.com",
      eas: {
        projectId: "21e106b5-70ee-4a5c-bf25-9cf92472c8bb",
      },
    },
  },
};