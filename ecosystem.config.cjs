/**
 * PM2 ecosystem file — start with: pm2 start ecosystem.config.cjs
 * Run from repo root (e.g. /root/projects/roomi).
 */
module.exports = {
  apps: [
    {
      name: 'roomi-backend',
      cwd: './backend',
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'roomi-frontend',
      cwd: './frontend',
      script: 'npx',
      args: 'serve -s dist -l 3012',
      interpreter: 'none',
      instances: 1,
      env: { NODE_ENV: 'production' },
    },
  ],
};
