
import React, { useState, useMemo } from 'react';
import { BuilderType, OutputFormat, OutputTheme, AppState } from './types';
import { convertTailwindToCss } from './services/geminiService';
import { 
  Code2, 
  Settings2, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  AlertCircle, 
  LayoutTemplate, 
  Wand2,
  Trash2,
  Palette,
  FileCode,
  Braces,
  ExternalLink
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputCode: '',
    builder: BuilderType.ELEMENTOR,
    format: OutputFormat.STANDARD,
    theme: OutputTheme.DEEP_SPACE,
    isConverting: false,
    result: null,
    error: null,
    isCompact: false,
  });
  const [copied, setCopied] = useState<'css' | 'style' | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, inputCode: e.target.value, error: null }));
  };

  const updateState = (key: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setState(prev => ({ ...prev, inputCode: '', result: null, error: null }));
  };

  const handleConvert = async () => {
    if (!state.inputCode.trim()) {
      setState(prev => ({ ...prev, error: 'Input cannot be empty.' }));
      return;
    }

    setState(prev => ({ ...prev, isConverting: true, error: null }));

    try {
      const result = await convertTailwindToCss(
        state.inputCode, 
        state.builder, 
        state.format, 
        state.isCompact
      );
      setState(prev => ({ ...prev, result, isConverting: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isConverting: false, 
        error: err.message || 'Conversion failed.' 
      }));
    }
  };

  const copyToClipboard = (text: string, type: 'css' | 'style') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Improved syntax highlighting simulation
  const highlightedCode = useMemo(() => {
    if (!state.result?.css) return null;
    const css = state.result.css;
    
    return css.split('\n').map((line, i) => {
      const trimmed = line.trim();
      const isComment = trimmed.startsWith('/*');
      const isMedia = trimmed.startsWith('@media');
      const isSelector = trimmed.includes('{') && !trimmed.includes(':');
      const isProperty = line.includes(':') && !isComment && !isMedia && !isSelector;

      if (isComment) return <div key={i} className="text-slate-500 italic opacity-70 leading-relaxed">{line}</div>;
      if (isMedia) return <div key={i} className="text-pink-400 font-bold">{line}</div>;
      
      if (isProperty) {
        const colonIndex = line.indexOf(':');
        const prop = line.substring(0, colonIndex);
        const val = line.substring(colonIndex);
        return (
          <div key={i} className="pl-4 leading-relaxed">
            <span className="text-sky-300">{prop}</span>
            <span className="text-slate-400">{val.substring(0, 1)}</span>
            <span className="text-amber-200">{val.substring(1)}</span>
          </div>
        );
      }
      
      if (isSelector) {
        // Highlight pseudo-elements in selectors
        const parts = line.split(/(\:\:before|\:\:after|\:hover|\:focus|\:active)/);
        return (
          <div key={i} className="text-emerald-400 font-medium leading-relaxed">
            {parts.map((part, idx) => {
              if (['::before', '::after', ':hover', ':focus', ':active'].includes(part)) {
                return <span key={idx} className="text-orange-400 font-bold">{part}</span>;
              }
              return <span key={idx}>{part}</span>;
            })}
          </div>
        );
      }
      return <div key={i} className="leading-relaxed">{line}</div>;
    });
  }, [state.result?.css]);

  const themes = {
    [OutputTheme.DEEP_SPACE]: 'bg-slate-950 border-slate-800 text-slate-300',
    [OutputTheme.MIDNIGHT]: 'bg-gray-900 border-gray-800 text-gray-300',
    [OutputTheme.CYBERPUNK]: 'bg-black border-purple-900/50 text-cyan-400',
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-slate-950 text-slate-200 flex flex-col font-sans`}>
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-2 rounded-xl shadow-lg shadow-sky-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Tailwind2Builder</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pro Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleConvert}
              disabled={state.isConverting}
              className="group bg-white hover:bg-sky-50 text-slate-950 px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-xl hover:shadow-sky-500/10 active:scale-95 disabled:opacity-50"
            >
              {state.isConverting ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              )}
              {state.isConverting ? 'Processing...' : 'Generate Styles'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        <div className="space-y-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-2 text-slate-400">
                <LayoutTemplate className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Source Markup</span>
              </div>
              <button onClick={handleClear} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={state.inputCode}
              onChange={handleInputChange}
              spellCheck={false}
              placeholder="Paste your HTML with Tailwind classes here..."
              className="w-full h-[320px] bg-transparent p-6 font-mono-code text-sm focus:outline-none text-sky-400 placeholder:text-slate-700 resize-none leading-relaxed"
            />
          </section>

          <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Builder</label>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {Object.values(BuilderType).map(t => (
                    <button 
                      key={t}
                      onClick={() => updateState('builder', t)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${state.builder === t ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40' : 'text-slate-600 hover:text-slate-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CSS Format</label>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {Object.values(OutputFormat).map(f => (
                    <button 
                      key={f}
                      onClick={() => updateState('format', f)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${state.format === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-600 hover:text-slate-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateState('isCompact', !state.isCompact)}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${state.isCompact ? 'bg-sky-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${state.isCompact ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-300 uppercase tracking-wider">Compact CSS</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-slate-600" />
                <select 
                  value={state.theme} 
                  onChange={(e) => updateState('theme', e.target.value as OutputTheme)}
                  className="bg-transparent text-[11px] font-bold text-slate-400 uppercase tracking-wider focus:outline-none cursor-pointer hover:text-slate-200"
                >
                  {Object.values(OutputTheme).map(t => (
                    <option key={t} value={t}>{t.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
             <div className="flex items-center gap-2 text-slate-400">
                <Braces className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Output Buffer</span>
              </div>
              <div className="flex gap-2">
                {state.result && (
                  <>
                  <button 
                    onClick={() => copyToClipboard(`<style>\n${state.result?.css}\n</style>`, 'style')}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                  >
                    {copied === 'style' ? <Check className="w-3 h-3 text-green-400" /> : <FileCode className="w-3 h-3" />}
                    Style Tag
                  </button>
                  <button 
                    onClick={() => copyToClipboard(state.result?.css || '', 'css')}
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                  >
                    {copied === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy CSS
                  </button>
                  </>
                )}
              </div>
          </div>

          <div className={`relative flex-1 rounded-2xl border-2 transition-all duration-300 min-h-[500px] shadow-2xl overflow-hidden ${themes[state.theme]}`}>
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <div className="text-[10px] font-mono opacity-30 uppercase tracking-tighter">
                {state.result?.css ? `${state.result.css.length} chars` : '0 chars'}
              </div>
            </div>

            {state.isConverting && (
              <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 relative">
                   <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full" />
                   <div className="absolute inset-0 border-4 border-t-sky-500 rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white uppercase tracking-[0.2em] animate-pulse">Styling...</p>
                  <p className="text-[10px] text-slate-500 mt-2">Gemini is mapping utilities to CSS</p>
                </div>
              </div>
            )}

            {!state.result && !state.isConverting && !state.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <ArrowRightLeft className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 text-balance">Ready to Transform</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">
                  Paste code on the left and hit "Generate Styles". Built-in fix for <strong>selector::before</strong> backgrounds included.
                </p>
              </div>
            )}

            {state.error && (
              <div className="absolute inset-0 bg-red-950/10 flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-red-500 font-bold uppercase text-xs tracking-widest">Conversion Error</h3>
                <p className="text-xs text-red-400/70 mt-2 max-w-[300px]">{state.error}</p>
              </div>
            )}

            {state.result && (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-6 overflow-auto font-mono-code text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                  {highlightedCode}
                </div>
                
                <div className="p-5 border-t border-slate-800 bg-slate-950/50">
                  <div className="flex gap-4 mb-3">
                     <div className="flex-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Mapping Strategy</label>
                        <p className="text-[10px] text-slate-400 leading-tight italic">
                          {state.result.explanation}
                        </p>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.result.notes.map((note, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-[9px] font-bold text-sky-400 border border-sky-900/30 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-sky-500" />
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-slate-900 mt-12 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <span className="text-[9px] font-black tracking-[0.3em]">ELEMENTOR</span>
              <span className="text-[9px] font-black tracking-[0.3em]">BRICKS</span>
              <span className="text-[9px] font-black tracking-[0.3em]">GUTENBERG</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-700 flex items-center gap-4 font-medium">
             <a href="https://elementor.com" target="_blank" className="hover:text-sky-500 transition-colors flex items-center gap-1">Docs <ExternalLink className="w-3 h-3" /></a>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <span>&copy; 2024 Tailwind2Builder</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
