import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleApiError = (error: unknown, context: string): never => {
    console.error(`Error during ${context}:`, error);
    let message = `An unexpected error occurred while ${context}. Please try again later.`;

    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();

        if (lowerCaseMessage.includes('api key not valid')) {
            message = 'The API key is invalid. Please contact the administrator to ensure it is configured correctly.';
        } else if (lowerCaseMessage.includes('rate limit')) {
            message = 'The service is currently experiencing high traffic. Please try again in a few moments.';
        } else if (lowerCaseMessage.includes('400') || lowerCaseMessage.includes('url')) {
             message = 'The AI could not access the provided URL. Please ensure the URL is correct, publicly accessible, and not blocked by a firewall or login page.'
        } else if (lowerCaseMessage.includes('fetch failed') || lowerCaseMessage.includes('network')) {
            message = 'A network error occurred. Please check your internet connection and try again.'
        } else {
            message = error.message;
        }
    }
    
    throw new Error(message);
};

export async function extractBrandVoice(storeUrl: string, masterPrompt: string): Promise<string> {
    try {
        const prompt = `${masterPrompt}\n\nClient Shopify Store URL: ${storeUrl}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for complex analysis
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for Pro
            },
        });

        if (!response.text) {
            throw new Error('The AI returned an empty response.');
        }

        // To get website URLs, in the form [{"web": {"uri": "", "title": ""},  ... }]
        // console.log(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

        return response.text;
    } catch (e) {
        handleApiError(e, 'extracting brand voice');
    }
}

export async function synthesizeBrandProfile(rawReport: string, masterPrompt: string): Promise<string> {
   try {
        const prompt = `${masterPrompt}\n\nRaw Brand Voice Analysis Report:\n${rawReport}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite', // Using Flash-Lite for fast synthesis
            contents: prompt,
        });

        if (!response.text) {
            throw new Error('The AI returned an empty response when synthesizing the profile.');
        }

        return response.text;
    } catch (e) {
        handleApiError(e, 'synthesizing brand profile');
    }
}

export async function analyzeProduct(productUrl: string, masterPrompt: string): Promise<string> {
    try {
        const prompt = `${masterPrompt}\n\nProduct Page URL: ${productUrl}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for complex analysis
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for Pro
            },
        });

        if (!response.text) {
            throw new Error('The AI returned an empty response while analyzing the product.');
        }
        
        // To get website URLs, in the form [{"web": {"uri": "", "title": ""},  ... }]
        // console.log(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

        return response.text;
    } catch (e) {
        handleApiError(e, 'analyzing product details');
    }
}


export async function generateProductDescription(brandProfile: string, productAnalysis: string, productUrl: string, masterPrompt: string): Promise<string> {
    try {
        const prompt = `${masterPrompt}\n\n# INPUTS\n\n## 1. Finalized Brand Voice Profile:\n${brandProfile}\n\n## 2. Product Analysis Report:\n${productAnalysis}\n\n## 3. Product Page URL (for reference):\n${productUrl}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for complex generation
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for Pro
            },
        });

        if (!response.text) {
            throw new Error('The AI returned an empty response when generating the product description.');
        }

        return response.text;
    } catch(e) {
        handleApiError(e, 'generating product description');
    }
}

// New Chatbot Service Functions
export async function createChatSession(): Promise<Chat> {
    try {
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash', // Using Flash for chatbot
            config: {
                systemInstruction: 'You are an expert AI Assistant specializing in Shopify e-commerce optimization, brand voice, and conversion copywriting. Your purpose is to provide helpful, actionable advice to Shopify store owners. I can offer guidance on SEO best practices, keyword research strategies, compelling product description generation, content marketing, and general business growth for e-commerce. I cannot directly modify your Shopify store or access real-time analytics, but I can provide strategies and suggestions based on common industry practices.',
            },
        });
        return chat;
    } catch (e) {
        handleApiError(e, 'creating chat session');
    }
}

export async function streamChatResponse(chat: Chat, userMessage: string): Promise<AsyncGenerator<string, void, unknown>> {
    try {
        const response = await chat.sendMessageStream({ message: userMessage });
        return (async function* () {
            for await (const chunk of response) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        })();
    } catch (e) {
        handleApiError(e, 'streaming chat response');
    }
}