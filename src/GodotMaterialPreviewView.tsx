import type { DisplayMode, SamplerSource, SamplerState, ShaderUniform } from './GodotMaterialPreview.types';

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function DiamondIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}
import { DEFAULT_SAMPLER_STATE, rgbToHex, hexToRgb } from './GodotMaterialPreview.types';

const cn = {
  root: 'rgs-root',
  previewWrap: 'rgs-previewWrap',
  preview: 'rgs-preview',
  canvas: 'rgs-canvas',
  mouseBlockOverlay: 'rgs-mouseBlockOverlay',
  modeStrip: 'rgs-modeStrip',
  modeStripButton: 'rgs-modeStripButton',
  modeStripButtonActive: 'rgs-modeStripButtonActive',
  loadingOverlay: 'rgs-loadingOverlay',
  statusBar: 'rgs-statusBar',
  statusSuccess: 'rgs-statusSuccess',
  statusError: 'rgs-statusError',
  paramsPanel: 'rgs-paramsPanel',
  paramsTitle: 'rgs-paramsTitle',
  paramsPlaceholder: 'rgs-paramsPlaceholder',
  paramRow: 'rgs-paramRow',
  paramLabel: 'rgs-paramLabel',
  paramInput: 'rgs-paramInput',
  paramCheckbox: 'rgs-paramCheckbox',
  paramSliderRow: 'rgs-paramSliderRow',
  paramSlider: 'rgs-paramSlider',
  paramColorRow: 'rgs-paramColorRow',
  paramColor: 'rgs-paramColor',
  paramVec: 'rgs-paramVec',
  paramSamplerBlock: 'rgs-paramSamplerBlock',
  paramSamplerSource: 'rgs-paramSamplerSource',
  paramSamplerRow: 'rgs-paramSamplerRow',
  paramFile: 'rgs-paramFile',
  paramSamplerLabel: 'rgs-paramSamplerLabel',
  paramSamplerNoise: 'rgs-paramSamplerNoise',
  paramSamplerGradient: 'rgs-paramSamplerGradient',
  paramSelect: 'rgs-paramSelect',
} as const;

export interface GodotMaterialPreviewViewProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  godotEmbedUrl: string;
  previewWidth: number;
  showMeshSwitch: boolean;
  allowMouseInteraction: boolean;
  showParameters: boolean;
  status: { message: string; error: boolean } | null;
  godotLoading: boolean;
  uniforms: ShaderUniform[];
  samplerState: Record<string, SamplerState>;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  updateUniform: (index: number, next: ShaderUniform) => void;
  updateSampler: (name: string, patch: Partial<SamplerState>) => void;
  setParameter: (name: string, value: number | boolean | number[] | string | null) => void;
  className?: string;
}

