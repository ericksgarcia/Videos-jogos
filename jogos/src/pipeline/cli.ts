import { lerVideo } from "./comum";
import { previa, render } from "./render";

const [cmd, arq] = process.argv.slice(2);
const v = lerVideo(arq);
const r = cmd === "previa" ? previa(v) : render(v);
r.then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
