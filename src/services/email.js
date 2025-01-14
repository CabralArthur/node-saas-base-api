import SendGrid from '@sendgrid/mail';

export default class EmailService {
	constructor() {
		SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
	}

	async send(sendEmailOptions) {
		const options = {
			to: sendEmailOptions.to,
			from: sendEmailOptions.from,
			subject: sendEmailOptions.subject,
			text: sendEmailOptions.text,
			html: sendEmailOptions.html,
		};

		await SendGrid.send(options);

		return true;
	}
}
