const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

exports.sendParticipantSubmission = functions.firestore
  .document('participantContacts/{contactId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    const { country, diseaseArea, email, address, code, telephone } = data;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailBody = [
      'New participant contact submission from AfricaTrialUs',
      '',
      `Country: ${country}`,
      `Disease area: ${diseaseArea}`,
      `Email: ${email}`,
      `Address: ${address}`,
      `Code: ${code}`,
      `Telephone: ${telephone}`,
      '',
      'This message was generated automatically by AfricaTrialUs.',
    ].join('\n');

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'info@africatrialus.com',
      replyTo: email,
      subject: `New participant contact: ${diseaseArea} - ${country}`,
      text: mailBody,
      html: `<h3>New participant contact submission</h3><p><strong>Country:</strong> ${country}</p><p><strong>Disease area:</strong> ${diseaseArea}</p><p><strong>Email:</strong> ${email}</p><p><strong>Address:</strong> ${address}</p><p><strong>Code:</strong> ${code}</p><p><strong>Telephone:</strong> ${telephone}</p>`,
    });

    return null;
  });
