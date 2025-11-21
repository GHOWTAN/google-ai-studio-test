import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import SpriteEditor from './components/SpriteEditor';
import RunConsole from './components/RunConsole';
import { EditorMode } from './types';
import { INITIAL_CODE, INITIAL_SPRITE } from './constants';
import { Code, Gamepad2, Play, Square } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<EditorMode>(EditorMode.CODE);
  const [code, setCode] = useState<string>(INITIAL_CODE);
  
  // Initialize 16 sprites, first one has data
  const [sprites, setSprites] = useState<number[][]>(() => {
      const arr = new Array(16).fill(null).map(() => new Array(64).fill(0));
      arr[0] = INITIAL_SPRITE;
      return arr;
  });
  const [activeSpriteIndex, setActiveSpriteIndex] = useState(0);

  const updateSprite = (index: number, data: number[]) => {
    const newSprites = [...sprites];
    newSprites[index] = data;
    setSprites(newSprites);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#222] text-white font-sans">
      
      {/* Header / Status Bar */}
      <header className="bg-[#1D2B53] p-2 border-b-4 border-[#000] flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FF004D] rounded-full animate-pulse"></div>
          <h1 className="text-[#FFF1E8] font-bold tracking-widest text-sm md:text-base">REACT-8</h1>
        </div>
        <div className="text-[10px] text-[#29ADFF] hidden md:block">
          FANTASY CONSOLE // RAM: 32K
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden relative flex">
        {mode === EditorMode.CODE && (
          <CodeEditor code={code} onChange={setCode} />
        )}
        
        {mode === EditorMode.SPRITE && (
          <div className="w-full h-full bg-[#000] flex items-center justify-center">
             <SpriteEditor 
               sprites={sprites}
               activeSpriteIndex={activeSpriteIndex}
               onSelectSprite={setActiveSpriteIndex}
               onUpdateSprite={updateSprite}
             />
          </div>
        )}

        {mode === EditorMode.RUN && (
          <RunConsole code={code} sprites={sprites} />
        )}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="bg-[#5F574F] p-1 pb-2 flex justify-center gap-1 border-t-4 border-[#000]">
        <button
          onClick={() => setMode(EditorMode.CODE)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-4 ${
            mode === EditorMode.CODE 
              ? 'bg-[#1D2B53] text-[#29ADFF] border-[#29ADFF] -mt-2 pt-4' 
              : 'bg-[#000] text-[#5F574F] border-[#000] hover:text-[#C2C3C7]'
          }`}
        >
          <Code className="w-4 h-4" /> CODE
        </button>

        <button
          onClick={() => setMode(EditorMode.SPRITE)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-4 ${
            mode === EditorMode.SPRITE 
              ? 'bg-[#1D2B53] text-[#00E436] border-[#00E436] -mt-2 pt-4' 
              : 'bg-[#000] text-[#5F574F] border-[#000] hover:text-[#C2C3C7]'
          }`}
        >
          <Square className="w-4 h-4" /> SPRITE
        </button>

        <button
          onClick={() => setMode(EditorMode.RUN)}
          className={`flex items-center gap-2 px-6 py-2 text-xs font-bold transition-all border-b-4 ml-4 ${
            mode === EditorMode.RUN 
              ? 'bg-[#1D2B53] text-[#FF004D] border-[#FF004D] -mt-2 pt-4' 
              : 'bg-[#000] text-[#FF004D] border-[#000] hover:bg-[#222]'
          }`}
        >
          <Play className="w-4 h-4" /> RUN
        </button>
      </nav>
    </div>
  );
};

export default App;