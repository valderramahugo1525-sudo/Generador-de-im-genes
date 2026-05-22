
import React from 'react';
import type { GeneratedImage } from '../types';
import { BookmarkIcon, RemixIcon, TrashIcon, TextIcon, RoseIcon, DownloadIcon } from './icons';

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}
const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors">
        {icon}
        <span>{label}</span>
    </button>
);


interface GeneratedImageCardProps {
    image: GeneratedImage;
    onDelete: (id: string) => void;
    onUseText: (prompt: string) => void;
    onRemix: (image: GeneratedImage) => void;
    onDownload: (src: string, prompt: string) => void;
}
export const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({ image, onDelete, onUseText, onRemix, onDownload }) => {
    return (
        <div className="bg-[#202127] rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500/20 p-2 rounded-full">
                      <RoseIcon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{image.resolution} ({image.aspectRatio})</span>
                            {image.seed && <span className="bg-gray-700 px-2 py-0.5 rounded-full">Seed: {image.seed}</span>}
                        </div>
                        <p className="text-gray-200 mt-1 leading-snug text-sm">{image.prompt}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ActionButton icon={<TextIcon />} label="Use Text" onClick={() => onUseText(image.prompt)} />
                    <ActionButton icon={<RemixIcon />} label="Remix" onClick={() => onRemix(image)} />
                    <ActionButton icon={<DownloadIcon />} label="Save" onClick={() => onDownload(image.src, image.prompt)} />
                    <ActionButton icon={<TrashIcon />} label="Delete" onClick={() => onDelete(image.id)} />
                </div>
            </div>
            <div className="relative group">
                <img src={image.src} alt={image.prompt} className="rounded-lg w-full" />
                 <button className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <BookmarkIcon />
                </button>
            </div>
        </div>
    );
};
