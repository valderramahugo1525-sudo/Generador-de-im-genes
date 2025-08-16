import React from 'react';
import type { AspectRatio } from '../types';
import { ALL_ASPECT_RATIOS } from '../constants';
import { XMarkIcon } from './icons';

interface ResolutionSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (aspectRatio: AspectRatio) => void;
    currentAspectRatio: AspectRatio;
}

export const ResolutionSelectModal: React.FC<ResolutionSelectModalProps> = ({ isOpen, onClose, onSelect, currentAspectRatio }) => {
    if (!isOpen) return null;

    const handleSelect = (aspectRatio: AspectRatio) => {
        onSelect(aspectRatio);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#2C2D35] rounded-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Select Resolution</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ALL_ASPECT_RATIOS.map(ar => (
                        <button
                            key={ar.id}
                            onClick={() => handleSelect(ar)}
                            className={`p-4 rounded-lg border text-center ${currentAspectRatio.id === ar.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#3a3b43] border-gray-600 hover:border-gray-400'}`}
                        >
                            <div className="font-semibold">{ar.label}</div>
                            <div className="text-xs text-gray-400">{ar.width} x {ar.height}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
