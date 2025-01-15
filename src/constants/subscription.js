const DEFAULT_PLAN_ID = 1;
const DEFAULT_PLAN_STRIPE_ID = require('dotenv').config().parsed.DEFAULT_PLAN_STRIPE_ID;

const DEFAULT_PLAN = {
	id: DEFAULT_PLAN_ID,
	stripeId: DEFAULT_PLAN_STRIPE_ID,
	trialDays: 14
};

export {
	DEFAULT_PLAN_ID,
	DEFAULT_PLAN_STRIPE_ID,
	DEFAULT_PLAN
};
