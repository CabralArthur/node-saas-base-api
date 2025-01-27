export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    ttl: process.env.JWT_TTL || 3600,
    privateKey: process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY,
  },
  database: {
    dbname: process.env.DB_NAME,
    logging: process.env.DB_LOGGING === 'true',
    pool: {
      max: parseInt(process.env.DB_CONNECTION) || 5,
      min: parseInt(process.env.DB_CONNECTION_MIN) || 1,
    },
    master: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
};
