
import React from 'react';
import { XMarkIcon } from './icons';

interface AdvancedSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    negativePrompt: string;
    setNegativePrompt: (value: string) => void;
    useSeed: boolean;
    setUseSeed: (value: boolean) => void;
    seed: number;
    setSeed: (value: number) => void;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; disabled?: boolean; tooltip: string }> = ({ label, value, min, max, step, disabled, tooltip }) => (
    <div className={`opacity-50 cursor-not-allowed group relative`}>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <span className="text-sm text-white">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={true}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-not-allowed"
        />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
        </div>
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: (enabled: boolean) => void; }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-200">{label}</label>
        <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={`${enabled ? 'bg-purple-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    </div>
);


export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({ isOpen, onClose, negativePrompt, setNegativePrompt, useSeed, setUseSeed, seed, setSeed }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#2C2D35] rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Advanced Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-6">
                    <Slider label="Guidance Scale" value={1} min={1} max={20} step={0.5} disabled={true} tooltip="Not supported by this model." />
                    <Slider label="Steps" value={6} min={1} max={30} step={1} disabled={true} tooltip="Not supported by this model." />

                    <div>
                        <Toggle label="Use Seed" enabled={useSeed} onToggle={setUseSeed} />
                        {useSeed && (
                             <div className="mt-2">
                                <label htmlFor="seed-input" className="sr-only">Seed Value</label>
                                <input
                                    id="seed-input"
                                    type="number"
                                    value={seed}
                                    onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
                                    className="bg-[#3a3b43] border border-gray-600 rounded-lg p-2 w-full text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                     <div>
                        <label className="text-sm font-medium text-gray-400 mb-1 block">Negative Prompt</label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="e.g., blurry, cartoon, extra limbs"
                            className="bg-[#3a3b43] border border-gray-600 rounded-lg p-3 h-24 w-full resize-none text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                    </div>
                    
                    <button onClick={onClose} className="w-full bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};