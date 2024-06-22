import { chromeLauncher } from '@web/test-runner-chrome';
import { mocha } from '@web/test-runner-mocha';

export default {
  files: 'test/**/*.test.js',
  browsers: [chromeLauncher()],
  plugins: [mocha()],
};
