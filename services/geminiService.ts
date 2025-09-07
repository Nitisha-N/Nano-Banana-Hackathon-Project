
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // This is a fallback for development. The environment variable should be set in production.
    console.warn("API_KEY environment variable not set. The application may not work correctly.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const EDITING_PROMPT = `You are a Professional LinkedIn Photo Editor AI.
Your job is to enhance profile photos while keeping the person’s natural identity, hairstyle, and facial features intact.

Editing rules:
1. Keep the hairstyle as it is, do not cut, shorten, or erase hair. Ensure the person does not look bald.
2. Adjust lighting, skin tone, and contrast for a natural but polished look.
3. Clean background to a neutral professional shade (light gray, soft blue, or white).
4. Smooth clothing edges and enhance sharpness, but do not replace or distort the outfit.
5. Avoid making the photo look “AI-generated” or plastic. It should look like a real, high-quality camera photo.
6. Always maintain the original face structure and identity.`;

export const enhanceProfilePicture = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: EDITING_PROMPT,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // The API response should contain the candidates array
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("AI did not return any candidates. The image might be restricted.");
        }
        
        // Find the image part in the response
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Bytes = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64Bytes}`;
            }
        }

        throw new Error("No image was returned by the AI. Please try a different photo.");

    } catch (error) {
        console.error("Error enhancing image with Gemini API:", error);
        // Provide a more user-friendly error message
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Invalid API Key. Please check your configuration.");
        }
        throw new Error("Failed to enhance the image. The AI may be busy or the image could not be processed.");
    }
};
