import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '../constants';

interface RunConsoleProps {
  code: string;
  sprites: number[][];
}

const CANVAS_SIZE = 128;

const RunConsole: React.FC<RunConsoleProps> = ({ code, sprites }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const inputStateRef = useRef<boolean[]>([false, false, false, false, false, false]); // L, R, U, D, Z, X

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Alpha: false is better for pixel art performance, but we need to handle transparency manually if we were doing layers.
    // Here we just clear screen every frame.
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Reset State
    startTimeRef.current = Date.now();
    setError(null);
    
    // Camera state for this run execution
    let camX = 0;
    let camY = 0;

    const getColor = (c: number) => COLORS[Math.floor(c) % 16] || '#000';

    // --- Build Sandbox API ---
    const api = {
      // Graphics
      cls: (c: number = 0) => {
        // cls ignores camera
        ctx.fillStyle = getColor(c);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for clearing
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      },
      camera: (x: number = 0, y: number = 0) => {
        camX = Math.floor(x);
        camY = Math.floor(y);
      },
      rect: (x: number, y: number, w: number, h: number, c: number) => {
        ctx.fillStyle = getColor(c);
        ctx.fillRect(Math.floor(x - camX), Math.floor(y - camY), Math.floor(w), Math.floor(h));
      },
      line: (x0: number, y0: number, x1: number, y1: number, c: number) => {
        ctx.strokeStyle = getColor(c);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.floor(x0 - camX) + 0.5, Math.floor(y0 - camY) + 0.5);
        ctx.lineTo(Math.floor(x1 - camX) + 0.5, Math.floor(y1 - camY) + 0.5);
        ctx.stroke();
      },
      circ: (x: number, y: number, r: number, c: number) => {
        ctx.strokeStyle = getColor(c);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(Math.floor(x - camX), Math.floor(y - camY), Math.floor(r), 0, 2 * Math.PI);
        ctx.stroke();
      },
      circfill: (x: number, y: number, r: number, c: number) => {
        ctx.fillStyle = getColor(c);
        ctx.beginPath();
        ctx.arc(Math.floor(x - camX), Math.floor(y - camY), Math.floor(r), 0, 2 * Math.PI);
        ctx.fill();
      },
      pset: (x: number, y: number, c: number) => {
        ctx.fillStyle = getColor(c);
        ctx.fillRect(Math.floor(x - camX), Math.floor(y - camY), 1, 1);
      },
      print: (str: string | number, x: number, y: number, c: number = 7) => {
        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = getColor(c);
        ctx.textBaseline = "top";
        ctx.fillText(String(str), Math.floor(x - camX), Math.floor(y - camY)); 
      },
      spr: (id: number, x: number, y: number) => {
        const spriteId = Math.floor(id) % 16;
        const spriteData = sprites[spriteId];
        if (!spriteData) return;
        
        const dx = Math.floor(x - camX);
        const dy = Math.floor(y - camY);

        for (let i = 0; i < 64; i++) {
            const colIdx = spriteData[i];
            if (colIdx === 0) continue; // 0 is transparent
            const px = i % 8;
            const py = Math.floor(i / 8);
            ctx.fillStyle = COLORS[colIdx];
            ctx.fillRect(dx + px, dy + py, 1, 1);
        }
      },
      
      // Input
      btn: (i: number) => inputStateRef.current[i],
      
      // Math helpers
      rnd: (max: number = 1) => Math.random() * max,
      flr: (v: number) => Math.floor(v),
      abs: (v: number) => Math.abs(v),
      sin: (v: number) => Math.sin(v * Math.PI * 2), // PICO-8 sin takes 0-1
      cos: (v: number) => Math.cos(v * Math.PI * 2),
      
      // System
      t: 0,
    };

    // --- Compile User Code ---
    let userInit: Function | null = null;
    let userUpdate: Function | null = null;
    let userDraw: Function | null = null;

    try {
      const apiKeys = Object.keys(api);
      const wrappedCode = `
        return function(${apiKeys.join(',')}) {
          ${code}
          return { 
            _init: typeof _init !== 'undefined' ? _init : null,
            _update: typeof _update !== 'undefined' ? _update : null,
            _draw: typeof _draw !== 'undefined' ? _draw : null
          };
        }
      `;
      
      // eslint-disable-next-line no-new-func
      const factory = new Function(wrappedCode);
      const instance = factory();
      // Inject API methods
      const methods = instance(...Object.values(api));
      
      userInit = methods._init;
      userUpdate = methods._update;
      userDraw = methods._draw;

    } catch (e: any) {
      setError(e.message);
      return;
    }

    // --- Game Loop ---
    if (userInit) {
      try { userInit(); } catch(e:any) { setError(e.message); return; }
    }

    const loop = () => {
      const now = (Date.now() - startTimeRef.current) / 1000;
      api.t = now;

      try {
        if (userUpdate) userUpdate();
        if (userDraw) userDraw();
      } catch (e: any) {
        setError("Runtime Error: " + e.message);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
      }
      
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [code, sprites]);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const keyMap: Record<string, number> = {
            "ArrowLeft": 0, "ArrowRight": 1, "ArrowUp": 2, "ArrowDown": 3,
            "z": 4, "x": 5, "Z": 4, "X": 5
        };
        if (keyMap[e.key] !== undefined) {
            inputStateRef.current[keyMap[e.key]] = true;
            if (e.key.startsWith("Arrow")) e.preventDefault();
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const keyMap: Record<string, number> = {
            "ArrowLeft": 0, "ArrowRight": 1, "ArrowUp": 2, "ArrowDown": 3,
            "z": 4, "x": 5, "Z": 4, "X": 5
        };
        if (keyMap[e.key] !== undefined) {
            inputStateRef.current[keyMap[e.key]] = false;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#000]">
      <div className="relative">
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="pixelated border-8 border-[#5F574F] bg-black shadow-2xl shadow-[#000]"
            style={{ 
                width: '512px', // 4x scale
                height: '512px'
            }}
        />
        {error && (
            <div className="absolute top-0 left-0 w-full h-full bg-[#000000cc] flex items-center justify-center p-4">
                <div className="bg-[#7E2553] text-white p-4 font-mono text-xs border-2 border-[#FF004D] max-w-[80%]">
                    <h3 className="mb-2 uppercase font-bold text-[#FF004D]">Runtime Error</h3>
                    <p className="break-words">{error}</p>
                </div>
            </div>
        )}
      </div>
      <div className="mt-4 text-[#5F574F] text-xs font-mono text-center">
        <span className="text-[#FF004D]">ARROWS</span> TO MOVE • <span className="text-[#29ADFF]">Z/X</span> ACTIONS
      </div>
    </div>
  );
};

export default RunConsole;