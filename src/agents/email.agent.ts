import sgMail from '@sendgrid/mail';
import { Email } from '../models/email';
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export class EmailAgent {
  static async send(to: string, template: Email, data: any, subjectExtra: string) {
    const profileLink = `${process.env['PUBLIC_URL']}/my-account/profile`;

    if (subjectExtra && data.subject) {
      data.subject += ` (${subjectExtra})`;
    }

    const message = {
      to,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_EMAIL_NAME,
      },
      templateId: template,
      dynamic_template_data: { ...data, siteBaseUrl: process.env['PUBLIC_URL'], profileLink },
    };

    if (process.env['DO_NOT_SEND_EMAILS']) {
      return {};
    }
    return sgMail.send(message);
  }
}
