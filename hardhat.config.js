import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cfg = require('./hardhat.config.cjs');
export default cfg;
