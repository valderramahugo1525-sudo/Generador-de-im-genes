
import { GoogleGenAI } from "@google/genai";
import type { GenerationRequest } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Using mock data.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Mock function for when API key is not available
const generateMockImage = async (request: GenerationRequest): Promise<string[]> => {
    console.log("Using mock generation for:", request.prompt);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const images = [];
    for (let i = 0; i < request.batchSize; i++) {
        const seed = request.seed ? request.seed + i : Date.now() + i;
        const imageUrl = `https://picsum.photos/seed/${seed}/${request.width}/${request.height}`;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            images.push(base64);
        } catch (error) {
            console.error("Failed to fetch mock image:", error);
            // Fallback to URL if base64 conversion fails
            images.push(`https://picsum.photos/${request.width}/${request.height}`);
        }
    }
    return images;
};

// The API supports a limited set of aspect ratios. This function maps the user's
// selection to the closest supported ratio.
const getSupportedAspectRatio = (ratio: string): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
    const supportedRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    if (supportedRatios.includes(ratio)) {
        return ratio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
    }
    // Simple mapping for unsupported ratios
    const [w, h] = ratio.split(':').map(Number);
    const numericRatio = w / h;
    if (numericRatio > 1.5) return "16:9"; // Very wide
    if (numericRatio > 1.1) return "4:3"; // Landscape
    if (numericRatio > 0.9) return "1:1"; // Square
    if (numericRatio > 0.6) return "3:4"; // Portrait
    return "9:16"; // Very tall
}

export const generateImage = async (request: GenerationRequest): Promise<string[]> => {
    if (!ai) {
        return generateMockImage(request);
    }
    
    try {
        let finalPrompt = request.prompt;

        if (request.referenceImage) {
            console.log("Analyzing reference image...");
            
            const mimeTypeMatch = request.referenceImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
                throw new Error("Invalid reference image format. Must be a data URL.");
            }
            const referenceImageMimeType = mimeTypeMatch[1];
            const referenceImageDataBase64 = request.referenceImage.split(',')[1];

            const imagePart = {
                inlineData: {
                    mimeType: referenceImageMimeType,
                    data: referenceImageDataBase64,
                },
            };
            
            const descriptionPrompt = "Analyze the person in this image. Create a highly detailed, objective, and factual description of their facial features (e.g., eye shape and color, nose structure, jawline, hair color and texture). This description will be used to recreate the person. Focus only on permanent facial characteristics. Exclude any clothing, background details, lighting, or emotional expressions.";

            const descriptionResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: descriptionPrompt }] },
            });
            const imageDescription = descriptionResponse.text.trim();
            console.log("Generated image description:", imageDescription);

            finalPrompt = `A photorealistic image of "${request.prompt}", featuring a person who looks exactly like this: [${imageDescription}]. It is critical to match the facial features from the description.`;
        }
        
        if (request.negativePrompt) {
            finalPrompt += ` --no ${request.negativePrompt}`;
        }

        console.log("Generating image with final prompt:", finalPrompt);
        
        const config: {
            numberOfImages: number;
            outputMimeType: 'image/jpeg' | 'image/png';
            aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
            seed?: number;
        } = {
            numberOfImages: request.batchSize,
            outputMimeType: 'image/jpeg',
            aspectRatio: getSupportedAspectRatio(request.aspectRatio),
        };

        if (request.seed) {
            config.seed = request.seed;
        }

        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: finalPrompt,
            config,
        });
        
        if (!response.generatedImages || response.generatedImages.length === 0) {
            // Check for safety ratings or other reasons for empty response
            // This part of the response structure might vary, adjust based on actual API response
            const blockReason = (response as any).filters?.[0]?.reason;
            if (blockReason) {
                throw new Error(`Image generation blocked due to: ${blockReason}. Please adjust your prompt.`);
            }
            throw new Error('API did not return any images. The prompt might be too complex or violate safety policies.');
        }

        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        
    } catch (error: any) {
        console.error("Error generating image with Gemini API:", error);

        let errorMessage = "An unexpected error occurred while generating the image.";

        if (error.message.includes('API key not valid')) {
            errorMessage = "API Key is not valid. Please check your API key in the environment variables.";
        } else if (error.message.includes('quota')) {
            errorMessage = "You have exceeded your API quota. Please check your billing account or wait for the quota to reset.";
        } else if (error.message.includes('SAFETY')) {
            errorMessage = "Could not generate image due to safety policies. Please modify your prompt and try again.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};
