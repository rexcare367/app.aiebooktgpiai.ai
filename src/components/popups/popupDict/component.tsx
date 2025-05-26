import React, { useEffect, useState } from 'react';
import { PopupDictProps } from './interface';
import OpenAI from 'openai';

type Language = 'en' | 'ms' | 'ta' | 'zh';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

interface UITranslations {
  definition: string;
  quickDefinition: string;
  whenEnlargedShow: string;
  viewDetailedExplanation: string;
  lookingUpDefinition: string;
}

interface SectionHeaders {
  translation: string;
  detailedMeaning: string;
  wordType: string;
  usage: string;
  origin: string;
  examples: string;
  relatedWords: string;
}

const uiTranslationsByLanguage: Record<Language, UITranslations> = {
  en: {
    definition: 'Definition',
    quickDefinition: 'Quick Definition',
    whenEnlargedShow: 'When enlarged, show',
    viewDetailedExplanation: 'View detailed explanation',
    lookingUpDefinition: 'Looking up definition...'
  },
  ms: {
    definition: 'Definisi',
    quickDefinition: 'Definisi Ringkas',
    whenEnlargedShow: 'Apabila diperbesarkan, tunjukkan',
    viewDetailedExplanation: 'Lihat penjelasan terperinci',
    lookingUpDefinition: 'Mencari definisi...'
  },
  ta: {
    definition: 'வரையறை',
    quickDefinition: 'விரைவான வரையறை',
    whenEnlargedShow: 'பெரிதாக்கப்பட்டால், காட்டு',
    viewDetailedExplanation: 'விரிவான விளக்கத்தைக் காண்க',
    lookingUpDefinition: 'வரையறையைத் தேடுகிறேன்...'
  },
  zh: {
    definition: '定义',
    quickDefinition: '简要定义',
    whenEnlargedShow: '放大时显示',
    viewDetailedExplanation: '查看详细解释',
    lookingUpDefinition: '正在查找定义...'
  }
};

const sectionHeadersByLanguage: Record<Language, SectionHeaders> = {
  en: {
    translation: 'Translation',
    detailedMeaning: 'Detailed Meaning',
    wordType: 'Word Type',
    usage: 'Usage',
    origin: 'Origin',
    examples: 'Examples',
    relatedWords: 'Related Words'
  },
  ms: {
    translation: 'Terjemahan',
    detailedMeaning: 'Makna Terperinci',
    wordType: 'Jenis Kata',
    usage: 'Penggunaan',
    origin: 'Asal Usul',
    examples: 'Contoh',
    relatedWords: 'Kata Berkaitan'
  },
  ta: {
    translation: 'மொழிபெயர்ப்பு',
    detailedMeaning: 'விரிவான பொருள்',
    wordType: 'சொல் வகை',
    usage: 'பயன்பாடு',
    origin: 'தோற்றம்',
    examples: 'எடுத்துக்காட்டுகள்',
    relatedWords: 'தொடர்புடைய சொற்கள்'
  },
  zh: {
    translation: '翻译',
    detailedMeaning: '详细含义',
    wordType: '词性',
    usage: '用法',
    origin: '词源',
    examples: '例句',
    relatedWords: '相关词'
  }
};

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文' },
];

