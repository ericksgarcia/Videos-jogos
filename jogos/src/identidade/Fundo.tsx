import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Luz líquida em shader: ruído com deformação de domínio, periódico no tempo
// (o quadro final casa com o inicial, para o vídeo rodar em loop).
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 res; uniform float ang;
vec2 h2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.0 + 2.0*fract(sin(p)*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(dot(h2(i),f), dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x),
             mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)), dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<4;i++){ s+=a*n(p); p=p*2.02+vec2(3.1,1.7); a*=0.5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / res; uv.x *= res.x/res.y;
  vec2 c = vec2(cos(ang), sin(ang)); vec2 c2 = vec2(cos(2.0*ang), sin(2.0*ang));
  vec2 q = uv*1.6;
  vec2 w = vec2(fbm(q + 0.9*c), fbm(q + vec2(5.2,1.3) + 0.9*c2));
  float f = fbm(q + 2.2*w + 0.5*c);
  vec3 fundo = vec3(0.078,0.039,0.235);
  vec3 roxo  = vec3(0.30,0.14,0.78);
  vec3 mag   = vec3(1.0,0.24,0.55);
  vec3 cia   = vec3(0.145,0.88,1.0);
  vec3 col = mix(fundo, roxo, smoothstep(-0.25,0.45,f));
  col = mix(col, mag, 0.85*smoothstep(0.05,0.5,f + 0.35*w.x) * smoothstep(0.9,0.1,uv.y));
  col = mix(col, cia, 0.65*smoothstep(0.02,0.5,-f + 0.35*w.y) * smoothstep(0.1,0.95,uv.y));
  float v = smoothstep(1.25, 0.2, length((gl_FragCoord.xy/res - 0.5)*vec2(1.0,0.8)));
  col *= 0.55 + 0.6*v;
  gl_FragColor = vec4(col, 1.0);
}`;

type Estado = { gl: WebGLRenderingContext; ang: WebGLUniformLocation };

export const Fundo: React.FC<{ duracao: number }> = ({ duracao }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const est = useRef<Estado | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useLayoutEffect(() => {
    const cv = ref.current!;
    if (!est.current) {
      const gl = cv.getContext("webgl", { preserveDrawingBuffer: true, antialias: false })!;
      const sh = (tipo: number, src: string) => {
        const s = gl.createShader(tipo)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
        return s;
      };
      const pr = gl.createProgram()!;
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(gl.getUniformLocation(pr, "res"), cv.width, cv.height);
      gl.viewport(0, 0, cv.width, cv.height);
      est.current = { gl, ang: gl.getUniformLocation(pr, "ang")! };
    }
    const { gl, ang } = est.current;
    gl.uniform1f(ang, (2 * Math.PI * frame) / (duracao * fps));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, [frame, duracao, fps]);
  return <canvas ref={ref} width={405} height={720} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />;
};