export function GodotMaterialPreviewView({
  iframeRef,
  godotEmbedUrl,
  previewWidth,
  showMeshSwitch,
  allowMouseInteraction,
  showParameters,
  status,
  godotLoading,
  uniforms,
  samplerState,
  displayMode,
  setDisplayMode,
  updateUniform,
  updateSampler,
  setParameter,
  className,
}: GodotMaterialPreviewViewProps) {
  return (
    <div className={`${cn.root} ${className ?? ''}`} style={{ flex: `0 0 ${previewWidth}px` }}>
      <div className={cn.previewWrap}>
        <div className={cn.preview}>
          <iframe ref={iframeRef} src={godotEmbedUrl} title="Shader preview" className={cn.canvas} />
          {!allowMouseInteraction && <div className={cn.mouseBlockOverlay} aria-hidden />}
          {showMeshSwitch && (
            <div className={cn.modeStrip} role="group" aria-label="Preview display mode">
              <button type="button" className={`${cn.modeStripButton} ${displayMode === 'Circle' ? cn.modeStripButtonActive : ''}`} onClick={() => setDisplayMode('Circle')} title="Sphere" aria-pressed={displayMode === 'Circle'} aria-label="Sphere"><CircleIcon /></button>
              <button type="button" className={`${cn.modeStripButton} ${displayMode === 'Plane' ? cn.modeStripButtonActive : ''}`} onClick={() => setDisplayMode('Plane')} title="Plane" aria-pressed={displayMode === 'Plane'} aria-label="Plane"><DiamondIcon /></button>
            </div>
          )}
          {godotLoading && (
            <div className={cn.loadingOverlay}><div>{status?.message ?? 'Loading...'}</div></div>
          )}
        </div>
      </div>
      {status && !godotLoading && (
        <div className={cn.statusBar}>
          <span className={status.error ? cn.statusError : cn.statusSuccess}>{status.message}</span>
        </div>
      )}
      {showParameters && (
        <div className={cn.paramsPanel}>
          <div className={cn.paramsTitle}>{uniforms.length > 0 ? 'Shader parameters' : 'Parameters'}</div>
          {uniforms.length > 0 ? (
            uniforms.map((u, i) => (
              <ParamRow
                key={u.name}
                u={u}
                i={i}
                samplerState={samplerState}
                updateUniform={updateUniform}
                updateSampler={updateSampler}
                setParameter={setParameter}
              />
            ))
          ) : (
            <p className={cn.paramsPlaceholder}>Load a shader with uniform variables to see and edit parameters here.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ParamRowProps {
  u: ShaderUniform;
  i: number;
  samplerState: Record<string, SamplerState>;
  updateUniform: (index: number, next: ShaderUniform) => void;
  updateSampler: (name: string, patch: Partial<SamplerState>) => void;
  setParameter: (name: string, value: number | boolean | number[] | string | null) => void;
}

function ParamRow({ u, i, samplerState, updateUniform, updateSampler, setParameter }: ParamRowProps) {
  const state = samplerState[u.name] ?? DEFAULT_SAMPLER_STATE;
  const updateU = (next: ShaderUniform) => updateUniform(i, next);

  return (
    <div className={cn.paramRow}>
      <label className={cn.paramLabel} htmlFor={`param-${u.name}`}>{u.name}{u.type !== 'float' && u.type !== 'int' && u.type !== 'bool' ? ` (${u.type})` : ''}</label>
      {(u.type === 'float' || u.type === 'int') && (() => {
        const isFloat = u.type === 'float';
        const min = 0; const max = isFloat ? 1 : 100; const step = isFloat ? 0.01 : 1;
        const parse = isFloat ? (x: string) => parseFloat(x) : (x: string) => parseInt(x, 10);
        const num = typeof u.value === 'number' ? u.value : 0;
        const clamp = (v: number) => Math.max(min, Math.min(max, v));
        return (
          <div className={cn.paramSliderRow}>
            <input type="range" id={`param-${u.name}-slider`} min={min} max={max} step={step} value={clamp(num)} onChange={(e) => { const n = parse(e.target.value); if (!Number.isNaN(n)) updateU({ ...u, value: n }); }} className={cn.paramSlider} aria-label={u.name} />
            <input type="number" id={`param-${u.name}`} step={isFloat ? 'any' : 1} value={num} onChange={(e) => { const n = parse(e.target.value); if (!Number.isNaN(n)) updateU({ ...u, value: n }); }} className={cn.paramInput} />
          </div>
        );
      })()}
      {u.type === 'bool' && <input id={`param-${u.name}`} type="checkbox" checked={u.value === true} onChange={(e) => updateU({ ...u, value: e.target.checked })} className={cn.paramCheckbox} />}
      {(u.type === 'vec2' || u.type === 'vec3') && (() => {
        const len = u.type === 'vec2' ? 2 : 3;
        const base = Array.isArray(u.value) ? u.value : [];
        return (
          <div className={cn.paramVec}>
            {Array.from({ length: len }, (_, j) => (
              <input key={j} type="number" step="any" value={base[j] ?? 0}
                onChange={(e) => { const n = parseFloat(e.target.value); if (Number.isNaN(n)) return; const arr = Array.from({ length: len }, (_, k) => (k === j ? n : (base[k] ?? 0))); updateU({ ...u, value: arr }); }}
                className={cn.paramInput} aria-label={`${u.name} ${j}`} />
            ))}
          </div>
        );
      })()}
      {(u.type === 'vec4' || u.type === 'color') && (() => {
        const arr = Array.isArray(u.value) ? [...u.value] : [0, 0, 0, 1];
        const alpha = arr[3] ?? 1;
        const setAlpha = (a: number) => updateU({ ...u, value: [...arr.slice(0, 3), a] });
        return (
          <div className={cn.paramColorRow}>
            <input type="color" value={rgbToHex(arr.slice(0, 3) as number[])} onChange={(e) => { const [r, g, b] = hexToRgb(e.target.value); updateU({ ...u, value: [r, g, b, arr[3] ?? 1] }); }} className={cn.paramColor} aria-label={`${u.name} color`} />
            <input type="range" min={0} max={1} step={0.01} value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} className={cn.paramSlider} aria-label={`${u.name} alpha`} />
            <input type="number" min={0} max={1} step={0.01} value={alpha} onChange={(e) => { const a = parseFloat(e.target.value); if (!Number.isNaN(a)) setAlpha(a); }} className={cn.paramInput} aria-label={`${u.name} alpha`} />
          </div>
        );
      })()}
      {u.type === 'sampler2D' && (
        <SamplerParam u={u} state={state} updateUniform={updateU} updateSampler={updateSampler} setParameter={setParameter} />
      )}
    </div>
  );
}

function SamplerParam(
  { u, state, updateUniform, updateSampler, setParameter }: {
    u: ShaderUniform; state: SamplerState;
    updateUniform: (next: ShaderUniform) => void;
    updateSampler: (name: string, patch: Partial<SamplerState>) => void;
    setParameter: (name: string, value: number | boolean | number[] | string | null) => void;
  }
) {
  const updateS = (patch: Partial<SamplerState>) => updateSampler(u.name, patch);
  const sendNoise = (n: SamplerState['noise']) => setParameter(u.name, JSON.stringify({ type: 'noise', noise_type: n.noise_type, seed: n.seed, frequency: n.frequency, width: n.width, height: n.height }));
  const sendGradient1d = (g: SamplerState['gradient1d']) => setParameter(u.name, JSON.stringify({ type: 'gradient1d', width: g.width, stops: g.stops }));
  const sendGradient2d = (g: SamplerState['gradient2d']) => setParameter(u.name, JSON.stringify({ type: 'gradient2d', width: g.width, height: g.height, fill: g.fill, stops: g.stops }));

  return (
    <div className={cn.paramSamplerBlock}>
      <select className={cn.paramSamplerSource} value={state.source}
        onChange={(e) => { const src = e.target.value as SamplerSource; updateS({ source: src }); if (src === 'noise') sendNoise(state.noise); else if (src === 'gradient1d') sendGradient1d(state.gradient1d); else if (src === 'gradient2d') sendGradient2d(state.gradient2d); }}
        aria-label={`${u.name} source`}>
        <option value="image">Image</option>
        <option value="noise">Noise</option>
        <option value="gradient1d">Gradient 1D</option>
        <option value="gradient2d">Gradient 2D</option>
      </select>
      {state.source === 'image' && (
        <div className={cn.paramSamplerRow}>
          <input id={`param-${u.name}`} type="file" accept="image/png,image/jpeg,image/webp"
            onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const dataUrl = reader.result; if (typeof dataUrl === 'string') { setParameter(u.name, dataUrl); updateUniform({ ...u, value: file.name }); updateS({ fileName: file.name }); } }; reader.readAsDataURL(file); e.target.value = ''; }}
            className={cn.paramFile} aria-label={u.name} />
          <span className={cn.paramSamplerLabel}>{state.fileName ?? 'Choose image...'}</span>
        </div>
      )}
      {state.source === 'noise' && (
        <div className={cn.paramSamplerNoise}>
          <select value={state.noise.noise_type} onChange={(e) => { const next = { ...state.noise, noise_type: parseInt(e.target.value, 10) }; updateS({ noise: next }); sendNoise(next); }} className={cn.paramSelect}>
            {[0, 1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{['Simplex', 'Simplex Smooth', 'Perlin', 'Value', 'Value Cubic', 'Cellular'][v]}</option>)}
          </select>
          <input type="number" value={state.noise.seed} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v)) { const next = { ...state.noise, seed: v }; updateS({ noise: next }); sendNoise(next); } }} className={cn.paramInput} placeholder="Seed" />
          <input type="range" min={0.01} max={2} step={0.01} value={state.noise.frequency} onChange={(e) => { const next = { ...state.noise, frequency: parseFloat(e.target.value) }; updateS({ noise: next }); sendNoise(next); }} className={cn.paramSlider} />
        </div>
      )}
      {state.source === 'gradient1d' && (
        <div className={cn.paramSamplerGradient}>
          <input type="number" min={16} max={1024} value={state.gradient1d.width} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v)) { const next = { ...state.gradient1d, width: v }; updateS({ gradient1d: next }); sendGradient1d(next); } }} className={cn.paramInput} />
          <input type="color" value={rgbToHex([state.gradient1d.stops[0][1], state.gradient1d.stops[0][2], state.gradient1d.stops[0][3]])} onChange={(e) => { const [r, g, b] = hexToRgb(e.target.value); const stops = [...state.gradient1d.stops]; stops[0] = [0, r, g, b, 1]; const next = { ...state.gradient1d, stops }; updateS({ gradient1d: next }); sendGradient1d(next); }} className={cn.paramColor} />
          <input type="color" value={rgbToHex([state.gradient1d.stops[1][1], state.gradient1d.stops[1][2], state.gradient1d.stops[1][3]])} onChange={(e) => { const [r, g, b] = hexToRgb(e.target.value); const stops = [...state.gradient1d.stops]; stops[1] = [1, r, g, b, 1]; const next = { ...state.gradient1d, stops }; updateS({ gradient1d: next }); sendGradient1d(next); }} className={cn.paramColor} />
        </div>
      )}
      {state.source === 'gradient2d' && (
        <div className={cn.paramSamplerGradient}>
          <select value={state.gradient2d.fill} onChange={(e) => { const next = { ...state.gradient2d, fill: parseInt(e.target.value, 10) }; updateS({ gradient2d: next }); sendGradient2d(next); }} className={cn.paramSelect}>
            <option value={0}>Linear</option><option value={1}>Radial</option><option value={2}>Square</option>
          </select>
          <input type="color" value={rgbToHex([state.gradient2d.stops[0][1], state.gradient2d.stops[0][2], state.gradient2d.stops[0][3]])} onChange={(e) => { const [r, g, b] = hexToRgb(e.target.value); const stops = [...state.gradient2d.stops]; stops[0] = [0, r, g, b, 1]; const next = { ...state.gradient2d, stops }; updateS({ gradient2d: next }); sendGradient2d(next); }} className={cn.paramColor} />
          <input type="color" value={rgbToHex([state.gradient2d.stops[1][1], state.gradient2d.stops[1][2], state.gradient2d.stops[1][3]])} onChange={(e) => { const [r, g, b] = hexToRgb(e.target.value); const stops = [...state.gradient2d.stops]; stops[1] = [1, r, g, b, 1]; const next = { ...state.gradient2d, stops }; updateS({ gradient2d: next }); sendGradient2d(next); }} className={cn.paramColor} />
        </div>
      )}
    </div>
  );
}
