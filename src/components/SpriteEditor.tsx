import React, { useState } from 'react';
import { COLORS } from '../constants';
import { generateSpriteData } from '../services/geminiService';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';

interface SpriteEditorProps {
  sprites: number[][];
  activeSpriteIndex: number;
  onUpdateSprite: (index: number, data: number[]) => void;
  onSelectSprite: (index: number) => void;
}

const SpriteEditor: React.FC<SpriteEditorProps> = ({
  sprites,
  activeSpriteIndex,
  onUpdateSprite,
  onSelectSprite
}) => {
  const [currentColor, setCurrentColor] = useState(7); // Default white
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPainting, setIsPainting] = useState(false);

  const currentSprite = sprites[activeSpriteIndex];

  const handlePixelClick = (idx: number) => {
    const newData = [...currentSprite];
    newData[idx] = currentColor;
    onUpdateSprite(activeSpriteIndex, newData);
  };

  const handlePointerEnter = (e: React.PointerEvent, idx: number) => {
    if (e.buttons === 1) { // Left click held
       handlePixelClick(idx);
    }
  };

  const handleAiGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const pixels = await generateSpriteData(prompt);
      onUpdateSprite(activeSpriteIndex, pixels);
      setPrompt('');
    } catch (e) {
      alert("AI Sprite Gen failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSprite = () => {
    onUpdateSprite(activeSpriteIndex, new Array(64).fill(0));
  };

  return (
    <div className="flex flex-col h-full bg-[#000] text-white p-4 overflow-y-auto items-center">
      
      {/* Top Controls */}
      <div className="w-full max-w-md flex items-center mb-4 gap-2">
        <div className="flex-1 flex items-center bg-[#1D2B53] p-1 border border-[#5F574F]">
           <Sparkles className="w-4 h-4 text-[#FFEC27] mr-2" />
           <input
            className="flex-1 bg-transparent text-xs outline-none text-[#FFF1E8] placeholder-[#5F574F]"
            placeholder="AI: 'A red apple', 'Space ship'..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
           />
           <button 
             onClick={handleAiGenerate}
             disabled={isLoading}
             className="text-[#FF004D] text-xs font-bold px-2"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "GO"}
           </button>
        </div>
        <button onClick={clearSprite} className="p-2 bg-[#5F574F] hover:bg-[#FF004D]">
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-4xl">
        
        {/* Editor Grid */}
        <div className="flex flex-col items-center gap-2">
          <div 
            className="grid grid-cols-8 bg-[#222] border-4 border-[#5F574F]"
            style={{ width: '320px', height: '320px' }}
            onPointerLeave={() => setIsPainting(false)}
          >
            {currentSprite.map((colorIndex, idx) => (
              <div
                key={idx}
                onPointerDown={(e) => {
                  e.currentTarget.releasePointerCapture(e.pointerId); // Allow easier dragging
                  handlePixelClick(idx);
                }}
                onPointerEnter={(e) => handlePointerEnter(e, idx)}
                className="w-full h-full border-[0.5px] border-[#ffffff11] select-none touch-none"
                style={{ backgroundColor: COLORS[colorIndex] }}
              />
            ))}
          </div>
          <div className="text-[#5F574F] text-xs mt-2">ID: {activeSpriteIndex}</div>
        </div>

        {/* Tools & Palette */}
        <div className="flex flex-col gap-4">
          {/* Palette */}
          <div className="grid grid-cols-4 gap-1 bg-[#1D2B53] p-2 border border-[#000]">
            {COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => setCurrentColor(i)}
                className={`w-8 h-8 border-2 ${currentColor === i ? 'border-white scale-110 z-10' : 'border-transparent hover:border-[#C2C3C7]'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Sprite Selector Sheet */}
          <div className="bg-[#000] p-2 border border-[#5F574F]">
             <p className="text-xs text-[#83769C] mb-2">SPRITE SHEET</p>
             <div className="grid grid-cols-4 gap-1">
                {sprites.map((s, i) => (
                  <div 
                    key={i}
                    onClick={() => onSelectSprite(i)}
                    className={`w-8 h-8 relative cursor-pointer border ${activeSpriteIndex === i ? 'border-[#FF004D]' : 'border-[#1D2B53]'}`}
                  >
                    {/* Mini render of sprite */}
                    <div className="grid grid-cols-8 w-full h-full">
                      {s.map((px, pix) => (
                        <div key={pix} style={{ backgroundColor: COLORS[px] }} />
                      ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SpriteEditor;
