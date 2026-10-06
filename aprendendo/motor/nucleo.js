// Núcleo comum: dados do vídeo (D, A, T), timeline (tl) e utilitários.
// Carregado primeiro; depois vêm identidade.js, biblioteca.js, cenas.js (do vídeo) e montagem.js.
gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin);
const D = window.DADOS;
const MARCA = window.MARCA;
const A = D.agenda, T = A.total;
const tl = gsap.timeline({ paused: true });
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const W = 1080, H = 1920;
function h(tag, cls, html, pai) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (pai) pai.appendChild(e); return e; }
function prng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// posiciona um conteúdo: o invólucro tem a posição, o miolo (classe) é o que anima
const P = (x, y, s, cls, inner) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}">${inner}</g></g>`;
const CENAS = {};
