# react-godot-shader-preview

React component for live Godot shader preview in the browser: iframe with Godot WebAssembly, validation and loading of `.gdshader` code, mesh switching: sphere/plane, and uniform/sampler controls.

## Install

```bash
yarn add react-godot-shader-preview
# or
npm install react-godot-shader-preview
```

On install, the package **postinstall** copies the Godot export from `node_modules/react-godot-shader-preview/godot` into your project root as **`react_godot_shader_preview_embed/`**. Serve that folder (e.g. as static assets) and pass its embed URL to the component (see `embedUrl` below). If you use a different path or host the embed elsewhere, pass that URL instead.

## Usage

Import the component and styles:

```jsx
import { useRef } from 'react';
import { GodotMaterialPreview } from 'react-godot-shader-preview';
import 'react-godot-shader-preview/style.css';

function App() {
  const previewRef = useRef(null);

  const loadShader = () => {
    previewRef.current?.loadShader(`
      shader_type spatial;
      uniform float roughness;
      void fragment() { ROUGHNESS = roughness; }
    `);
  };

  return (
    <>
      <button onClick={loadShader}>Load shader</button>
      <GodotMaterialPreview ref={previewRef} previewWidth={400} showMeshSwitch showParameters />
    </>
  );
}
```

## API

### Component `GodotMaterialPreview`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `embedUrl` | `string` | `"/react_godot_shader_preview_embed/embed.html"` | URL of the Godot embed page. After postinstall this path points to the copied folder; override if you serve the embed elsewhere. |
| `previewWidth` | `number` | `512` | Preview width (px). |
| `showMeshSwitch` | `boolean` | `true` | Show mesh switch (Circle/Plane). |
| `allowMouseInteraction` | `boolean` | `true` | Allow mouse interaction with 3D view. |
| `showParameters` | `boolean` | `false` | Show uniform/sampler panel. |
| `onValidationError` | `(errors: ValidationError[]) => void` | - | Called when validation fails before load. |
| `onLoadError` | `(message: string) => void` | - | Called on load/runtime error. |
| `onLoadSuccess` | `() => void` | - | Called when shader loads successfully. |
| `onShaderLoaded` | `(uniforms: ShaderUniform[]) => void` | - | Called with parsed uniform list after load. |
| `onReady` | `() => void` | - | Called when the viewer is ready. |
| `statusHideDelayMs` | `number` | `3000` | How long to show status messages (ms). |
| `className` | `string` | - | Optional CSS class for the root element. |

### Ref: `GodotMaterialPreviewHandle`

- **`loadShader(code: string)`** - Validates and loads shader source; on validation failure calls `onValidationError` and does not send to Godot.
- **`isReady(): boolean`**  Whether the viewer is ready (`GodotShaderViewer.loadShader` available).

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `GodotMaterialPreviewProps` | type | Props you pass to `<GodotMaterialPreview/>` (e.g. `previewWidth`, `onLoadError`). |
| `GodotMaterialPreviewHandle` | type | Type for the ref: `useRef<GodotMaterialPreviewHandle>(null)`; |
| `ShaderUniform` | type | One parsed uniform: `name`, `type`, `value`; <br/> Used in `onShaderLoaded(uniforms)` and when building parameter UI. |
| `ShaderLoadedPayload` | type | Object from Godot embed: `{ uniforms, shaderType? }`; same as the argument to `onShaderLoaded`. |
| `DisplayMode` | type | Literal type for mesh mode: `'Circle'`, `'Plane'`. |
| `validateShader` | function | Checks GDShader source before sending to Godot; <br/> Returns `{ valid, errors }`. Use for custom editor validation or before calling `loadShader`. |
| `ValidationError` | type | One validation error: `{ line: number; message: string }`. |
| `ValidationResult` | type | Return type of `validateShader`: `{ valid: boolean; errors: ValidationError[] }`. |
| `RGS_EMBED_FOLDER` | const | `'react_godot_shader_preview_embed'` - folder name created by postinstall. |

## How the preview works

1. The component renders an **iframe** whose `src` is the **`embedUrl`** you pass (default: `/react_godot_shader_preview_embed/embed.html` after postinstall).
2. **embed.html** loads the Godot Web build (engine + exported game). When the game is ready, the Godot project assigns a bridge object to **`window.top.GodotShaderViewer`** - i.e. the parent page’s `window`, since the game runs inside the iframe. The React app therefore sees it on its own **`window.GodotShaderViewer`**.
3. The component **polls** for `window.GodotShaderViewer` until it appears, then sets **`onSuccess`**, **`onError`**, and **`onShaderLoaded`** on that object (so Godot can call back) and uses **`loadShader`**, **`setParameter`**, **`setDisplayMode`** to drive the preview.

The Godot Web export exposes this object when ready; the component only consumes it. The bridge contract:

```ts
interface GodotShaderViewer {
  // component calls this to load shader code
  loadShader: (code: string) => void;
  
  setParameter?: (name: string, value: number | boolean | string | number[] | null) => void;
  setDisplayMode?: (mode: 'Circle' | 'Plane') => void;
  
  // component sets these; Godot calls them
  onSuccess: (() => void) | null;
  onError: ((error: string) => void) | null;
  onShaderLoaded: ((data: ShaderLoadedPayload | ShaderUniform[]) => void) | null;
}
```

## License

MIT
