import 'dotenv/config';

export default {
  expo: {
    name: "sobarbazar",
    slug: "sobarbazar",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.API_URL || "https://api.hetdcl.com",
      authApiUrl: process.env.AUTH_API_URL || "https://api.hetdcl.com",
    },
  },
};