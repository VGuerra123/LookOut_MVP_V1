import { useEffect } from "react";
import { startWakeWord, stopWakeWord } from "@/services/wakeword";

export function useWakeWord(callback: () => void) {
  useEffect(() => {
    startWakeWord(callback);

    return () => {
      stopWakeWord();
    };
  }, []);
}
