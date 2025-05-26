// src/utils/serviceUtils/awsPollyUtil.ts

import AWS, { Polly } from 'aws-sdk';
import { LanguageCode, VoiceId } from 'aws-sdk/clients/polly';

// Configure AWS SDK with explicit credentials
const awsConfig = {
  region: process.env.REACT_APP_AWS_DYNAMODB_REGION,
  credentials: new AWS.Credentials({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
  })
};

AWS.config.update(awsConfig);

// Initialize Polly with the same config
const polly = new Polly(awsConfig);

// Voice mapping for different languages
const voiceMapping: Record<string, VoiceId> = {
  english: 'Joanna',    // US English
  british: 'Amy',       // British English
  malay: 'Kendra',     // Using English voice for Malay (best alternative)
  mandarin: 'Zhiyu',   // Mandarin Chinese
  hindi: 'Aditi',      // Hindi
};

// Language detection patterns
const languagePatterns = {
  english: /^[a-zA-Z0-9\s.,!?'"-]+$/,
  mandarin: /[\u4e00-\u9fff]/,
  hindi: /[\u0900-\u097F]/,
  // Malay uses Latin alphabet, so we'll rely more on keyword detection
  malay: /^[a-zA-Z0-9\s.,!?'"-]+$/i,
};

// Detect language based on text content
const detectLanguage = (text: string): string => {
  if (languagePatterns.mandarin.test(text)) return 'mandarin';
  if (languagePatterns.hindi.test(text)) return 'hindi';
  if (languagePatterns.malay.test(text) && containsMalayKeywords(text)) return 'malay';
  return 'english';
};

// Helper function to detect Malay based on common words
const containsMalayKeywords = (text: string): boolean => {
  const malayKeywords = ['saya', 'anda', 'ini', 'itu', 'dan', 'atau', 'untuk', 'dalam', 'dengan', 'yang'];
  const words = text.toLowerCase().split(/\s+/);
  return words.some(word => malayKeywords.includes(word));
};

// Get appropriate language code for Polly
const getLanguageCode = (language: string): LanguageCode => {
  const languageCodes: Record<string, LanguageCode> = {
    english: 'en-US',
    british: 'en-GB',
    malay: 'en-US',     // Using US English as fallback since ms-MY is not supported
    mandarin: 'cmn-CN',
    hindi: 'hi-IN',
  };
  return languageCodes[language] || 'en-US';
};

export const speakWithPolly = async (text: string) => {
  try {
    // Validate AWS credentials
    if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID || !process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials are missing');
    }
    
    // Validate AWS configuration
    if (AWS.config.credentials instanceof AWS.Credentials) {
      await AWS.config.credentials.getPromise();
    } else {
      throw new Error('Invalid AWS credentials configuration');
    }

    const detectedLanguage = detectLanguage(text);
    const voiceId = voiceMapping[detectedLanguage];
    const languageCode = getLanguageCode(detectedLanguage);

    const params = {
      Engine: 'neural',
      OutputFormat: 'mp3',
      Text: text,
      TextType: 'text',
      VoiceId: voiceId,
      LanguageCode: languageCode,
    };

    // console.log('AWS Polly params:', { ...params, Text: '[REDACTED]' });
    // console.log('AWS Access Key:', process.env.REACT_APP_AWS_ACCESS_KEY_ID);
    // console.log('AWS Secret Access Key:', process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
    // console.log('AWS Config:', {
    //   region: AWS.config.region,
    //   hasCredentials: !!AWS.config.credentials,
    //   keyIdExists: !!process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    //   secretExists: !!process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    // });

    const data = await polly.synthesizeSpeech(params).promise();
    
    // Handle the AudioStream as a Uint8Array
    if (data.AudioStream && data.AudioStream instanceof Uint8Array) {
      const blob = new Blob([data.AudioStream], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // Clean up URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } else {
      throw new Error('Invalid audio stream format received from AWS Polly');
    }
  } catch (error) {
    console.error('Error using AWS Polly:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Fallback to browser's native TTS
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
  }
};