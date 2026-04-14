exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY;

  if (!WEB3FORMS_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Server configuration error: WEB3FORMS_KEY is not set.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid JSON payload.' }),
    };
  }

  const { name, email, phone, message } = payload;

  if (!name || !email || !phone || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Missing required fields.' }),
    };
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        name,
        email,
        phone,
        message,
        subject: 'New contact request from portfolio',
        source: 'React Portfolio',
      }),
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: result.message || 'Web3Forms submission failed.',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Message sent successfully.' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Server error while sending message.' }),
    };
  }
};
