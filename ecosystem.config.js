module.exports = {
  apps: [
    {
      name: "system-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      restart_delay: 3000,
      max_memory_restart: "800M",
      autorestart: true,
    },
    {
      name: "system-whatsapp",
      script: "scripts/whatsapp-server.js",
      env: {
        NODE_ENV: "production",
        WHATSAPP_PORT: 3001,
        WHATSAPP_HOST: "127.0.0.1",
      },
      restart_delay: 5000,
      max_memory_restart: "1G",
      autorestart: true,
    },
  ],
};
