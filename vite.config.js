import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

// Na Vercelu se nasazuje jako statické Vue SPA (root index.html -> dist/),
// zatímco lokálně (Herd/crm-pzk.test) běží přes Laravel a @vite() direktivu
// v resources/views/welcome.blade.php, která čeká výstup v public/build.
// Plugin laravel-vite-plugin proto zapínáme jen mimo Vercel build, jinak by
// přebral vstupní bod místo root index.html a Vercel by v dist/ nic nenašel.
const isVercel = !!process.env.VERCEL;

export default defineConfig({
    plugins: [
        ...(isVercel ? [] : [laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        })]),
        tailwindcss(),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
