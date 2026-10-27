import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps the build working on any host or sub-path (Netlify, GitHub Pages...)
export default defineConfig({ base: './', plugins: [react()] });
