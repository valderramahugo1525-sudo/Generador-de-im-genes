import React from 'react';
import type { Model, AspectRatio } from './types';
import { RoseIcon, AbstractIcon, PhotoIcon } from './components/icons';

export const MODELS: Model[] = [
    { id: 'art-v1', name: 'Art V1', icon: <RoseIcon /> },
    { id: 'photo-v2', name: 'Photo V2', icon: <PhotoIcon /> },
    { id: 'abstract-v3', name: 'Abstract V3', icon: <AbstractIcon /> },
];

export const ALL_ASPECT_RATIOS: AspectRatio[] = [
    // Portrait
    { id: '9:21', label: '9:21', width: 672, height: 1568 },
    { id: '9:19', label: '9:19', width: 704, height: 1472 },
    { id: '1:2', label: '1:2', width: 768, height: 1536 },
    { id: '9:16', label: '9:16', width: 896, height: 1536 },
    { id: '5:8', label: '5:8', width: 896, height: 1408 },
    { id: '2:3', label: '2:3', width: 960, height: 1472 },
    { id: '3:4', label: '3:4', width: 1024, height: 1344 },
    { id: '4:5', label: '4:5', width: 1024, height: 1280 },
    { id: '5:6', label: '5:6', width: 1024, height: 1216 },
    // Square
    { id: '1:1', label: '1:1', width: 1024, height: 1024 },
    // Landscape
    { id: '6:5', label: '6:5', width: 1216, height: 1024 },
    { id: '5:4', label: '5:4', width: 1280, height: 1024 },
    { id: '4:3', label: '4:3', width: 1344, height: 1024 },
    { id: '3:2', label: '3:2', width: 1472, height: 960 },
    { id: '8:5', label: '8:5', width: 1408, height: 896 },
    { id: '16:9', label: '16:9', width: 1536, height: 896 },
    { id: '2:1', label: '2:1', width: 1536, height: 768 },
    { id: '19:9', label: '19:9', width: 1472, height: 704 },
    { id: '21:9', label: '21:9', width: 1568, height: 672 },
];

export const FEATURED_ASPECT_RATIOS: AspectRatio[] = [
    ALL_ASPECT_RATIOS.find(ar => ar.id === '1:1')!,
    ALL_ASPECT_RATIOS.find(ar => ar.id === '9:16')!,
    ALL_ASPECT_RATIOS.find(ar => ar.id === '16:9')!,
];


export const BATCH_SIZES = [1, 2, 3, 4];
