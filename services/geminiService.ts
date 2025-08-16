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
            images.push(imageUrl);
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

        // 1. If there's a reference image, use gemini-2.5-flash to describe it first
        if (request.referenceImage) {
            console.log("Analyzing reference image...");
            
            const mimeTypeMatch = request.referenceImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
                throw new Error("Invalid reference image format. Must be a data URL.");
            }
            const referenceImageMimeType = mimeTypeMatch[1];
            const referenceImageDataBase64 = request.referenceImage.split(',')[1];

            const imageParts = [{
                inlineData: {
                    mimeType: referenceImageMimeType,
                    data: referenceImageDataBase64,
                },
            }];
            const descriptionPrompt = "Describe the person in this image in extreme detail. Focus on facial features, bone structure, eye shape and color, hair style and color, and any unique identifying marks like freckles or scars. The description should be objective, precise, and suitable for an AI image generator to create a photorealistic image of the same person. Avoid describing clothing, expression, or background.";

            const descriptionResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [...imageParts, { text: descriptionPrompt }] },
            });
            const imageDescription = descriptionResponse.text;
            console.log("Generated image description:", imageDescription);

            // Structure the prompt to combine the scene and the character description
            finalPrompt = `A photorealistic image of a person with the following exact appearance: [${imageDescription}]. The person is in this scene: "${request.prompt}". It is crucial that the person's appearance matches the description precisely.`;
        }
        
        // 2. Add negative prompt if provided
        if (request.negativePrompt) {
            finalPrompt += `\n\nNegative Prompt (avoid): ${request.negativePrompt}`;
        }

        // 3. Generate the image using the final prompt
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
            throw new Error('API did not return any images.');
        }

        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        if (error instanceof Error && error.message.includes('SAFETY')) {
             throw new Error("Could not generate image due to safety policies. Please modify your prompt.");
        }
        throw new Error("Failed to generate image. Please check your prompt or API key.");
    }
};