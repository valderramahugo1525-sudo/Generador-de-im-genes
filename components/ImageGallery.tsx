
import React from 'react';
import type { GeneratedImage } from '../types';
import { GeneratedImageCard } from './GeneratedImageCard';

interface ImageGalleryProps {
    images: GeneratedImage[];
    isLoading: boolean;
    error: string | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse bg-[#202127] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
        </div>
        <div className="w-full h-96 bg-gray-700 rounded-lg"></div>
    </div>
);


export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, isLoading, error }) => {
    
    // Group images by date
    const groupedByDate = images.reduce((acc, image) => {
        (acc[image.date] = acc[image.date] || []).push(image);
        return acc;
    }, {} as Record<string, GeneratedImage[]>);

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            {isLoading && images.length === 0 && <LoadingSkeleton />}
            {error && <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>}
            
            <div className="max-w-3xl mx-auto space-y-8">
                {isLoading && images.length > 0 && <LoadingSkeleton />}
                {Object.entries(groupedByDate).map(([date, imagesOnDate]) => (
                    <div key={date}>
                        <h3 className="text-sm font-semibold text-gray-400 mb-4">{date}</h3>
                        <div className="space-y-6">
                            {imagesOnDate.map(image => (
                                <GeneratedImageCard key={image.id} image={image} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {!isLoading && images.length === 0 && !error && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-lg">Your generated images will appear here.</p>
                    <p>Use the panel on the left to create your first image.</p>
                </div>
            )}
        </div>
    );
};
