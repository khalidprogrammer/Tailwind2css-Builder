
import { GoogleGenAI, Type } from "@google/genai";
import { BuilderType, ConversionResult, OutputFormat } from "../types";

export const convertTailwindToCss = async (
  input: string,
  builder: BuilderType,
  format: OutputFormat,
  isCompact: boolean
): Promise<ConversionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const builderContext = builder === BuilderType.ELEMENTOR 
    ? `Target: Elementor. 
       - Use 'selector' syntax for the main container.
       - IMPORTANT: For background colors, gradients, or overlays, use 'selector::before'.
       - If you use 'selector::before', the main 'selector' MUST have 'position: relative;' to anchor it.
       - 'selector::before' MUST include: content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 0;
       - Ensure the actual content in 'selector' stays visible (e.g., use z-index: 1 or similar if needed).`
    : builder === BuilderType.BRICKS
    ? "Target: Bricks Builder. Use standard CSS classes or root syntax."
    : "Target: Generic CSS.";

  const formatContext = format === OutputFormat.BEM
    ? "Use BEM (Block Element Modifier) naming convention for classes (e.g., .card, .card__header, .card__header--active)."
    : format === OutputFormat.VANILLA
    ? "Generate clean utility-like classes for each unique style set."
    : "Standard: Use 'selector' for Elementor or simple class names for others.";

  const systemInstruction = `
    You are a Senior Frontend Developer specializing in high-performance CSS generation for WordPress builders.
    
    Objective: Convert Tailwind utility classes to pure CSS.
    
    ${builderContext}
    ${formatContext}
    
    Output Formatting:
    - ${isCompact ? "Generate MINIFIED CSS (one line per selector)." : "Generate BEAUTIFIED/EXPANDED CSS."}
    - Map all Tailwind utilities including responsive (sm, md, lg), state (hover, focus), and arbitrary values.
    - Merge duplicate properties.
    - If ${builder === BuilderType.ELEMENTOR}, ensure the CSS is perfectly ready for Elementor's Advanced -> Custom CSS field.
    
    Visual Requirement:
    - If there are background gradients or complex backgrounds, implement them using the 'selector::before' pattern requested.
    - Example for Elementor background:
      selector { position: relative; z-index: 1; }
      selector::before { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: -1; background: ...; pointer-events: none; }

    Structure:
    1. Pure CSS code.
    2. Short explanation.
    3. Implementation notes.
    
    NO Tailwind CDN, NO Tailwind classes in CSS output.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following code to CSS: \n\n ${input}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          css: {
            type: Type.STRING,
            description: "The generated pure CSS code.",
          },
          explanation: {
            type: Type.STRING,
            description: "A short summary of the conversion logic.",
          },
          notes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Builder-specific best practices.",
          },
        },
        required: ["css", "explanation", "notes"],
      },
    },
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text) as ConversionResult;
  } catch (err) {
    throw new Error("Failed to parse AI response. The generated CSS might be too complex or invalid.");
  }
};
