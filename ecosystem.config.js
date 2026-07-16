module.exports = {
  apps: [
    {
      name: 'campusedge-api',
      script: './apps/api/dist/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'campusedge-web',
      script: 'npx',
      args: 'serve -s apps/web/dist -l 5173',
      autorestart: true,
      watch: false,
    }
  ]
};
