/**
 * Cena 2.5D: a imagem do Flux é deslocada por um mapa de profundidade (Depth Anything) num shader
 * WebGL — o que está perto se move mais que o que está longe, e a câmera "entra" na imagem
 * (dolly lento + deriva lateral). Sem mapa, usa uma profundidade radial (efeito Ken Burns com volume).
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ALTURA, LARGURA } from "../lib/plan";

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImg; uniform sampler2D uDepth;
uniform vec2 uOff; uniform float uZoom; uniform float uStrength; uniform vec2 uCover;
vec2 cover(vec2 uv){ return (uv-0.5)*uCover+0.5; }
void main(){
  vec2 uv = (vUv-0.5)/uZoom+0.5;
  float d = texture2D(uDepth, cover(uv)).r;               // 1 = perto
  vec2 sh = uOff*(d-0.45)*uStrength;
  float d2 = texture2D(uDepth, cover(uv-sh)).r;            // 2ª passada: menos "esticão" nas bordas
  sh = uOff*(d2-0.45)*uStrength;
  vec3 c = texture2D(uImg, clamp(cover(uv-sh), 0.001, 0.999)).rgb;
  gl_FragColor = vec4(c, 1.0);
}`;

function carregar(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("falha ao carregar " + url));
    im.src = url;
  });
}

function profundidadeRadial(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 114;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 62, 4, 32, 62, 70);
  r.addColorStop(0, "#fff"); r.addColorStop(1, "#222");
  g.fillStyle = r; g.fillRect(0, 0, 64, 114);
  return c;
}

interface Props { src: string; depth?: string; duracaoQuadros: number; seed: number }

export const ParallaxScene = ({ src, depth, duracaoQuadros, seed }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gl = useRef<{ g: WebGLRenderingContext; prog: WebGLProgram; aspecto: number } | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const h = delayRender(`parallax ${src}`);
    let vivo = true;
    (async () => {
      try {
        const canvas = ref.current!;
        const g = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false })!;
        const sh = (t: number, s: string) => { const o = g.createShader(t)!; g.shaderSource(o, s); g.compileShader(o); if (!g.getShaderParameter(o, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(o) ?? "shader"); return o; };
        const prog = g.createProgram()!;
        g.attachShader(prog, sh(g.VERTEX_SHADER, VERT)); g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
        g.linkProgram(prog); g.useProgram(prog);
        const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
        const loc = g.getAttribLocation(prog, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
        g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
        const tex = (unidade: number, fonte: TexImageSource) => {
          const t = g.createTexture(); g.activeTexture(g.TEXTURE0 + unidade); g.bindTexture(g.TEXTURE_2D, t);
          g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, fonte);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        };
        const img = await carregar(staticFile(src));
        tex(0, img);
        let dm: TexImageSource;
        try { dm = depth ? await carregar(staticFile(depth)) : profundidadeRadial(); } catch { dm = profundidadeRadial(); }
        tex(1, dm);
        g.uniform1i(g.getUniformLocation(prog, "uImg"), 0); g.uniform1i(g.getUniformLocation(prog, "uDepth"), 1);
        if (vivo) { gl.current = { g, prog, aspecto: img.width / img.height }; setPronto(true); }
      } catch (e) { console.error(e); }
      continueRender(h);
    })();
    return () => { vivo = false; };
  }, [src, depth]);

  useLayoutEffect(() => {
    const s = gl.current; if (!s || !pronto) return;
    const { g, prog, aspecto } = s;
    const p = interpolate(frame, [0, Math.max(1, duracaoQuadros - 1)], [0, 1], { extrapolateRight: "clamp" });
    // velocidade CONSTANTE (sem acelerar/frear dentro da tomada): o movimento fica contínuo, sem trancos
    const ts = frame / fps;
    const sentido = seed % 2 === 0 ? 1 : -1;
    const zoom = 1.06 + 0.022 * ts;                          // dolly lento e constante
    const ox = sentido * (0.012 * ts - 0.015);               // deriva lateral constante
    const oy = -0.006 * ts;
    void p;
    const ca = LARGURA / ALTURA;
    const cover: [number, number] = aspecto > ca ? [ca / aspecto, 1] : [1, aspecto / ca];
    g.viewport(0, 0, LARGURA, ALTURA);
    g.uniform2f(g.getUniformLocation(prog, "uOff"), ox, oy);
    g.uniform1f(g.getUniformLocation(prog, "uZoom"), zoom);
    g.uniform1f(g.getUniformLocation(prog, "uStrength"), 1.0);
    g.uniform2f(g.getUniformLocation(prog, "uCover"), cover[0], cover[1]);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  }, [frame, pronto, duracaoQuadros, seed, fps]);

  return <canvas ref={ref} width={LARGURA} height={ALTURA} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};
