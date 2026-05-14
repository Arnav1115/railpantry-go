import fs from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);
virtualConsole.on("jsdomError", (error) => {
  console.error("JSDOM Error:", error.message, error.stack);
});

const html = fs.readFileSync(path.resolve('./dist/index.html'), 'utf8');
const jsdom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});
