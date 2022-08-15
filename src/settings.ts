import { DebugSettings } from './debug/gui';
import {
  GL_COLOR_BUFFER_BIT,
  GL_DEPTH_BUFFER_BIT,
} from './rendering/gl/gl-constants';
import { RendererSettings } from './rendering/renderer-settings';
//rgb(252, 255, 238)
export const defaultRendererSettings: RendererSettings = {
  clearColor: [252 / 255, 255 / 255, 238 / 255, 1],
  clearMask: GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT,
  resolution: [1920, 1080],
  antialias: true,
};

export const defaultDebugSettings: DebugSettings = {
  showSpector: false,
  showStats: true,
  forceMonetization: false,
};

const settings = {
  dt: 10,
  rendererSettings: defaultRendererSettings,
  debugSettings: defaultDebugSettings,
};

export default settings;
