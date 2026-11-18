// Minimal static file server for the Storybook and samples builds, used as Playwright webServer.
// Usage: node serve-static.mjs <directory> <port> [--spa]
// With --spa, requests for unknown paths without file extension return index.html (client side routing).
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const args = process.argv.slice(2);
const spa = args.includes('--spa');
const [root = '.', port = '6106'] = args.filter((arg) => arg !== '--spa');
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

function resolveFile(urlPath) {
    const filePath = path.join(rootDir, urlPath);
    if (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) {
        return undefined;
    }
    try {
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            const index = path.join(filePath, 'index.html');
            return statSync(index).isFile() ? index : undefined;
        }
        return filePath;
    } catch {
        return undefined;
    }
}

createServer((req, res) => {
    let urlPath;
    try {
        urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
        res.writeHead(400).end('Bad request');
        return;
    }

    let filePath = resolveFile(urlPath);
    if (!filePath && spa && !path.extname(urlPath)) {
        filePath = resolveFile('/index.html');
    }
    if (!filePath) {
        res.writeHead(404).end('Not found');
        return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] ?? 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
}).listen(Number(port), '127.0.0.1', () => {
    console.log(`Serving ${rootDir} on http://127.0.0.1:${port}${spa ? ' (SPA)' : ''}`);
});
