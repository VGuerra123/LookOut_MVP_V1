const { withInfoPlist } = require("@expo/config-plugins");

module.exports = function withLookoutIOS(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.NSMicrophoneUsageDescription =
      "Necesitamos acceder al micrófono para comandos de voz.";
    config.modResults.NSSpeechRecognitionUsageDescription =
      "LookOut usa reconocimiento de voz local para activar funciones.";

    return config;
  });
};
