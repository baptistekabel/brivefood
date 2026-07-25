import Constants from 'expo-constants';

// Identifiant du projet EAS, requis par getExpoPushTokenAsync.
//
// Il était auparavant codé en dur dans trois fichiers, avec une valeur qui ne
// correspondait plus à celle d'app.json : getExpoPushTokenAsync échouait donc
// systématiquement, aucun token n'était enregistré, et les notifications
// groupées n'avaient aucun destinataire.
//
// On le lit désormais depuis la configuration de l'application, pour qu'il
// suive automatiquement app.json.
export const getExpoProjectId = () => {
  const fromConfig =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    Constants?.manifest?.extra?.eas?.projectId;

  if (!fromConfig) {
    console.warn('⚠️ projectId EAS introuvable dans la configuration Expo');
  }

  return fromConfig || null;
};

export default getExpoProjectId;