const PopupDict: React.FC<PopupDictProps> = ({ originalText: initialText = "", t }) => {
  const [originalText, setOriginalText] = useState(initialText);
  const [compactDefinition, setCompactDefinition] = useState("");
  const [fullDefinition, setFullDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    if (initialText !== originalText) {
      setOriginalText(initialText);
    }
  }, [initialText]);

  const getTranslationPrompt = (text: string, targetLang: Language) => {
    const languageNames = {
      en: 'English',
      ms: 'Malay',
      ta: 'Tamil',
      zh: 'Mandarin Chinese'
    };

    if (targetLang === 'en') {
      return `Define this word briefly in one short sentence (max 15 words): ${text}`;
    }

    return `Translate and define this term in ${languageNames[targetLang]}. 
    Word: ${text}
    Provide both the translation and a brief definition in ${languageNames[targetLang]}.`;
  };

  const getDetailedTranslationPrompt = (text: string, targetLang: Language) => {
    const languageNames = {
      en: 'English',
      ms: 'Malay',
      ta: 'Tamil',
      zh: 'Mandarin Chinese'
    };
    
    const headers = sectionHeadersByLanguage[targetLang];

    if (targetLang === 'en') {
      return `Provide a clean, organized definition for: ${text}

Format as follows (without any # or * symbols):
[Quick definition in one simple sentence]

When enlarged, show:

${headers.detailedMeaning}:
[Comprehensive explanation]

${headers.wordType}:
[Part of speech and basic usage]

${headers.origin}:
[Brief etymology]

${headers.examples}:
[2-3 clear examples]

${headers.relatedWords}:
[Common synonyms and antonyms]`;
    }

    const ui = uiTranslationsByLanguage[targetLang];
    return `Provide a detailed translation and explanation in ${languageNames[targetLang]} for: ${text}

Format as follows (without any # or * symbols):
[Quick translation and definition in one sentence]

${ui.whenEnlargedShow}:

${headers.translation}:
[Word in ${languageNames[targetLang]}]

${headers.detailedMeaning}:
[Comprehensive explanation in ${languageNames[targetLang]}]

${headers.usage}:
[How to use the word in ${languageNames[targetLang]}]

${headers.examples}:
[2-3 example sentences in ${languageNames[targetLang]}]

${headers.relatedWords}:
[Similar words in ${languageNames[targetLang]}]`;
  };

  useEffect(() => {
    const lookupWord = async () => {
      if (!originalText.trim()) {
        setCompactDefinition("");
        setFullDefinition("");
        return;
      }

      setIsLoading(true);
      try {
        // Get compact definition
        const compactCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: getTranslationPrompt(originalText, selectedLanguage)
            }
          ],
          temperature: 0.3
        });

        // Get detailed definition
        const fullCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: getDetailedTranslationPrompt(originalText, selectedLanguage)
            }
          ],
          temperature: 0.7
        });

        setCompactDefinition(compactCompletion.choices[0].message.content || "No definition found");
        setFullDefinition(fullCompletion.choices[0].message.content || "No detailed definition found");
      } catch (error) {
        setCompactDefinition("Error looking up word");
        setFullDefinition("Error looking up detailed definition");
      }
      setIsLoading(false);
    };

    lookupWord();
  }, [originalText, selectedLanguage]);

  const toggleSize = () => {
    setIsEnlarged(!isEnlarged);
  };

  const containerStyle = isEnlarged ? {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    maxWidth: '800px',
    maxHeight: '80vh',
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto'
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

  return (
    <>
      {isEnlarged && <div style={overlayStyle as React.CSSProperties} onClick={toggleSize} />}
      <div 
        className={`dict-container bg-white rounded-xl shadow-lg ${isEnlarged ? 'enlarged' : ''}`} 
        style={containerStyle as React.CSSProperties}
      >
        <div className="flex justify-between items-start gap-4 p-4 border-b border-gray-100">
          <div className="flex-1">
            <textarea
              className="dict-word text-2xl font-semibold w-full px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-hidden bg-transparent"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Type any word..."
              rows={1}
              style={{ minHeight: '45px' }}
            />
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none mr-2"
            >
              {languages.find(lang => lang.code === selectedLanguage)?.nativeName}
              <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setSelectedLanguage(language.code);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedLanguage === language.code
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {language.nativeName} ({language.name})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={toggleSize}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            aria-label={isEnlarged ? "Show less" : "Show more"}
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
        
        <div className="dict-text-box p-4">
          {isLoading ? (
            <div className="loading-spinner flex justify-center items-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                <span className="text-gray-600 text-base">
                  {uiTranslationsByLanguage[selectedLanguage].lookingUpDefinition}
                </span>
              </div>
            </div>
          ) : (
            <div className="definition-content text-gray-700">
                              {isEnlarged ? (
                // Full definition with sections
                <div className="space-y-6">
                  {fullDefinition.split('\n').map((line, i) => {
                    // Check if it's the first line (main definition)
                    if (i === 0) {
                      return (
                        <div key={i} className="mb-8">
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {uiTranslationsByLanguage[selectedLanguage].definition}
                          </h1>
                          <p className="text-xl text-gray-800 pl-2">{line}</p>
                        </div>
                      );
                    }
                    // Check if line is a section header
                    if (line.endsWith(':')) {
                      return (
                        <div key={i} className="mt-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                            {line.slice(0, -1)}
                          </h2>
                        </div>
                      );
                    }
                    // Skip empty lines
                    if (!line.trim()) return null;
                    
                    // Style content based on if it's in brackets or quotes
                    const styledLine = line.replace(
                      /\[(.*?)\]/g,
                      '<span class="font-semibold">$1</span>'
                    ).replace(
                      /"(.*?)"/g,
                      '<em>$1</em>'
                    );
                    
                    return (
                      <p 
                        key={i} 
                        className="text-base leading-relaxed pl-4 text-gray-700"
                        dangerouslySetInnerHTML={{ __html: styledLine }}
                      />
                    );
                  })}
                </div>
              ) : (
                // Compact definition with better readability
                <div className="py-2">
                  <h1 className="text-xl font-bold text-gray-900 mb-3">
                    {uiTranslationsByLanguage[selectedLanguage].quickDefinition}
                  </h1>
                  <p className="text-lg leading-relaxed pl-2 text-gray-800">{compactDefinition}</p>
                  
                  <button 
                    onClick={toggleSize}
                    className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    {uiTranslationsByLanguage[selectedLanguage].viewDetailedExplanation}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PopupDict;