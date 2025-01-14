require('dotenv').config();

module.exports = {
	config: {
		sendGrid: {
			key: 'apiKey',
			domain: ''
		}
	},
	databases: {
		dialect: 'postgres',
		master: {
			host: process.env.DB_HOST,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT
		},
		dbname: process.env.DB_NAME
	},
	aws: {
		region: process.env.AWS_REGION || 'us-east-1',
		bucket: process.env.AWS_S3_BUCKET,
		bucket_url: process.env.AWS_S3_BUCKET_URL,
		prefix: process.env.AWS_S3_PREFIX,
		accelerate_prefix: process.env.AWS_S3_ACCELERATE_PREFIX,
		accessKeyId: process.env.AWS_S3_ACCESS_KEY,
		secretAccessKey: process.env.AWS_S3_SECRET_KEY,
		expires_in_seconds: {
			default: process.env.AWS_S3_EXPIRES_IN_SECONDS_DEFAULT || 604800
		}
	}
};
