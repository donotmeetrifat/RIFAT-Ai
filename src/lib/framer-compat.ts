/**
 * Framer Compatibility Layer for RIFAT Ai Component
 * Provides seamless fallback when rendered inside Next.js / standard React
 * as well as inside Framer editor environments.
 */
import * as React from "react";

export const RenderTarget = {
  current: () => {
    if (typeof window !== "undefined" && (window as any).__FRAMER_CANVAS__) {
      return "canvas";
    }
    return "preview";
  },
  canvas: "canvas",
  preview: "preview",
  export: "export",
};

export const useIsStaticRenderer = () => {
  return false;
};

export const ControlType = {
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Enum: "enum",
  Array: "array",
  Object: "object",
  Image: "image",
  ComponentInstance: "componentInstance",
};

export function addPropertyControls(component: any, controls: any) {
  if (component) {
    component.propertyControls = controls;
  }
}
