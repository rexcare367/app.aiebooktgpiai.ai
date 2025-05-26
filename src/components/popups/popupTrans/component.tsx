import React, { useEffect, useState } from 'react';
import { PopupTransProps } from './interface';
import OpenAI from 'openai';
import StorageUtil from '../../../utils/serviceUtils/storageUtil';
import { Trans } from 'react-i18next';

const PopupTrans: React.FC<PopupTransProps> = ({ originalText: initialText = "", t }) => {
  const [originalText, setOriginalText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [sourceLang, setSourceLang] = useState(StorageUtil.getReaderConfig("transSource") || "auto");
  const [targetLang, setTargetLang] = useState(StorageUtil.getReaderConfig("transTarget") || "en");

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const languages = {
    auto: "Auto Detect",
    en: "English",
    ms: "Malay",
    ta: "Tamil",
    zh: "Mandarin"
  };

  useEffect(() => {
    if (initialText !== originalText) {
      setOriginalText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    const translateText = async () => {
      if (!originalText.trim()) {
        setTranslatedText("");
        return;
      }
      
      setIsLoading(true);
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a translator. Translate the text from ${sourceLang === 'auto' ? 'the detected language' : languages[sourceLang]} to ${languages[targetLang]}.`
            },
            {
              role: "user",
              content: originalText
            }
          ],
          temperature: 0.3
        });

        setTranslatedText(completion.choices[0].message.content || "Translation failed");
      } catch (error) {
        setTranslatedText("Error occurred during translation");
      }
      setIsLoading(false);
    };

    translateText();
  }, [originalText, sourceLang, targetLang]);

  const handleSourceLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setSourceLang(newLang);
    StorageUtil.setReaderConfig("transSource", newLang);
  };

  const handleTargetLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setTargetLang(newLang);
    StorageUtil.setReaderConfig("transTarget", newLang);
  };

  const toggleSize = () => {
    setIsEnlarged(!isEnlarged);
  };

  const containerStyle = isEnlarged ? {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    maxWidth: '900px',
    height: '80vh',
    maxHeight: '700px',
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  } : {};

  const overlayStyle = isEnlarged ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999
  } : {};

  const renderLanguageSelector = (value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void) => (
    <select
      className="trans-lang-selector px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={onChange}
    >
      {Object.entries(languages).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );

  return (
    <>
      {isEnlarged && <div style={overlayStyle as React.CSSProperties} onClick={toggleSize} />}
      <div 
        className={`trans-container bg-white ${isEnlarged ? 'enlarged' : ''}`}
        style={containerStyle as React.CSSProperties}
      >
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">From:</span>
              {renderLanguageSelector(sourceLang, handleSourceLangChange)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">To:</span>
              {renderLanguageSelector(targetLang, handleTargetLangChange)}
            </div>
          </div>
          
          <button 
            onClick={toggleSize}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isEnlarged ? "Minimize" : "Enlarge"}
          >
            {isEnlarged ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Original Text</div>
            <textarea
              className="w-full p-4 bg-gray-50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              style={{ height: 'auto' }}
              rows={1}
              placeholder="Enter text to translate..."
            />
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Translation</div>
            <div className="p-4 bg-gray-50 rounded-lg" style={{ minHeight: 'auto' }}>
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"></div>
                    <span className="text-gray-600"><Trans>Translating...</Trans></span>
                  </div>
                </div>
              ) : (
                translatedText
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupTrans;