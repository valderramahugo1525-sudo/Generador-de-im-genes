import React, { useState, useCallback, useRef } from 'react';
import type { GenerationRequest, Model, AspectRatio } from '../types';
import { MODELS, BATCH_SIZES, FEATURED_ASPECT_RATIOS } from '../constants';
import { ChevronDownIcon, DiamondIcon, AdjustmentsIcon, ReferenceImageIcon, SparklesIcon } from './icons';
import { ModelSelectModal } from './ModelSelectModal';
import { ResolutionSelectModal } from './ResolutionSelectModal';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';


interface ControlPanelProps {
    onGenerate: (request: GenerationRequest) => void;
    isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(FEATURED_ASPECT_RATIOS[0]);
    const [batchSize, setBatchSize] = useState<number>(1);
    
    // State for modals
    const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
    const [isResolutionModalOpen, setIsResolutionModalOpen] = useState<boolean>(false);
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState<boolean>(false);

    // State for advanced settings
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [useSeed, setUseSeed] = useState<boolean>(false);
    const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));


    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReferenceImage(file);
            const previewUrl = URL.createObjectURL(file);
            setReferenceImagePreview(previewUrl);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || isLoading) return;

        let base64Image: string | undefined = undefined;
        if (referenceImage) {
            base64Image = await fileToBase64(referenceImage);
        }
        
        const currentSeed = useSeed ? seed : undefined;

        onGenerate({
            prompt,
            referenceImage: base64Image,
            model: selectedModel,
            width: selectedAspectRatio.width,
            height: selectedAspectRatio.height,
            aspectRatio: selectedAspectRatio.label,
            batchSize,
            negativePrompt,
            seed: currentSeed
        });
    }, [prompt, referenceImage, selectedModel, selectedAspectRatio, batchSize, onGenerate, isLoading, negativePrompt, useSeed, seed]);

    return (
        <div className="w-[380px] bg-[#202127] p-4 flex flex-col h-full overflow-y-auto border-r border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Image</h2>
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow gap-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your image..."
                    className="bg-[#2C2D35] border border-gray-600 rounded-lg p-3 h-32 resize-none text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    aria-label="Image prompt"
                />

                <div>
                    <div 
                        onClick={triggerFileSelect}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 hover:text-white text-gray-400"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && triggerFileSelect()}
                    >
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        {referenceImagePreview ? (
                            <img src={referenceImagePreview} alt="Reference Preview" className="max-h-24 mx-auto rounded-md" />
                        ) : (
                             <div className="flex items-center justify-center gap-2">
                                 <ReferenceImageIcon />
                                <span>Reference Image</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">
                        AI will analyze key features to guide the new image. Best for faces.
                    </p>
                </div>


                <div>
                    <label className="text-sm font-medium text-gray-400">Model</label>
                    <button type="button" onClick={() => setIsModelModalOpen(true)} className="mt-1 w-full flex items-center justify-between bg-[#2C2D35] border border-gray-600 rounded-lg p-3 text-left">
                        <div className="flex items-center gap-3">
                            {selectedModel.icon}
                            <span className="text-white">{selectedModel.name}</span>
                        </div>
                        <ChevronDownIcon />
                    </button>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <label className="text-sm font-medium text-gray-400">Resolution</label>
                         <span className="text-xs text-gray-500">{selectedAspectRatio.width} x {selectedAspectRatio.height}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {FEATURED_ASPECT_RATIOS.map(ar => (
                            <button type="button" key={ar.id} onClick={() => setSelectedAspectRatio(ar)} className={`p-3 rounded-lg border text-sm ${selectedAspectRatio.id === ar.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#2C2D35] border-gray-600 hover:border-gray-400'}`}>
                                {ar.label}
                            </button>
                        ))}
                        <button type="button" onClick={() => setIsResolutionModalOpen(true)} className="p-3 rounded-lg border text-sm bg-[#2C2D35] border-gray-600 hover:border-gray-400">More</button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">Images per batch</label>
                    <div className="grid grid-cols-4 gap-2">
                        {BATCH_SIZES.map(size => (
                            <button type="button" key={size} onClick={() => setBatchSize(size)} className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-1 ${batchSize === size ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#2C2D35] border-gray-600 hover:border-gray-400'}`}>
                                {size}
                                {(size > 2) && <DiamondIcon className="text-yellow-400" />}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="button" onClick={() => setIsAdvancedModalOpen(true)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
                    <AdjustmentsIcon />
                    Advanced settings
                </button>

                <div className="mt-auto">
                    <button type="submit" disabled={isLoading || !prompt} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                           <>
                            Generate
                            <div className="bg-purple-700 rounded-md px-2 py-0.5 text-sm flex items-center gap-1">
                                <SparklesIcon className="w-4 h-4" />{batchSize}
                            </div>
                           </>
                        )}
                    </button>
                </div>
            </form>
            <ModelSelectModal isOpen={isModelModalOpen} onClose={() => setIsModelModalOpen(false)} onSelectModel={setSelectedModel} />
            <ResolutionSelectModal isOpen={isResolutionModalOpen} onClose={() => setIsResolutionModalOpen(false)} onSelect={setSelectedAspectRatio} currentAspectRatio={selectedAspectRatio} />
            <AdvancedSettingsModal 
                isOpen={isAdvancedModalOpen} 
                onClose={() => setIsAdvancedModalOpen(false)}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                useSeed={useSeed}
                setUseSeed={setUseSeed}
                seed={seed}
                setSeed={setSeed}
            />
        </div>
    );
};