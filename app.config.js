require('dotenv/config');

const appJson = require('./app.json');

module.exports = ({ config }) => {
  const expo = appJson.expo || {};

  return {
    ...config,
    ...expo,
    name: expo.name || 'SobarBazarBD',
    slug: expo.slug || 'sobarbazar',
    owner: 'jobelhenry',
    version: expo.version || '1.0.1',
    ios: {
      ...(expo.ios || {}),
      bundleIdentifier: 'com.jobelhenry.sobarbazar',
    },
    android: {
      ...(expo.android || {}),
      package: 'com.jobelhenry.sobarbazar',
    },
    updates: {
      ...(expo.updates || {}),
      url: 'https://u.expo.dev/21e106b5-70ee-4a5c-bf25-9cf92472c8bb',
    },
    runtimeVersion: expo.runtimeVersion || {
      policy: 'appVersion',
    },
    extra: {
      ...(expo.extra || {}),
      apiUrl: process.env.API_URL || 'https://api.hetdcl.com',
      authApiUrl: process.env.AUTH_API_URL || 'https://api.hetdcl.com',
      eas: {
        ...(expo.extra?.eas || {}),
        projectId: '21e106b5-70ee-4a5c-bf25-9cf92472c8bb',
      },
    },
  };
};
