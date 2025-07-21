import { Mail, MailtrapClient } from 'mailtrap';

export class Emailer {

  private client: MailtrapClient;

  constructor() {
    this.client = new MailtrapClient({
      token: process.env.MJ_APIKEY || '7cbd8d701b424f46ac7e726498710020',
    });
  }

  async sendMagicLink(to: string, link: string, title: string) {
    console.info('Sending magic link to: ' + to);
    console.log(link);

    const sender = {
      email: "hello@demomailtrap.co",
      name: "Mailtrap Test",
    };

    const recipients = [
      {
        email: to,
      }
    ];

    this.client
      .send({
        from: sender,
        to: recipients,
        subject: title.toUpperCase() + " : Votre lien magique",
        html: `
          <p>Bonjour,</p>
          <p>Cliquez sur le lien afin de vous identifier. Le lien sera valable pendant 30 minutes.</p>
          <p><a href="${link}" style="background-color:#007bff;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">Connexion</a></p>
          <p>Si le lien ci-dessus ne fonctionne pas, copiez/collez le lien suivant dans votre navigateur :</p>
          <pre>${link}</pre>
        `,
        category: "Integration Test",
      })
      .then(console.log, console.error);
  }
}