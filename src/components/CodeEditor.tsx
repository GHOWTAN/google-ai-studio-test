import React, { useState } from 'react';
import { generateGameCode } from '../services/geminiService';
import { Loader2, Sparkles } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAiGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const newCode = await generateGameCode(prompt, code);
      onChange(newCode);
      setPrompt('');
    } catch (e) {
      alert("AI Generation failed. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117]">
      {/* AI Bar */}
      <div className="flex items-center p-2 bg-[#1D2B53] border-b-2 border-[#000]">
        <Sparkles className="w-4 h-4 text-[#FFEC27] mr-2" />
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="AI: 'Make the ball bounce', 'Add gravity'..."
          className="flex-1 bg-[#000] text-[#83769C] px-2 py-1 text-xs font-mono border-none outline-none placeholder-[#5F574F]"
        />
        <button 
          onClick={handleAiGenerate}
          disabled={isLoading}
          className="ml-2 px-3 py-1 bg-[#FF004D] text-white text-xs hover:bg-[#FF004D]/80 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "GEN"}
        </button>
      </div>

      {/* Editor */}
      <textarea
        className="flex-1 w-full bg-[#2a2a4a] text-[#76c4ff] p-4 font-mono text-sm resize-none border-none outline-none leading-relaxed"
        spellCheck={false}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: "'Courier New', monospace" }} // Monospace for code
      />
      <div className="bg-[#1D2B53] text-[#C2C3C7] text-[10px] p-1 text-right">
        {code.length} CHARS
      </div>
    </div>
  );
};

export default CodeEditor;
