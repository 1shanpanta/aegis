// SPDX-License-Identifier: Apache-2.0
//
// FBM + domain-warping WebGL shader. Renders a slow-evolving "liquid marble"
// background that gives the hero its calm, premium feel. Palette retuned to
// midnight-blue + shield-teal for the Aegis brand.
//
// Source: design.md global playbook.

import { useEffect, useRef } from "react";

const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                          dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * snoise(p);
    p = p * 2.02 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (uv * 2.0 - 1.0);
  p.x *= u_resolution.x / u_resolution.y;
  p *= 1.1;

  float t = u_time * 0.035;

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
  vec2 r = vec2(
    fbm(p + 2.5 * q + vec2(1.7, 9.2) + t * 0.4),
    fbm(p + 2.5 * q + vec2(8.3, 2.8) + t * 0.3)
  );
  float f = fbm(p + 2.2 * r);

  // Midnight palette — deep ink to accent blue to shield teal highlights.
  vec3 ink   = vec3(0.027, 0.035, 0.055);   // near-black ink
  vec3 deep  = vec3(0.045, 0.075, 0.180);   // deep midnight
  vec3 mid   = vec3(0.150, 0.290, 0.560);   // accent blue
  vec3 hilo  = vec3(0.250, 0.620, 0.760);   // muted teal highlight

  vec3 col = mix(ink, deep, smoothstep(-0.5, 0.5, f));
  col = mix(col, mid,  smoothstep(0.15, 0.85, length(r) * 0.9));
  col = mix(col, hilo, smoothstep(0.65, 0.98, length(r) - 0.05));

  // Subtle vignette so glass cards stay readable.
  float vignette = smoothstep(1.2, 0.4, length(uv - 0.5));
  col *= mix(0.55, 1.0, vignette);

  gl_FragColor = vec4(col, 1.0);
}
`;

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("shader compile failed", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export const Shader = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("program link failed", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Full-screen triangle pair.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(resolutionLoc, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();
    let lastFrame = 0;
    const render = (now: number) => {
      // Cap to ~30fps to be polite on laptops while keeping motion fluid.
      if (now - lastFrame < 1000 / 32) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      resize();
      const elapsed = (now - start) / 1000;
      gl.uniform1f(timeLoc, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={
        "absolute inset-0 w-full h-full pointer-events-none " + (className ?? "")
      }
    />
  );
};
