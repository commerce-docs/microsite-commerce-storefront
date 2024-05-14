import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
});
