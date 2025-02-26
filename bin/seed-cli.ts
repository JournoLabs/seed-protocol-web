#!/usr/bin/env node
import { execSync } from 'node:child_process';

console.log('Starting Vite site at http://localhost:4004...');
execSync('npm run serve', { stdio: 'inherit' });