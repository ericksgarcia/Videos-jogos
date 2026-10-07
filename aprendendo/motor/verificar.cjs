// Uso: node aprendendo/motor/verificar.cjs output/<tema>/build (com PRODUCER_HEADLESS_SHELL_PATH)
// percorre a timeline do vídeo montado procurando erros de JavaScript (substitui o verificar() sem playwright)
const puppeteer = require(process.cwd() + "/node_modules/puppeteer-core");
const path = require("path");
(async () => {
  const exe = process.env.PRODUCER_HEADLESS_SHELL_PATH;
  const nav = await puppeteer.launch({ executablePath: exe, args: ["--no-sandbox"] });
  const pg = await nav.newPage();
  await pg.setViewport({ width: 1080, height: 1920 });
  const erros = [];
  pg.on("pageerror", (e) => erros.push("carregando: " + e.message));
  await pg.goto("file://" + path.resolve(process.argv[2]) + "/index.html");
  await new Promise((r) => setTimeout(r, 2000));
  const e2 = await pg.evaluate(() => { const tl = window.__timelines.main, T = tl.duration(), e = [];
    for (let t = 0; t < T; t += 0.25) { try { tl.seek(t); } catch (x) { e.push(t.toFixed(2) + " s: " + x.message); } } return e.slice(0, 10); });
  console.log(erros.concat(e2).join("\n") || "timeline sem erros");
  await nav.close();
})();
