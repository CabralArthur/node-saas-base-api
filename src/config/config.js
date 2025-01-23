require('dotenv').config();

module.exports = {
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
	},
	app: {
		secretKey: process.env.APP_SECRET_KEY,
		port: process.env.PORT || 3000,
		env: process.env.NODE_ENV || 'development'
	},
	sendGrid: {
		key: process.env.SENDGRID_API_KEY,
		domain: process.env.EMAIL_FROM
	},
	email: {
		from: process.env.EMAIL_FROM,
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD
		}
	},
	client: {
		baseUrl: process.env.CLIENT_BASE_URL
	},
	stripe: {
		apiKey: process.env.STRIPE_API_KEY,
		webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
		MONTHLY: process.env.MONTHLY_PLAN_STRIPE_ID,
		YEARLY: process.env.YEARLY_PLAN_STRIPE_ID,
		MONTHLY_DB_PLAN_ID: +process.env.MONTHLY_DB_PLAN_ID,
		YEARLY_DB_PLAN_ID: +process.env.YEARLY_DB_PLAN_ID
	}
};

