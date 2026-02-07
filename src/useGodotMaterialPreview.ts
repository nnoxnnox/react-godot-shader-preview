import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { validateShader } from './lib';
import type { DisplayMode, GodotMaterialPreviewHandle, GodotMaterialPreviewProps, SamplerState, ShaderLoadedPayload, ShaderUniform } from './GodotMaterialPreview.types';
import { DEFAULT_SAMPLER_STATE, STATUS_HIDE_MS, toPayload } from './GodotMaterialPreview.types';

export interface UseGodotMaterialPreviewResult {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  status: { message: string; error: boolean } | null;
  godotLoading: boolean;
  uniforms: ShaderUniform[];
  samplerState: Record<string, SamplerState>;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  updateUniform: (index: number, next: ShaderUniform) => void;
  updateSampler: (name: string, patch: Partial<SamplerState>) => void;
  setParameter: (name: string, value: number | boolean | number[] | string | null) => void;
}

export function useGodotMaterialPreview(
  props: GodotMaterialPreviewProps,
  ref: React.ForwardedRef<GodotMaterialPreviewHandle>
): UseGodotMaterialPreviewResult {
  const {
    onValidationError,
    onLoadError,
    onLoadSuccess,
    onShaderLoaded,
    onReady,
    statusHideDelayMs = STATUS_HIDE_MS,
  } = props;

  const [status, setStatus] = useState<{ message: string; error: boolean } | null>(null);
  const [godotLoading, setGodotLoading] = useState(false);
  const [uniforms, setUniforms] = useState<ShaderUniform[]>([]);
  const [samplerState, setSamplerState] = useState<Record<string, SamplerState>>({});
  const [displayMode, setDisplayModeState] = useState<DisplayMode>('Circle');
  const [skyModeAvailable, setSkyModeAvailable] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewerRef = useRef<Window['GodotShaderViewer'] | null>(null);

  const hideStatus = useCallback(() => setStatus(null), []);
  const showStatus = useCallback((message: string, error: boolean) => {
    setStatus({ message, error });
    setTimeout(hideStatus, statusHideDelayMs);
  }, [statusHideDelayMs, hideStatus]);

  const getViewer = useCallback(() => viewerRef.current ?? (typeof window !== 'undefined' ? window.GodotShaderViewer : undefined), []);

  const attachCallbacks = useCallback((viewer: NonNullable<Window['GodotShaderViewer']>) => {
    viewer.onSuccess = () => { showStatus('Shader loaded.', false); onLoadSuccess?.(); };
    viewer.onShaderLoaded = (data: ShaderLoadedPayload | ShaderUniform[]) => {
      const list = Array.isArray(data) ? data : (data as ShaderLoadedPayload).uniforms ?? [];
      setUniforms(list);
      setSkyModeAvailable((data as ShaderLoadedPayload).shaderType === 'sky');
      setSamplerState((prev) => {
        const next = { ...prev };
        list.filter((u) => u.type === 'sampler2D').forEach((u) => { if (!next[u.name]) next[u.name] = { ...DEFAULT_SAMPLER_STATE }; });
        return next;
      });
      onShaderLoaded?.(list);
    };
    viewer.onError = (err: string) => { showStatus('Error: ' + err, true); onLoadError?.(err); };
  }, [showStatus, onLoadSuccess, onLoadError, onShaderLoaded]);

  const loadShader = useCallback((code: string) => {
    const result = validateShader(code);
    if (!result.valid) {
      onValidationError?.(result.errors);
      showStatus('Validation failed.', true);
      return;
    }
    const viewer = getViewer();
    if (!viewer?.loadShader) {
      onLoadError?.('Viewer not ready.');
      showStatus('Viewer not ready.', true);
      return;
    }
    attachCallbacks(viewer);
    viewer.loadShader(code);
  }, [getViewer, attachCallbacks, onValidationError, onLoadError, showStatus]);

  useImperativeHandle(ref, () => ({ loadShader, isReady: () => !!getViewer()?.loadShader }), [loadShader, getViewer]);

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    getViewer()?.setDisplayMode?.(mode);
    setDisplayModeState(mode);
  }, [skyModeAvailable, getViewer]);

  const setParameter = useCallback((name: string, value: number | boolean | number[] | string | null) => {
    const payload = toPayload(value);
    try {
      const win = iframeRef.current?.contentWindow as Window & { godotSetShaderParamCallback?: (n: string, p: unknown) => void };
      if (win?.godotSetShaderParamCallback) { win.godotSetShaderParamCallback(name, payload); return; }
    } catch { /* cross-origin */ }
    getViewer()?.setParameter?.(name, payload);
  }, [getViewer]);

  const updateUniform = useCallback((index: number, next: ShaderUniform) => {
    setUniforms((prev) => { const u = [...prev]; u[index] = next; return u; });
    const v = next.value;
    if (v !== null && (typeof v !== 'string' || v.startsWith('data:'))) setParameter(next.name, v);
  }, [setParameter]);

  const updateSampler = useCallback((name: string, patch: Partial<SamplerState>) => {
    setSamplerState((prev) => ({ ...prev, [name]: { ...(prev[name] ?? DEFAULT_SAMPLER_STATE), ...patch } }));
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setGodotLoading(true);
    setStatus({ message: 'Loading...', error: false });
    const MAX_POLL = 250;
    let attempts = 0;
    let cancelled = false;
    const poll = () => {
      if (cancelled) return;
      const viewer = typeof window !== 'undefined' ? window.GodotShaderViewer : undefined;
      if (viewer?.loadShader) {
        viewerRef.current = viewer;
        setGodotLoading(false);
        showStatus('Viewer ready.', false);
        onReady?.();
        return;
      }
      if (++attempts < MAX_POLL) setTimeout(poll, 100);
      else { setGodotLoading(false); setStatus({ message: 'Viewer did not become ready.', error: true }); }
    };
    const t = setTimeout(poll, 500);
    iframe.addEventListener('load', poll);
    return () => {
      cancelled = true;
      clearTimeout(t);
      iframe.removeEventListener('load', poll);
    };
  }, [showStatus, onReady]);

  return {
    iframeRef,
    status,
    godotLoading,
    uniforms,
    samplerState,
    displayMode,
    setDisplayMode,
    updateUniform,
    updateSampler,
    setParameter,
  };
}
