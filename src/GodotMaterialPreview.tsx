import { forwardRef } from 'react';
import { GodotMaterialPreviewView } from './GodotMaterialPreviewView';
import type { GodotMaterialPreviewHandle, GodotMaterialPreviewProps } from './GodotMaterialPreview.types';
import { useGodotMaterialPreview } from './useGodotMaterialPreview';

export type { ShaderUniform, GodotMaterialPreviewHandle, ShaderLoadedPayload, DisplayMode, GodotMaterialPreviewProps } from './GodotMaterialPreview.types';

const DEFAULTS = {
  godotEmbedUrl: '/godot/embed.html',
  previewWidth: 320,
  showMeshSwitch: true,
  allowMouseInteraction: true,
  showParameters: false,
} as const;

export const GodotMaterialPreview = forwardRef<GodotMaterialPreviewHandle, GodotMaterialPreviewProps>(function GodotMaterialPreview(props, ref) {
  const logic = useGodotMaterialPreview(props, ref);
  const layout = { ...DEFAULTS, ...props };
  return <GodotMaterialPreviewView {...logic} {...layout} className={props.className} />;
});
