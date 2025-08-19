// Simple text-to-speech utility to replace AWS Polly

export const speakText = async (text: string, language: string = "en-US") => {
  try {
    // Use browser's native speech synthesis
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Select appropriate voice based on language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find((voice) => voice.lang.startsWith(language.split("-")[0]));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);

      return new Promise((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
      });
    } else {
      console.warn("Speech synthesis not supported in this browser");
      return false;
    }
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    return false;
  }
};

// Language mapping for different text types
export const detectLanguage = (text: string): string => {
  // Simple language detection based on character sets
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-CN"; // Chinese
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi
  if (/[\u0600-\u06FF]/.test(text)) return "ar-SA"; // Arabic
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "ja-JP"; // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko-KR"; // Korean

  // Default to English
  return "en-US";
};

// Voice mapping for different languages
export const getVoiceForLanguage = (language: string): string => {
  const voiceMap: Record<string, string> = {
    "en-US": "en-US",
    "en-GB": "en-GB",
    "zh-CN": "zh-CN",
    "hi-IN": "hi-IN",
    "ar-SA": "ar-SA",
    "ja-JP": "ja-JP",
    "ko-KR": "ko-KR",
  };

  return voiceMap[language] || "en-US";
};
