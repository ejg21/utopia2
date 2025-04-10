import http from 'http';
import httpProxy from 'http-proxy';
import HttpsProxyAgent from 'https-proxy-agent';
import url from 'url';
import nodeStatic from 'node-static';

// Static file server
const serve = new nodeStatic.Server('main/');
const port = process.env.PORT || 8080;

// Proxy list (IP:PORT or full proxy URLs)
const proxies = [
  'http://123.123.123.123:8080',
  'http://124.124.124.124:8000',
  'http://125.125.125.125:3128'
];

function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Create the proxy server
const proxy = httpProxy.createProxyServer({});

// Main server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname.startsWith('/proxy/')) {
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
      res.writeHead(400);
      res.end('Missing target URL.');
      return;
    }

    // Set up the proxy with a random upstream proxy
    const proxyUrl = getRandomProxy();

    proxy.web(req, res, {
      target: targetUrl,
      changeOrigin: true,
      agent: new HttpsProxyAgent(proxyUrl),
      headers: {
        host: url.parse(targetUrl).host
      }
    }, (err) => {
      res.writeHead(500);
      res.end(`Proxy error: ${err.message}`);
    });

  } else {
    // Serve static files
    req.addListener('end', () => serve.serve(req, res)).resume();
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

