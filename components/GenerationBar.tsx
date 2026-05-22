
import React from 'react';
import type { GenerationRequest } from '../types';
import { SparklesIcon, AdjustmentsIcon } from './icons';

interface GenerationBarProps {
    request: Omit<GenerationRequest, 'aspectRatio'>;
    setRequest: React.Dispatch<React.SetStateAction<Omit<GenerationRequest, 'aspectRatio'>>>;
    onGenerate: () => void;
    isLoading: boolean;
    isSettingsOpen: boolean;
    setIsSettingsOpen: (isOpen: boolean) => void;
}

export const GenerationBar: React.FC<GenerationBarProps> = ({ request, setRequest, onGenerate, isLoading, isSettingsOpen, setIsSettingsOpen }) => {
    
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRequest(prev => ({...prev, prompt: e.target.value}));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && request.prompt) {
                onGenerate();
            }
        }
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="relative">
                    <textarea
                        value={request.prompt}
                        onChange={handlePromptChange}
                        onKeyDown={handleKeyDown}
                        placeholder="A cinematic shot of a raccoon in a library, award-winning photography..."
                        className="bg-[#2C2D35] border border-gray-600 rounded-2xl p-4 pr-48 w-full h-16 resize-none text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none leading-tight"
                        aria-label="Image prompt"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                        <button 
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                            className={`p-2 rounded-full hover:bg-gray-700 ${isSettingsOpen ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                            aria-label="Toggle advanced settings"
                        >
                            <AdjustmentsIcon />
                        </button>
                         <button onClick={onGenerate} disabled={isLoading || !request.prompt} className="bg-purple-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors h-10">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                               <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Generate</span>
                               </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
