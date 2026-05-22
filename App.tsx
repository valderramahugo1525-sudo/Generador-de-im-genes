
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ControlPanel } from './components/ControlPanel';
import { ImageGallery } from './components/ImageGallery';
import type { GenerationRequest, GeneratedImage } from './types';
import { generateImage } from './services/geminiService';
import { GenerationBar } from './components/GenerationBar';
import { MODELS, FEATURED_ASPECT_RATIOS } from './constants';

const App: React.FC = () => {
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(true);

    const [request, setRequest] = useState<Omit<GenerationRequest, 'aspectRatio'>>({
        prompt: '',
        referenceImage: undefined,
        model: MODELS[0],
        width: FEATURED_ASPECT_RATIOS[0].width,
        height: FEATURED_ASPECT_RATIOS[0].height,
        batchSize: 1,
        negativePrompt: '',
        seed: undefined
    });

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const aspectRatioObject = FEATURED_ASPECT_RATIOS.find(ar => ar.width === request.width && ar.height === request.height) 
            || { label: `${request.width}:${request.height}`};

        const fullRequest: GenerationRequest = {
            ...request,
            aspectRatio: aspectRatioObject.label,
        };

        try {
            const newImageSrcs = await generateImage(fullRequest);
            const newImages: GeneratedImage[] = newImageSrcs.map((src, index) => ({
                id: `gen-${Date.now()}-${index}`,
                src: src,
                prompt: fullRequest.prompt,
                resolution: `${fullRequest.width} x ${fullRequest.height}`,
                aspectRatio: fullRequest.aspectRatio,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                model: fullRequest.model.name,
                seed: fullRequest.seed,
            }));

            setGeneratedImages(prev => [...newImages, ...prev]);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [request]);

    const handleDelete = (id: string) => {
        setGeneratedImages(prev => prev.filter(image => image.id !== id));
    };

    const handleUseText = (prompt: string) => {
        setRequest(prev => ({ ...prev, prompt }));
    };
    
    const handleRemix = (image: GeneratedImage) => {
        setRequest(prev => ({
            ...prev,
            prompt: image.prompt,
            referenceImage: image.src,
            seed: undefined, // Create a new variation, don't pin the seed
        }));
        setIsSettingsOpen(true);
    };

    const handleDownload = (src: string, prompt: string) => {
        const link = document.createElement('a');
        link.href = src;
        const sanitizedPrompt = prompt.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
        link.download = `${sanitizedPrompt || 'generated_image'}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="flex h-screen w-full text-gray-300 font-sans bg-[#18181C]">
            <Sidebar />
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <ImageGallery 
                    images={generatedImages} 
                    isLoading={isLoading} 
                    error={error}
                    onDelete={handleDelete}
                    onUseText={handleUseText}
                    onRemix={handleRemix}
                    onDownload={handleDownload}
                />
                <GenerationBar 
                    request={request} 
                    setRequest={setRequest}
                    onGenerate={handleGenerate} 
                    isLoading={isLoading}
                    isSettingsOpen={isSettingsOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            </main>
            <ControlPanel 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                request={request}
                setRequest={setRequest}
            />
        </div>
    );
};

export default App;
