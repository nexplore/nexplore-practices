// Minimal static file server for the Storybook build, used as Playwright webServer.
// Usage: node serve-static.mjs <directory> <port>
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const [root = '.', port = '6106'] = process.argv.slice(2);
const rootDir = path.resolve(root);

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let filePath = path.join(rootDir, urlPath);
    if (!filePath.startsWith(rootDir)) {
        res.writeHead(403).end();
        return;
    }
    try {
        if (statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }
        statSync(filePath);
    } catch {
        res.writeHead(404).end('Not found');
        return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] ?? 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
}).listen(Number(port), '127.0.0.1', () => {
    console.log(`Serving ${rootDir} on http://127.0.0.1:${port}`);
});
