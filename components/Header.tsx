
import React from 'react';
import { SearchIcon, BoltIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <div className="flex-shrink-0 flex items-center justify-end p-4 border-b border-gray-800 bg-[#202127]">
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-700">
                    <SearchIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 p-2 rounded-full bg-gray-700/50">
                    <BoltIcon className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-white">17</span>
                </div>
            </div>
        </div>
    );
}
