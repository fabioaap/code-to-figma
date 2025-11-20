import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function managerEntries(entry = []) {
    return [...entry, join(__dirname, './register.js')];
}

export function config(entry = []) {
    return [...entry, join(__dirname, './preview.js')];
}
