const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

exports.doMail = function(to, from, from_name, subject, msg) {
  if (from_name == false) {
    from_name = 'OnlyCompGaming';
  }
  if (from == false) {
    from = 'account@onlycompgaming.com';
  }

  const site_url = process.env.SITE_URL || 'http://onlycompgaming.com';

  let mailMsg = fs.readFileSync(__dirname + '/email.html', 'utf8');
  mailMsg = mailMsg.replace(new RegExp('{{SITE_URL}}', 'g'), site_url);
  mailMsg = mailMsg.replace(
    new RegExp('{{CONTENT}}', 'g'),
    msg + '<br />OnlyCompGaming'
  );

  const mailOptions = {
    from: from_name + ' ' + '<' + from + '>',
    to: to,
    subject: 'OnlyCompGaming - ' + subject,
    is_html: true,
    html: mailMsg
  };

  transporter.sendMail(mailOptions, function(err) {
    // console.log(err);
  });
};
