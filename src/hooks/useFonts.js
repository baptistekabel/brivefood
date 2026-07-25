import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'DMSans-Regular': require('../../assets/fonts/DMSans-Regular.ttf'),
          'DMSans-Medium': require('../../assets/fonts/DMSans-Medium.ttf'),
          'DMSans-SemiBold': require('../../assets/fonts/DMSans-SemiBold.ttf'),
          'DMSans-Bold': require('../../assets/fonts/DMSans-Bold.ttf'),
          'gliker-regular': require('../../assets/fonts/gliker-regular.ttf'),
        });
        console.log('✅ Polices chargées avec succès, incluant Gliker!');
        setFontsLoaded(true);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des polices:', error);
        console.log('🔄 Continuant avec les polices système...');
        setFontsLoaded(true); // Continuer avec les polices système
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
};

export default useFonts;