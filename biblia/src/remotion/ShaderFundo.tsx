/**
 * Fundo GERATIVO (zero custo): luz líquida em shader WebGL — fbm com distorção de domínio, raios de luz que giram,
 * brasas subindo e pulso na batida/clímax. Determinístico (tudo depende só do quadro e da semente), único por vídeo.
 * Desenhado em meia resolução e ampliado (o shader é suave; 4× mais barato em renderização por software).
 */
import { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }";
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uSeed; uniform float uPulse; uniform float uBeat;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
float h(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p=p*2.02+vec2(1.7,9.2); a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; vec2 p = (gl_FragCoord.xy - .5*uRes) / uRes.y;
  float t = uT*.06, s = uSeed;
  vec2 q = vec2(fbm(p*1.6 + vec2(s, s*.7) + t), fbm(p*1.6 + vec2(5.2,1.3) - t*1.3));
  vec2 r = vec2(fbm(p*2.0 + 3.*q + vec2(1.7,9.2) + 1.5*t), fbm(p*2.0 + 3.*q + vec2(8.3,2.8) - t));
  float f = fbm(p*1.8 + 3.2*r);
  float f2 = smoothstep(.18, .92, f);
  vec3 col = mix(uA, uB, f2);
  col += uC * pow(f2, 3.) * (.38 + .5*uPulse);
  col = mix(col, uC, clamp(length(q)*.55 + uPulse*.35, 0., 1.) * smoothstep(.45,.95,f) * .6);
  // raios de luz (a partir do alto), girando devagar
  vec2 src = vec2(.0 + .25*sin(uT*.05+s), .62);
  vec2 d = p - src; float ang = atan(d.y, d.x);
  float ray = pow(n(vec2(ang*7. + uT*.08 + s, 1.3)), 3.) * smoothstep(1.4, .0, length(d));
  col += uC * ray * (.55 + .6*uPulse + .25*uBeat);
  // brasas
  vec2 g = vec2(uv.x*26., uv.y*46. - uT*.9); vec2 gi = floor(g); vec2 gf = fract(g) - .5;
  float rnd = h(gi + s); float on = step(.93, rnd);
  vec2 off = vec2(h(gi+1.7)-.5, h(gi+9.1)-.5) * .6;
  float em = on * smoothstep(.13, .0, length(gf - off)) * (.5 + .5*sin(uT*3. + rnd*40.));
  col += vec3(1., .62, .25) * em * .9;
  // vinheta e tom
  col *= 1.55;
  col *= 1. - .45*smoothstep(.5, 1.1, length(p*vec2(1.,.62)));
  col = pow(col, vec3(.92));
  gl_FragColor = vec4(col, 1.);
}`;

export interface PaletaGerativa { a: [number, number, number]; b: [number, number, number]; c: [number, number, number] }
export const PALETAS: Record<string, PaletaGerativa> = {
  ouro: { a: [.02, .03, .07], b: [.35, .17, .05], c: [1., .78, .38] },
  azul: { a: [.01, .03, .09], b: [.06, .22, .38], c: [.55, .85, 1.] },
  brasa: { a: [.06, .012, .01], b: [.55, .12, .04], c: [1., .6, .22] },
  aurora: { a: [.01, .04, .06], b: [.05, .32, .30], c: [.7, 1., .75] },
};

export const ShaderFundo = ({ paleta = "ouro", semente = 1, pulsos = [] as number[], batida = 1, escala = 0.5 }: { paleta?: string; semente?: number; pulsos?: number[]; batida?: number; escala?: number }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const gl = useRef<{ ctx: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> } | null>(null);
  const W = Math.round(width * escala), H = Math.round(height * escala);

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("webgl", { preserveDrawingBuffer: true, antialias: false })!;
    const sh = (t: number, src: string) => { const s = ctx.createShader(t)!; ctx.shaderSource(s, src); ctx.compileShader(s); if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) throw new Error(ctx.getShaderInfoLog(s) ?? "shader"); return s; };
    const pr = ctx.createProgram()!; ctx.attachShader(pr, sh(ctx.VERTEX_SHADER, VERT)); ctx.attachShader(pr, sh(ctx.FRAGMENT_SHADER, FRAG)); ctx.linkProgram(pr); ctx.useProgram(pr);
    const b = ctx.createBuffer(); ctx.bindBuffer(ctx.ARRAY_BUFFER, b); ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
    const loc = ctx.getAttribLocation(pr, "p"); ctx.enableVertexAttribArray(loc); ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
    const u: Record<string, WebGLUniformLocation | null> = {}; for (const k of ["uRes", "uT", "uSeed", "uPulse", "uBeat", "uA", "uB", "uC"]) u[k] = ctx.getUniformLocation(pr, k);
    gl.current = { ctx, u };
  }, []);

  useEffect(() => {
    const g = gl.current; if (!g) return; const { ctx, u } = g; const t = frame / fps; const pal = PALETAS[paleta] ?? PALETAS.ouro;
    const pulso = pulsos.reduce((m, p) => Math.max(m, t >= p ? Math.exp(-(t - p) * 3.2) : 0), 0);
    const bt = Math.exp(-((t * batida) % 1) * 5);
    ctx.viewport(0, 0, W, H);
    ctx.uniform2f(u.uRes, W, H); ctx.uniform1f(u.uT, t); ctx.uniform1f(u.uSeed, semente); ctx.uniform1f(u.uPulse, pulso); ctx.uniform1f(u.uBeat, bt);
    ctx.uniform3f(u.uA, ...pal.a); ctx.uniform3f(u.uB, ...pal.b); ctx.uniform3f(u.uC, ...pal.c);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
  }, [frame, fps, paleta, semente, pulsos, batida, W, H]);

  return <AbsoluteFill><canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%", imageRendering: "auto" }} /></AbsoluteFill>;
};
