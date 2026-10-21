import React from 'react';
import { X } from 'lucide-react';
import { Story } from '../types';

export const StoryViewer: React.FC<{ stories: Story[]; initialIndex: number; onClose: () => void }> = ({ stories, onClose }) => {
  if (!stories || stories.length === 0) return null;
  const story = stories[0];

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2">
        <X size={24} />
      </button>
      <div className="relative w-full max-w-sm h-[80vh] bg-neutral-900 rounded-3xl overflow-hidden flex items-center justify-center">
        <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 text-white text-xs font-bold">
          @{story.username}
        </div>
      </div>
    </div>
  );
};
