import { reactRouter } from '@react-router/dev/vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import { vitePluginOptimizeNamedImports } from './vitePluginOptimizeNamedImports';
import fs from 'fs';

export default defineConfig(({ command }) => {
  const isTest = process.env.VITE_TEST === 'true';
  const isDev = !isTest && command === 'serve'; // true when running `react-router dev`

  const apiUrl = 'https://localhost:8555';

  // Only load certs in dev mode
  const httpsOptions = isDev
    ? {
        key: fs.readFileSync('./certificates/localhost-key.pem'),
        cert: fs.readFileSync('./certificates/localhost.pem'),
      }
    : undefined;

  return {
    plugins: [
      tsConfigPaths(),
      vitePluginOptimizeNamedImports(['@mui/icons-material']),
      reactRouter(),
    ],
    build: {
      assetsDir: 'oma-opiskelijavalinta/assets',
      base: '/oma-opiskelijavalinta/',
    },
    server: isDev
      ? {
          https: httpsOptions,
          port: 3777,
          host: 'localhost',
          proxy: {
            '/oma-opiskelijavalinta/api': {
              target: apiUrl,
              secure: false,
              changeOrigin: false,
              cookieDomainRewrite: 'localhost',
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
              configure: (proxy) => {
                proxy.on('error', (err) => console.log('proxy error', err));
                proxy.on('proxyReq', (proxyReq, req) => {
                  console.log(
                    'Sending Request to the Target:',
                    req.method,
                    req.url,
                    proxyReq.host,
                  );
                });
                proxy.on('proxyRes', (proxyRes, req) => {
                  console.log(
                    'Received Response from the Target:',
                    proxyRes.statusCode,
                    req.url,
                  );
                });
              },
            },
            '/oppija-raamit/js': {
              target: 'https://untuvaopintopolku.fi',
              changeOrigin: true,
              secure: false,
              rewrite: (path) =>
                path.replace(/^\/oppija-raamit\/js/, '/oppija-raamit/js'),
            },
            '/oppija-raamit/html': {
              target: 'https://untuvaopintopolku.fi',
              changeOrigin: true,
              secure: false,
            },
            '/oppija-raamit/img': {
              target: 'https://untuvaopintopolku.fi',
              changeOrigin: true,
              secure: false,
            },
            '/cas-oppija/user': {
              target: 'https://untuvaopintopolku.fi',
              changeOrigin: true,
              secure: false,
              rewrite: (path) =>
                path.replace(/^\/cas-oppija\/user/, '/cas-oppija/user'),
            },
          },
        }
      : undefined, // no server config in build
  };
});
