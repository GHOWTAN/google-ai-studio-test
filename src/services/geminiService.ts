import { GoogleGenAI, Schema, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateGameCode = async (userPrompt: string, currentCode: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const systemPrompt = `
    You are an expert programmer for the fantasy console 'REACT-8'.
    Language: JavaScript (ES6) inside a sandbox.
    
    Specifications:
    - Canvas: 128x128 pixels.
    - Color Palette: 0-15 (PICO-8 Standard).
    - Game Loop: 60 FPS (controlled via requestAnimationFrame).
    
    Available API Global Functions:
    - _init(): void // Called once.
    - _update(): void // Logic per frame.
    - _draw(): void // Render per frame.
    
    Graphics:
    - cls(color): Clear screen.
    - spr(id, x, y): Draw sprite 0-15.
    - pset(x, y, col): Set pixel color.
    - line(x0, y0, x1, y1, col): Draw line.
    - rect(x, y, w, h, col): Draw filled rect.
    - circ(x, y, r, col): Draw circle outline.
    - circfill(x, y, r, col): Draw filled circle.
    - print(str, x, y, col): Draw text.
    - camera(x, y): Offset all drawing operations by -x, -y.
    
    Input:
    - btn(i): Returns true if button 'i' is pressed. 
      0:Left, 1:Right, 2:Up, 3:Down, 4:Z, 5:X.
    
    Math:
    - rnd(max): Random 0 to max.
    - flr(n): Floor.
    - abs(n): Absolute value.
    - sin(n): Sine (0-1 input).
    - cos(n): Cosine (0-1 input).
    - t: Global time variable (seconds).

    Task: Generate valid REACT-8 JavaScript code based on the user's request.
    - If creating a game, ensure you define _init, _update, and _draw.
    - Use simple logic suitable for a retro console.
    - Return ONLY the JavaScript code. No markdown backticks.
  `;

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `Current Code:\n${currentCode}\n\nRequest: ${userPrompt}`,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    
    let text = response.text || "";
    // Strip markdown if present
    text = text.replace(/```javascript/g, '').replace(/```/g, '').trim();
    return text;
  } catch (error) {
    console.error("Gemini Code Gen Error:", error);
    throw error;
  }
};

export const generateSpriteData = async (userPrompt: string): Promise<number[]> => {
  if (!apiKey) throw new Error("API Key not found");

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      pixels: {
        type: Type.ARRAY,
        items: { type: Type.INTEGER }, // 0-15
        description: "A flat array of 64 integers representing an 8x8 pixel grid. Values must be 0-15.",
      }
    },
    required: ["pixels"],
  };

  const systemPrompt = `
    You are a pixel artist for the REACT-8 console.
    Palette:
    0:Black, 1:D.Blue, 2:D.Purple, 3:D.Green, 4:Brown, 5:D.Gray, 6:L.Gray, 7:White,
    8:Red, 9:Orange, 10:Yellow, 11:Green, 12:Blue, 13:Indigo, 14:Pink, 15:Peach.
    
    Task: Create an 8x8 sprite (64 integers) based on the description.
    Use 0 for transparency/background usually.
  `;

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `Create a sprite: ${userPrompt}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    
    if (data.pixels && Array.isArray(data.pixels) && data.pixels.length === 64) {
      return data.pixels;
    }
    return new Array(64).fill(0);
  } catch (error) {
    console.error("Gemini Sprite Gen Error:", error);
    throw error;
  }
};