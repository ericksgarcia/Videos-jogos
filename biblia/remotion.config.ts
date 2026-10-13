import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// WebGL (parallax 2.5D): "angle" usa a GPU; em servidores sem GPU defina REMOTION_GL=swangle.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as "angle" | "swangle" | "egl") ?? "angle");
if (process.env.CHROME_PATH) Config.setBrowserExecutable(process.env.CHROME_PATH);
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY ?? 2));
