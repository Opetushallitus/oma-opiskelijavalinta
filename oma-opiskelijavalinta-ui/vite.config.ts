import { reactRouter } from '@react-router/dev/vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import { vitePluginOptimizeNamedImports } from './vitePluginOptimizeNamedImports';
import fs from 'fs';

const apiUrl = 'https://localhost:8555'

const httpsOptions = {

  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem'),
};

export default defineConfig({
    plugins: [
        reactRouter(),
        tsConfigPaths(),
        vitePluginOptimizeNamedImports(['@mui/icons-material']),
    ],
    build: {
        // Jotta toimii myös Spring Bootissa, assetit täytyy noutaa /oma-opiskelijavalinta-polun alta eikä juuresta.
        assetsDir: 'oma-opiskelijavalinta/assets',
    },
    server: {
        https: httpsOptions,
        port: 3404,
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
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {

                        console.log('Sending Request to the Target:', req.method, req.url, proxyReq.host);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log(proxyRes._read(1000));
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        }
    },
});
