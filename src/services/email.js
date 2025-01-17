import SendGrid from '@sendgrid/mail';
import config from '../config/config';

export default class EmailService {
	constructor() {
		SendGrid.setApiKey(config.sendGrid.key);
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
