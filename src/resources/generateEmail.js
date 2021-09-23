import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (recipientAddress) => {
	const msg = {
		to: recipientAddress, // Change to your recipient
		from: process.env.SENDER_EMAIL, // Change to your verified sender
		subject: 'Sending with SendGrid is Fun',
		text: 'hi, testing my email message, thank you have good day',
		html: '<strong>hi, testing my email message, thank you have good day</strong>',
	};

	await sgMail.send(msg);
};
