
import React from 'react';
import type { Model } from '../types';
import { MODELS } from '../constants';

interface ModelSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectModel: (model: Model) => void;
}

export const ModelSelectModal: React.FC<ModelSelectModalProps> = ({ isOpen, onClose, onSelectModel }) => {
    if (!isOpen) return null;

    const handleSelect = (model: Model) => {
        onSelectModel(model);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#2C2D35] rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-4">Select a Model</h3>
                <div className="space-y-3">
                    {MODELS.map(model => (
                        <button
                            key={model.id}
                            onClick={() => handleSelect(model)}
                            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700 transition-colors text-left"
                        >
                            <div className="bg-gray-800 p-2 rounded-md">{model.icon}</div>
                            <span className="text-white font-medium">{model.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};