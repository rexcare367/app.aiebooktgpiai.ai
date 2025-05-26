import { franc } from 'franc';

interface TTSMakerRequest {
  api_key: string;
  text: string;
  voice_id: number;
  audio_format: 'mp3' | 'wav' | 'ogg' | 'aac' | 'opus';
  audio_speed?: number;
  audio_volume?: number;
  audio_pitch?: number;
  audio_high_quality?: number;
  text_paragraph_pause_time?: number;
  emotion_style_key?: string;
  emotion_intensity?: number;
}

interface TTSMakerResponse {
  error_code: number;
  error_summary: string;
  msg: string;
  audio_download_url: string;
  audio_download_backup_url: string;
  audio_file_expiration_timestamp: number;
  tts_task_characters_count: number;
}

const VOICE_IDS = {
  malay: 160002,
  cmn: 204,
  eng: 148,
} as const;

// Common Malay words for better detection
const MALAY_WORDS = [
  'adalah', 'yang', 'dan', 'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan',
  'telah', 'akan', 'atau', 'setelah', 'oleh', 'seperti', 'juga', 'saya', 'anda',
  'dia', 'mereka', 'kami', 'kita', 'ini', 'itu', 'sudah', 'serta', 'dapat', 'bisa',
  'ada', 'tersebut', 'bagi', 'lain', 'sebuah', 'bahwa', 'merupakan'
];

class TTSMakerService {
  private static API_URL = 'https://api.ttsmaker.com/v2/create-tts-order';

  private static getApiKey() {
    const apiKey = process.env.REACT_APP_TTSMAKER_API_KEY;
    if (!apiKey) {
      throw new Error('TTS Maker API key not found in environment variables (REACT_APP_TTSMAKER_API_KEY)');
    }
    return apiKey;
  }

  private cleanText(text: string): string {
    // Remove multiple spaces and trim
    return text.replace(/\s+/g, ' ').trim();
  }

  private containsMalayWords(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    return MALAY_WORDS.some(malayWord => words.includes(malayWord));
  }

  private detectLanguage(text: string): keyof typeof VOICE_IDS {
    // Clean the text first
    const cleanedText = this.cleanText(text);
    
    // Check for Malay words first
    if (this.containsMalayWords(cleanedText)) {
      return 'malay';
    }

    // Use franc for other languages
    const detectedLang = franc(cleanedText);
    console.log('Detected language:', detectedLang); // For debugging
    
    // Map franc language codes to our voice IDs
    switch (detectedLang) {
      case 'zsm':
      case 'zlm':
      case 'msa':
      case 'ind': // Include Indonesian as it's very similar to Malay
        return 'malay';
      case 'cmn':
      case 'zho':
      case 'chi':
        return 'cmn';
      default:
        // Additional check for Chinese characters
        if (/[\u4E00-\u9FFF]/.test(cleanedText)) {
          return 'cmn';
        }
        return 'eng';
    }
  }

  async createTTSOrder(params: Omit<TTSMakerRequest, 'api_key' | 'voice_id'> & { voice_id?: number }): Promise<string> {
    try {
      // Use provided voice_id or detect from text
      const voice_id = params.voice_id || VOICE_IDS[this.detectLanguage(params.text)];
      console.log('Selected voice_id:', voice_id); // For debugging
      
      const response = await fetch(TTSMakerService.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          voice_id,
          api_key: TTSMakerService.getApiKey(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TTSMakerResponse = await response.json();
      
      if (result.error_code !== 0) {
        throw new Error(result.error_summary || 'Failed to create TTS order');
      }

      return result.audio_download_url || result.audio_download_backup_url;
    } catch (error) {
      console.error('Error creating TTS order:', error);
      throw error;
    }
  }

  splitTextIntoChunks(text: string, maxLength: number = 19000): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + maxLength;
      
      if (end >= text.length) {
        chunks.push(text.slice(start));
        break;
      }

      // Find the last sentence end within the chunk
      const lastPeriod = text.lastIndexOf('.', end);
      const lastQuestion = text.lastIndexOf('?', end);
      const lastExclamation = text.lastIndexOf('!', end);
      
      end = Math.max(
        lastPeriod,
        lastQuestion,
        lastExclamation,
        start + 100 // Minimum chunk size to prevent infinite loops
      );

      chunks.push(text.slice(start, end + 1));
      start = end + 1;
    }

    return chunks;
  }
}

export default TTSMakerService;
