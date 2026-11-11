const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();

const VULAVULA_API_KEY = defineSecret('VULAVULA_API_KEY');
const VULAVULA_TRANSLATE_URL = 'https://api.lelapa.ai/v1/translate/process';
const VULAVULA_LANGUAGE_CODES = Object.freeze({
  en: 'eng_Latn',
  zu: 'zul_Latn',
  xh: 'xho_Latn',
  af: 'afr_Latn',
  nso: 'nso_Latn',
  st: 'sot_Latn',
  ssw: 'ssw_Latn',
  tso: 'tso_Latn',
  tn: 'tsn_Latn',
  sw: 'swh_Latn',
});

exports.translateWithVulavula = onRequest(
  { secrets: [VULAVULA_API_KEY], timeoutSeconds: 30, memory: '256MiB' },
  async (req, res) => {
    res.set('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
      res.set('Allow', 'POST').status(405).json({ error: 'Method not allowed.' });
      return;
    }

    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const sourceLanguage = req.body?.sourceLanguage || 'en';
    const targetLanguage = req.body?.targetLanguage;
    const sourceCode = VULAVULA_LANGUAGE_CODES[sourceLanguage];
    const targetCode = VULAVULA_LANGUAGE_CODES[targetLanguage];

    if (!text || text.length > 3000) {
      res.status(400).json({ error: 'Text must be between 1 and 3000 characters.' });
      return;
    }
    if (!sourceCode || !targetCode) {
      res.status(400).json({ error: 'Unsupported source or target language.' });
      return;
    }
    if (sourceLanguage === targetLanguage) {
      res.status(200).json({ translatedText: text });
      return;
    }

    const apiKey = VULAVULA_API_KEY.value();
    if (!apiKey) {
      res.status(503).json({ error: 'Translation service is not configured.' });
      return;
    }

    try {
      const upstream = await fetch(VULAVULA_TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CLIENT-TOKEN': apiKey,
        },
        body: JSON.stringify({
          input_text: text,
          source_lang: sourceCode,
          target_lang: targetCode,
        }),
        signal: AbortSignal.timeout(25000),
      });

      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error('Vulavula returned an error:', upstream.status);
        res.status(502).json({ error: 'Translation provider request failed.' });
        return;
      }

      const translatedText = result.translation?.[0]?.translated_text;
      if (typeof translatedText !== 'string' || !translatedText.trim()) {
        console.error('Vulavula response did not contain translated text.');
        res.status(502).json({ error: 'Translation provider returned an invalid response.' });
        return;
      }

      res.status(200).json({ translatedText: translatedText.trim() });
    } catch (error) {
      console.error('Vulavula translation request failed:', error.message);
      res.status(502).json({ error: 'Translation service is temporarily unavailable.' });
    }
  }
);

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
