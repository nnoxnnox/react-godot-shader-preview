import type { ValidationError } from './lib';

export interface ShaderUniform {
  name: string;
  type: string;
  value: number | number[] | boolean | string | null;
}

export interface GodotMaterialPreviewHandle {
  loadShader(code: string): void;
  isReady(): boolean;
}

export type SamplerSource = 'image' | 'noise' | 'gradient1d' | 'gradient2d';

export interface SamplerState {
  source: SamplerSource;
  fileName?: string;
  noise: { noise_type: number; seed: number; frequency: number; width: number; height: number };
  gradient1d: { width: number; stops: Array<[number, number, number, number, number]> };
  gradient2d: { width: number; height: number; fill: number; stops: Array<[number, number, number, number, number]> };
}

export const DEFAULT_SAMPLER_STATE: SamplerState = {
  source: 'image',
  noise: { noise_type: 2, seed: 0, frequency: 0.5, width: 256, height: 256 },
  gradient1d: { width: 256, stops: [[0, 0, 0, 0, 1], [1, 1, 1, 1, 1]] },
  gradient2d: { width: 256, height: 256, fill: 0, stops: [[0, 0, 0, 0, 1], [1, 1, 1, 1, 1]] },
};

export type DisplayMode = 'Circle' | 'Plane' | 'Skybox';

export interface ShaderLoadedPayload {
  uniforms: ShaderUniform[];
  shaderType?: 'spatial' | 'sky';
}

declare global {
  interface Window {
    GodotShaderViewer?: {
      loadShader: (code: string) => void;
      setParameter: (name: string, value: number | boolean | string | number[] | null) => void;
      setDisplayMode?: (mode: string) => void;
      onSuccess: (() => void) | null;
      onError: ((error: string) => void) | null;
      onShaderLoaded: ((data: ShaderLoadedPayload | ShaderUniform[]) => void) | null;
    };
  }
}

export interface GodotMaterialPreviewProps {
  previewWidth?: number;
  showMeshSwitch?: boolean;
  allowMouseInteraction?: boolean;
  showParameters?: boolean;
  onValidationError?: (errors: ValidationError[]) => void;
  onLoadError?: (message: string) => void;
  onLoadSuccess?: () => void;
  onShaderLoaded?: (uniforms: ShaderUniform[]) => void;
  onReady?: () => void;
  statusHideDelayMs?: number;
  className?: string;
}

export const STATUS_HIDE_MS = 3000;

export const toPayload = (v: number | boolean | number[] | string | null): string =>
  v === null ? '' : typeof v === 'boolean' ? (v ? 'true' : 'false') : Array.isArray(v) ? JSON.stringify(v) : typeof v === 'string' ? v : String(v);

export function rgbToHex(rgb: number[]): string {
  const r = Math.round((rgb[0] ?? 0) * 255);
  const g = Math.round((rgb[1] ?? 0) * 255);
  const b = Math.round((rgb[2] ?? 0) * 255);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.slice(1).match(/.{2}/g);
  if (!m) return [0, 0, 0];
  return [parseInt(m[0], 16) / 255, parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255];
}
