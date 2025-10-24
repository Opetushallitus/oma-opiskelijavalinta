import { reactRouter } from '@react-router/dev/vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import { vitePluginOptimizeNamedImports } from './vitePluginOptimizeNamedImports';
import fs from 'fs';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'; // true when running `react-router dev`

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
      reactRouter(),
      tsConfigPaths(),
      vitePluginOptimizeNamedImports(['@mui/icons-material']),
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
          },
        }
      : undefined, // no server config in build
  };
});
