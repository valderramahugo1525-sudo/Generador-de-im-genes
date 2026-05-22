
import React, { useRef } from 'react';
import type { GenerationRequest, Model, AspectRatio } from '../types';
import { MODELS, BATCH_SIZES, FEATURED_ASPECT_RATIOS } from '../constants';
import { ChevronDownIcon, DiamondIcon, AdjustmentsIcon, ReferenceImageIcon, XMarkIcon } from './icons';
import { ModelSelectModal } from './ModelSelectModal';
import { ResolutionSelectModal } from './ResolutionSelectModal';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';

interface ControlPanelProps {
    isOpen: boolean;
    onClose: () => void;
    request: Omit<GenerationRequest, 'aspectRatio'>;
    setRequest: React.Dispatch<React.SetStateAction<Omit<GenerationRequest, 'aspectRatio'>>>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AspectRatioButton: React.FC<{
    ar: AspectRatio;
    isSelected: boolean;
    onClick: () => void;
}> = ({ ar, isSelected, onClick }) => {
    const getShapeClasses = () => {
        const ratio = ar.width / ar.height;
        if (ratio > 1.1) return 'w-8 h-5'; // Landscape
        if (ratio < 0.9) return 'w-5 h-8'; // Portrait
        return 'w-8 h-8'; // Square
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border text-sm ${isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#2C2D35] border-gray-600 hover:border-gray-400'}`}
        >
            <div className={`bg-gray-500 rounded-sm ${getShapeClasses()}`}></div>
            <span>{ar.label}</span>
        </button>
    );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ isOpen, onClose, request, setRequest }) => {
    const [referenceImagePreview, setReferenceImagePreview] = React.useState<string | null>(null);
    const [isModelModalOpen, setIsModelModalOpen] = React.useState<boolean>(false);
    const [isResolutionModalOpen, setIsResolutionModalOpen] = React.useState<boolean>(false);
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = React.useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const selectedAspectRatio = FEATURED_ASPECT_RATIOS.find(ar => ar.width === request.width && ar.height === request.height) || FEATURED_ASPECT_RATIOS[0];

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setReferenceImagePreview(previewUrl);
            const base64 = await fileToBase64(file);
            setRequest(prev => ({ ...prev, referenceImage: base64 }));
        }
    };

    const removeReferenceImage = () => {
        setReferenceImagePreview(null);
        setRequest(prev => ({ ...prev, referenceImage: undefined }));
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const handleAspectRatioSelect = (ar: AspectRatio) => {
        setRequest(prev => ({ ...prev, width: ar.width, height: ar.height }));
    };

    const handleModelSelect = (model: Model) => {
        setRequest(prev => ({...prev, model}));
    };
    
    const handleBatchSizeSelect = (size: number) => {
        setRequest(prev => ({ ...prev, batchSize: size }));
    };

    const handleAdvancedSettingsUpdate = (settings: Partial<GenerationRequest>) => {
        setRequest(prev => ({ ...prev, ...settings }));
    };

    React.useEffect(() => {
        if(request.referenceImage && !request.referenceImage.startsWith('data:')) {
            setReferenceImagePreview(request.referenceImage);
        } else if (!request.referenceImage) {
            setReferenceImagePreview(null);
        }
    }, [request.referenceImage]);

    return (
        <div className={`fixed top-0 right-0 h-full w-[380px] bg-[#202127] p-4 flex flex-col transform transition-transform duration-300 ease-in-out z-20 border-l border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <XMarkIcon />
                </button>
            </div>
            
            <div className="flex flex-col flex-grow gap-4 overflow-y-auto pr-2">
                <div>
                    {referenceImagePreview ? (
                        <div className="relative">
                           <img src={referenceImagePreview} alt="Reference Preview" className="w-full h-auto max-h-40 object-contain rounded-md" />
                            <button 
                                onClick={removeReferenceImage}
                                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"
                                aria-label="Remove reference image"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
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
                            <div className="flex items-center justify-center gap-2">
                                <ReferenceImageIcon />
                                <span>Reference Image</span>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-center text-gray-500 mt-2">
                        AI will analyze key features to guide the new image. Best for faces.
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-400">Model</label>
                    <button type="button" onClick={() => setIsModelModalOpen(true)} className="mt-1 w-full flex items-center justify-between bg-[#2C2D35] border border-gray-600 rounded-lg p-3 text-left">
                        <div className="flex items-center gap-3">
                            {request.model.icon}
                            <span className="text-white">{request.model.name}</span>
                        </div>
                        <ChevronDownIcon />
                    </button>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <label className="text-sm font-medium text-gray-400">Resolution</label>
                         <span className="text-xs text-gray-500">{request.width} x {request.height}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {FEATURED_ASPECT_RATIOS.map(ar => (
                            <AspectRatioButton key={ar.id} ar={ar} isSelected={selectedAspectRatio.id === ar.id} onClick={() => handleAspectRatioSelect(ar)} />
                        ))}
                        <button type="button" onClick={() => setIsResolutionModalOpen(true)} className="p-3 rounded-lg border text-sm bg-[#2C2D35] border-gray-600 hover:border-gray-400">More</button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">Images per batch</label>
                    <div className="grid grid-cols-4 gap-2">
                        {BATCH_SIZES.map(size => (
                            <button type="button" key={size} onClick={() => handleBatchSizeSelect(size)} className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-1 ${request.batchSize === size ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#2C2D35] border-gray-600 hover:border-gray-400'}`}>
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
            </div>
            <ModelSelectModal isOpen={isModelModalOpen} onClose={() => setIsModelModalOpen(false)} onSelectModel={handleModelSelect} />
            <ResolutionSelectModal isOpen={isResolutionModalOpen} onClose={() => setIsResolutionModalOpen(false)} onSelect={handleAspectRatioSelect} currentAspectRatio={selectedAspectRatio} />
            <AdvancedSettingsModal 
                isOpen={isAdvancedModalOpen} 
                onClose={() => setIsAdvancedModalOpen(false)}
                negativePrompt={request.negativePrompt || ''}
                setNegativePrompt={(val) => handleAdvancedSettingsUpdate({ negativePrompt: val })}
                useSeed={typeof request.seed === 'number'}
                setUseSeed={(use) => handleAdvancedSettingsUpdate({ seed: use ? (Math.floor(Math.random() * 1000000)) : undefined })}
                seed={request.seed || 0}
                setSeed={(val) => handleAdvancedSettingsUpdate({ seed: val })}
            />
        </div>
    );
};
