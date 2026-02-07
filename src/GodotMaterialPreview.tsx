import { forwardRef } from 'react';
import { GodotMaterialPreviewView } from './GodotMaterialPreviewView';
import type { GodotMaterialPreviewHandle, GodotMaterialPreviewProps } from './GodotMaterialPreview.types';
import { useGodotMaterialPreview } from './useGodotMaterialPreview';
import { RGS_EMBED_FOLDER } from './GodotMaterialPreview.types';

export { RGS_EMBED_FOLDER } from './GodotMaterialPreview.types';
export type { ShaderUniform, GodotMaterialPreviewHandle, ShaderLoadedPayload, DisplayMode, GodotMaterialPreviewProps } from './GodotMaterialPreview.types';

const DEFAULTS = {
  embedUrl: `/${RGS_EMBED_FOLDER}/embed.html`,
  previewWidth: 512,
  showMeshSwitch: true,
  allowMouseInteraction: true,
  showParameters: false,
} as const;

export const GodotMaterialPreview = forwardRef<GodotMaterialPreviewHandle, GodotMaterialPreviewProps>(function GodotMaterialPreview(props, ref) {
  const logic = useGodotMaterialPreview(props, ref);
  const layout = { ...DEFAULTS, ...props };
  return <GodotMaterialPreviewView {...logic} {...layout} className={props.className} />;
});
