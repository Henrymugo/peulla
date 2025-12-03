import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, ChatMessage, ChatMessageRole } from './types';
import type { ProductCopy } from './types';
import { extractBrandVoice, synthesizeBrandProfile, analyzeProduct, generateProductDescription, createChatSession, streamChatResponse } from './services/geminiService';
import Step1StoreUrlInput from './components/Step1_StoreUrlInput';
import Step2BrandProfileDisplay from './components/Step2_BrandProfileDisplay';
import Step3ProductUrlInput from './components/Step3_ProductUrlInput';
import Step4_ProductAnalysisDisplay from './components/Step4_ProductAnalysisDisplay';
import Step4ResultsDisplay from './components/Step4_ResultsDisplay';
import LoadingIndicator from './components/LoadingIndicator';
import ChatbotIcon from './components/ChatbotIcon';
import ChatWindow from './components/ChatWindow';
import HowItWorksModal from './components/HowItWorksModal';
import { InfoIcon } from './components/icons/Icons';
import { Chat } from '@google/genai';
import { prompts } from './constants';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.STORE_URL_INPUT);
  const [storeUrl, setStoreUrl] = useState<string>('');
  const [brandVoiceProfile, setBrandVoiceProfile] = useState<string>('');
  const [productUrl, setProductUrl] = useState<string>('');
  const [productAnalysis, setProductAnalysis] = useState<string>('');
  const [productCopy, setProductCopy] = useState<ProductCopy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<Chat | null>(null);
  const [isChatStreaming, setIsChatStreaming] = useState<boolean>(false);

  // Guide Modal State
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Initialize chat session on component mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const chat = await createChatSession();
        setCurrentChatSession(chat);
      } catch (e) {
        console.error("Failed to create chat session:", e);
        // Optionally display an error in the chat window or as a general app notification
      }
    };
    initChat();
  }, []); // Run only once on mount

  const handleReset = () => {
    setStep(AppStep.STORE_URL_INPUT);
    setStoreUrl('');
    setBrandVoiceProfile('');
    setProductUrl('');
    setProductAnalysis('');
    setProductCopy(null);
    setError('');
  };

  const handleStoreUrlSubmit = useCallback(async (url: string) => {
    setIsLoading(true);
    setStoreUrl(url);
    setError('');

    try {
      setLoadingMessage('Analyzing your brand voice... this can take up to a minute.');
      const rawReport = await extractBrandVoice(url, prompts.BRAND_VOICE_EXTRACTION);
      
      setLoadingMessage('Synthesizing your brand profile...');
      const profile = await synthesizeBrandProfile(rawReport, prompts.BRAND_VOICE_SYNTHESIS);
      setBrandVoiceProfile(profile);
      setStep(AppStep.BRAND_PROFILE_DISPLAY);
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleProfileAccept = () => {
    setStep(AppStep.PRODUCT_URL_INPUT);
  };
  
  const handleBackToProfile = () => {
    setProductUrl('');
    setProductAnalysis('');
    setProductCopy(null);
    setStep(AppStep.BRAND_PROFILE_DISPLAY);
  }

  const handleProductUrlAnalysis = useCallback(async (url: string) => {
    setIsLoading(true);
    setProductUrl(url);
    setError('');

    try {
      setLoadingMessage('Analyzing your product page...');
      const analysis = await analyzeProduct(url, prompts.PRODUCT_ANALYSIS);
      setProductAnalysis(analysis);
      setStep(AppStep.PRODUCT_ANALYSIS_DISPLAY);
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleGenerateCopy = useCallback(async () => {
    setProductCopy(null); // Clear previous copy to show loading indicator
    setIsLoading(true);
    setError('');

    try {
      setLoadingMessage('Generating your optimized product copy...');
      const fullCopy = await generateProductDescription(brandVoiceProfile, productAnalysis, productUrl, prompts.PRODUCT_DESCRIPTION_GENERATION);

      const metaTitleMatch = fullCopy.match(/#+\s*\*\*Meta Title.*?\*\*\n\n(.*?)\n\n/is);
      const metaDescriptionMatch = fullCopy.match(/#+\s*\*\*Meta Description.*?\*\*\n\n(.*?)\n\n/is);
      const seoKeywordsMatch = fullCopy.match(/#+\s*\*\*SEO Keywords.*?\*\*\n\n(.*?)\n\n/is);
      const relatedKeywordsMatch = fullCopy.match(/#+\s*\*\*Related Keywords.*?\*\*\n\n(.*?)\n\n/is);
      const productDescriptionMatch = fullCopy.match(/#+\s*\*\*Product Description.*?\*\*\n\n([\s\S]*)/i);
      
      if (!metaTitleMatch || !metaDescriptionMatch || !productDescriptionMatch || !seoKeywordsMatch || !relatedKeywordsMatch) {
          throw new Error("The AI returned an unexpected format. Please try generating the copy again.");
      }

      const parsedCopy: ProductCopy = {
        metaTitle: metaTitleMatch[1].trim(),
        metaDescription: metaDescriptionMatch[1].trim(),
        seoKeywords: seoKeywordsMatch[1].trim(),
        relatedKeywords: relatedKeywordsMatch[1].trim(),
        productDescription: productDescriptionMatch[1].trim(),
      };

      setProductCopy(parsedCopy);
      setStep(AppStep.RESULTS_DISPLAY);
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [brandVoiceProfile, productAnalysis, productUrl]);
  
  const handleSendChatMessage = useCallback(async (message: string) => {
    if (!currentChatSession) {
      setChatMessages((prev) => [...prev, { id: Date.now().toString(), role: ChatMessageRole.MODEL, content: 'Error: Chat session not initialized.' }]);
      return;
    }

    const userMessage: ChatMessage = { id: Date.now().toString(), role: ChatMessageRole.USER, content: message };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatStreaming(true);

    let fullResponseContent = '';
    const aiMessageId = (Date.now() + 1).toString(); // Ensure AI message has a unique ID

    setChatMessages((prev) => [...prev, { id: aiMessageId, role: ChatMessageRole.MODEL, content: '' }]);

    try {
      const stream = await streamChatResponse(currentChatSession, message);
      for await (const chunk of stream) {
        fullResponseContent += chunk;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: fullResponseContent } : msg
          )
        );
      }
    } catch (e) {
      console.error("Error streaming chat response:", e);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: fullResponseContent + '\n\n*Error: Failed to get response.*' } : msg
        )
      );
    } finally {
      setIsChatStreaming(false);
    }
  }, [currentChatSession]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator message={loadingMessage} />;
    }

    if (error) {
       return (
        <div className="text-center p-8 md:p-12">
          <div className="max-w-md mx-auto bg-[#2D1A1A] border border-[#582A2A] rounded-lg p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-serif text-red-300 mb-2">An Error Occurred</h3>
            <p className="text-text-secondary bg-background-dark/50 p-4 rounded-md mb-6">{error}</p>
            <button
              onClick={() => {
                setError('');
                if (step < AppStep.BRAND_PROFILE_DISPLAY) {
                  handleReset();
                }
              }}
              className="bg-brand-primary text-background-dark font-bold py-2 px-4 rounded-lg hover:bg-brand-primary-hover transition-colors"
            >
              {step < AppStep.BRAND_PROFILE_DISPLAY ? 'Start Over' : 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    switch (step) {
      case AppStep.STORE_URL_INPUT:
        return <Step1StoreUrlInput onSubmit={handleStoreUrlSubmit} />;
      case AppStep.BRAND_PROFILE_DISPLAY:
        return <Step2BrandProfileDisplay profile={brandVoiceProfile} onAccept={handleProfileAccept} onRestart={handleReset} />;
      case AppStep.PRODUCT_URL_INPUT:
        return <Step3ProductUrlInput onSubmit={handleProductUrlAnalysis} />;
      case AppStep.PRODUCT_ANALYSIS_DISPLAY:
        return <Step4_ProductAnalysisDisplay 
                    brandProfile={brandVoiceProfile} 
                    productAnalysis={productAnalysis} 
                    onConfirm={handleGenerateCopy} 
                    onGoBack={() => setStep(AppStep.PRODUCT_URL_INPUT)} 
                />;
      case AppStep.RESULTS_DISPLAY:
        return productCopy && <Step4ResultsDisplay 
                                copy={productCopy} 
                                onRestart={handleBackToProfile} 
                                onOptimizeAnother={() => {
                                  setProductUrl('');
                                  setProductAnalysis('');
                                  setProductCopy(null);
                                  setStep(AppStep.PRODUCT_URL_INPUT);
                                }} 
                                onRegenerate={handleGenerateCopy} // Pass the regenerate handler
                              />;
      default:
        return <Step1StoreUrlInput onSubmit={handleStoreUrlSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primary flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
        <header className="text-center mb-12 relative w-full max-w-4xl mx-auto flex flex-col items-center">
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="absolute top-0 right-0 md:top-2 md:right-0 flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors text-sm"
            >
              <InfoIcon />
              <span className="hidden sm:inline">How it Works</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wide bg-gradient-to-r from-gray-300 via-brand-primary to-gray-300 text-transparent bg-clip-text">
              Brand Voice AI Copywriter
            </h1>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              Turn your brand's unique voice into product descriptions that sell.
            </p>
        </header>
        <main className="w-full max-w-4xl mx-auto bg-background-light/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-border-color">
            {renderContent()}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Gemini AI</p>
        </footer>

        {/* Modal */}
        <HowItWorksModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

        {/* Chatbot components */}
        <ChatbotIcon isOpen={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)} />
        <ChatWindow
          isOpen={isChatOpen}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          onClose={() => setIsChatOpen(false)}
          isStreaming={isChatStreaming}
        />
    </div>
  );
};

export default App;