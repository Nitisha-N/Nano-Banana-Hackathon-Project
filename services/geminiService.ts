import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // This is a fallback for development. The environment variable should be set in production.
    console.warn("API_KEY environment variable not set. The application may not work correctly.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getBackgroundInstruction = (style: string): string => {
    switch (style) {
        case 'Office':
            return 'Replace the background with a softly blurred, professional office setting. The environment should look bright and welcoming.';
        case 'Modern':
            return 'Replace the background with a minimalist modern interior, featuring clean lines and neutral colors (like greys, whites, or beiges).';
        case 'Textured':
            return 'Replace the background with a wall featuring a subtle, elegant texture. Good options are light-colored brick, soft wood paneling, or brushed concrete.';
        case 'AI Choice':
        default:
            return 'Replace the background with a professional and subtle one. Good options include a softly blurred office setting, a minimalist modern interior, or a wall with subtle texture (like light-colored brick or wood paneling). The background should look realistic and not distracting. Avoid plain, solid-color backgrounds.';
    }
};

export const enhanceProfilePicture = async (
    base64ImageData: string, 
    mimeType: string, 
    backgroundStyle: string,
    adjustBrightness: boolean,
    smoothSkin: boolean
): Promise<string> => {
    try {
        const rules = [
            "**Hair Integrity is Crucial**: Keep the original hairstyle completely intact. Do not cut, shorten, add, or erase hair. The goal is to preserve the hair's natural volume, depth, and flow. The edit must maintain the highlights and shadows that give hair its dimension. Avoid making it look plastic, overly smoothed, flat, or like a wig. Tame only minor, distracting flyaways, but ensure the overall texture remains lifelike and authentic."
        ];

        if (adjustBrightness) {
            rules.push("**Natural Skin & Lighting**: Adjust lighting, skin tone, and contrast for a natural but polished look. The skin should look healthy and smooth, but retain its natural texture.");
        } else {
            rules.push("**Preserve Lighting**: Maintain the original lighting, contrast, and skin tone as closely as possible. Do not make any automatic adjustments.");
        }

        if (smoothSkin) {
            rules.push('**Subtle Facial Retouching**: Gently reduce distracting elements like temporary blemishes, under-eye bags, and excessive wrinkles. The goal is to make the person look well-rested and refreshed, not to alter their fundamental appearance or age. Avoid overly smooth, "airbrushed" skin.');
        } else {
            rules.push("**No Facial Retouching**: Do not perform any facial retouching, skin smoothing, or removal of wrinkles/blemishes. Preserve the original facial features and skin texture completely.");
        }
        
        const backgroundInstruction = getBackgroundInstruction(backgroundStyle);
        rules.push(`**Professional Background**: ${backgroundInstruction}`);
        
        rules.push(
            '**Subject-Background Harmony**: The new background must blend seamlessly with the person. The lighting (direction, warmth, softness) on the subject must match the background. The background colors should complement the person\'s skin tone and clothing. Ensure edges, especially around hair, are soft and natural to avoid a "cut-out" look.',
            "**Clothing Enhancement**: Smooth clothing edges and enhance sharpness. Remove minor wrinkles or lint if possible, but do not replace or distort the outfit.",
            "**Authenticity is Key**: Avoid making the photo look “AI-generated” or plastic. The final result must look like a real, high-quality camera photo.",
            "**Preserve Identity**: Always maintain the original face structure and identity. The person must be instantly recognizable."
        );

        const numberedRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

        const finalPrompt = `You are a Professional LinkedIn Photo Editor AI.
Your job is to enhance profile photos while keeping the person’s natural identity, hairstyle, and facial features intact.

Editing rules:
${numberedRules}`;

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
                        text: finalPrompt,
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