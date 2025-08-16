export interface Model {
    id: string;
    name: string;
    icon: React.ReactNode;
}

export interface AspectRatio {
    id: string;
    label: string;
    width: number;
    height: number;
}

export interface GenerationRequest {
    prompt: string;
    referenceImage?: string; // base64
    model: Model;
    width: number;
    height: number;
    aspectRatio: string;
    batchSize: number;
    negativePrompt?: string;
    seed?: number;
}

export interface GeneratedImage {
    id: string;
    src: string;
    prompt: string;
    resolution: string;
    aspectRatio: string;
    date: string;
    model: string;
}
