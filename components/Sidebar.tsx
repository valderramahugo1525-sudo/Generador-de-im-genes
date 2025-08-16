
import React from 'react';
import { SparklesIcon, PencilIcon, PhotoStackIcon, UsersIcon, ListBulletIcon, KeyIcon, BellIcon } from './icons';

const NavItem: React.FC<{ icon: React.ReactNode; isActive?: boolean; hasNotification?: boolean }> = ({ icon, isActive, hasNotification }) => (
    <div className={`relative p-3 rounded-lg cursor-pointer ${isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
        {icon}
        {hasNotification && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
    </div>
);

export const Sidebar: React.FC = () => {
    return (
        <nav className="bg-[#202127] p-3 flex flex-col justify-between items-center h-full border-r border-gray-800">
            <div className="flex flex-col items-center gap-3">
                <div className="p-3 text-white">
                    <SparklesIcon className="w-7 h-7" />
                </div>
                <div className="w-full h-px bg-gray-700 my-2"></div>
                <NavItem icon={<SparklesIcon />} isActive />
                <NavItem icon={<PencilIcon />} />
                <NavItem icon={<PhotoStackIcon />} />
                <NavItem icon={<UsersIcon />} />
                <NavItem icon={<ListBulletIcon />} />
                <NavItem icon={<KeyIcon />} />
            </div>
            <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                    <NavItem icon={<BellIcon />} />
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">28</div>
                </div>
                <img src="https://picsum.photos/id/237/40/40" alt="User Avatar" className="w-10 h-10 rounded-full cursor-pointer" />
            </div>
        </nav>
    );
};
