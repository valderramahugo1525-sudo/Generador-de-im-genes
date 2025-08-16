
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ControlPanel } from './components/ControlPanel';
import { ImageGallery } from './components/ImageGallery';
import type { GenerationRequest, GeneratedImage } from './types';
import { generateImage } from './services/geminiService';
import { Header } from './components/Header';

const App: React.FC = () => {
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async (request: GenerationRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const newImageSrcs = await generateImage(request);
            const newImages: GeneratedImage[] = newImageSrcs.map((src, index) => ({
                id: `gen-${Date.now()}-${index}`,
                src: src,
                prompt: request.prompt,
                resolution: `${request.width} x ${request.height}`,
                aspectRatio: request.aspectRatio,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                model: request.model.name,
            }));

            setGeneratedImages(prev => [...newImages, ...prev]);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="flex h-screen w-full text-gray-300 font-sans">
            <Sidebar />
            <main className="flex flex-1 h-screen overflow-hidden">
                <ControlPanel onGenerate={handleGenerate} isLoading={isLoading} />
                <div className="flex-1 flex flex-col bg-[#18181C] h-full">
                    <Header />
                    <ImageGallery images={generatedImages} isLoading={isLoading} error={error} />
                </div>
            </main>
        </div>
    );
};

export default App;
