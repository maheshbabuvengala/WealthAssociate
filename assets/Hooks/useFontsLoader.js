import { useState, useEffect } from "react";
import * as Font from "expo-font";

export default function useFontsLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        OpenSanssemibold: require("../Fonts/static/OpenSans-SemiBold.ttf")
        // Add more fonts here if needed
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  return fontsLoaded;
}