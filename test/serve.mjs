import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const types = { '.html': 'text/html', '.css': 'text/css' };
createServer(async (req, res) => {
  const p = (req.url.split('?')[0] === '/' ? '/selector-equivalence.html' : req.url.split('?')[0]);
  try {
    const body = await readFile('.' + p);
    const ext = p.slice(p.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': types[ext] || 'text/plain' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nope'); }
}).listen(8731, '127.0.0.1', () => console.log('listening on 8731'));
