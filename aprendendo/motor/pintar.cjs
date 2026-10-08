// Pinta as ilustrações de um vídeo (como um ilustrador faz antes de animar): cada arquivo
// videos/<tema>/arte/<nome>.js descreve uma peça em SVG com os efeitos "de estúdio" (grão,
// luz de contorno, brilho, névoa, desfoque) que seriam pesados demais para calcular a cada quadro;
// aqui ela é rasterizada uma vez, em alta resolução e com fundo transparente, e vira
// videos/<tema>/imagens/<nome>.png, que a cena anima em camadas com objeto()/textura().
//
//   node aprendendo/motor/pintar.cjs aprendendo/videos/<tema> [nome ...] [--escala 2] [--se-mudou]
// (--se-mudou: só repinta a peça se a arte ou o kit de estúdio forem mais novos que o PNG; o gerar.py usa assim)
//
// Cada arte exporta { largura, altura, svg(E) } ou uma lista delas (com `nome`); E é o kit de
// estúdio de motor/estudio.cjs (defs de filtros, paleta, prng, grão, sombreamento...).
const fs = require("fs"), path = require("path");
const puppeteer = require(path.join(__dirname, "../../node_modules/puppeteer-core"));
const E = require("./estudio.cjs");

(async () => {
  const args = process.argv.slice(2), esc = args.includes("--escala") ? +args[args.indexOf("--escala") + 1] : 2;
  const pasta = args[0], so = args.slice(1).filter((a, i, l) => !a.startsWith("--") && l[i - 1] !== "--escala");
  const dirArte = path.join(pasta, "arte"), dirImg = path.join(pasta, "imagens");
  fs.mkdirSync(dirImg, { recursive: true });
  const exe = process.env.PRODUCER_HEADLESS_SHELL_PATH || require("child_process").execSync("ls -d /opt/pw-browsers/chromium_headless_shell-*/*/headless_shell | tail -1").toString().trim();
  const b = await puppeteer.launch({ executablePath: exe, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const fontes = path.resolve(__dirname, "../identidade/fontes");
  const css = [600, 800, 900].map((p) => `@font-face{font-family:"Nunito";font-weight:${p};src:url(data:font/woff2;base64,${fs.readFileSync(`${fontes}/nunito-${p}.woff2`).toString("base64")})}`).join("");
  for (const f of fs.readdirSync(dirArte).filter((f) => f.endsWith(".js")).sort()) {
    delete require.cache[require.resolve(path.resolve(dirArte, f))];
    let pecas = require(path.resolve(dirArte, f));
    pecas = Array.isArray(pecas) ? pecas : [{ nome: f.replace(/\.js$/, ""), ...pecas }];
    for (const p of pecas) {
      if (so.length && !so.includes(p.nome)) continue;
      const png = path.join(dirImg, `${p.nome}.png`);
      if (args.includes("--se-mudou") && fs.existsSync(png)) {
        const t = fs.statSync(png).mtimeMs;
        if (t > fs.statSync(path.resolve(dirArte, f)).mtimeMs && t > fs.statSync(path.join(__dirname, "estudio.cjs")).mtimeMs) continue;
      }
      const pg = await b.newPage();
      await pg.setViewport({ width: p.largura, height: p.altura, deviceScaleFactor: p.escala || esc });
      await pg.setContent(`<!doctype html><html><head><style>${css}html,body{margin:0;background:transparent}svg{display:block}</style></head><body>
        <svg xmlns="http://www.w3.org/2000/svg" width="${p.largura}" height="${p.altura}" viewBox="0 0 ${p.largura} ${p.altura}"><defs>${E.defs}</defs>${p.svg(E)}</svg></body></html>`);
      await pg.evaluate(() => document.fonts.ready);
      const saida = path.join(dirImg, `${p.nome}.png`);
      await pg.screenshot({ path: saida, omitBackground: true, clip: { x: 0, y: 0, width: p.largura, height: p.altura } });
      await pg.close();
      console.log("pintada:", saida, `${p.largura * (p.escala || esc)}×${p.altura * (p.escala || esc)}`);
    }
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
