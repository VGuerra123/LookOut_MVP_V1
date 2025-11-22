const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withLookoutAndroid(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Asegurar permisos
    const requiredPermissions = [
      "android.permission.RECORD_AUDIO",
      "android.permission.WAKE_LOCK",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION"
    ];

    manifest.manifest["uses-permission"] = [
      ...(manifest.manifest["uses-permission"] || []),
      ...requiredPermissions.map((p) => ({ $: { "android:name": p } }))
    ];

    return config;
  });
};
