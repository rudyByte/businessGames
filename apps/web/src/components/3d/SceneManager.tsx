import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

interface SceneManagerProps {
  currentScene: 'school' | 'market' | 'home';
  onSceneChange: (scene: 'school' | 'market' | 'home') => void;
  children: React.ReactNode;
}

export default function SceneManager({ currentScene, onSceneChange, children }: SceneManagerProps) {
  const [isFading, setIsFading] = useState(false);

  const transitionTo = async (nextScene: 'school' | 'market' | 'home') => {
    setIsFading(true);
    // Save progress to DB before changing scene
    try {
      await api.post(`/games/problem-hunt/progress/save`, {
        currentChapter: nextScene === 'school' ? 1 : nextScene === 'market' ? 2 : 3,
        currentLevel: 1,
        status: 'IN_PROGRESS',
        detectiveSave: JSON.stringify({ last3DScene: nextScene }),
      });
    } catch (err) {
      console.error('Failed to save scene progress:', err);
    }

    setTimeout(() => {
      onSceneChange(nextScene);
      setIsFading(false);
    }, 800);
  };

  return (
    <div className="w-full h-full relative">
      {/* 3D Scene viewport */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* Fade overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 pointer-events-none z-50 ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
