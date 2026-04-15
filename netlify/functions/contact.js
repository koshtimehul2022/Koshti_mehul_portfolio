const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitMap = new Map();

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const getClientIp = (event) => {
  const forwarded = event.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return event.headers?.['client-ip'] || event.headers?.['x-real-ip'] || 'unknown';
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const handler = async function (event) {
  const ip = getClientIp(event);
  console.log('Contact function invoked', { method: event.httpMethod, ip });

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    console.error('Invalid JSON payload', error);
    return jsonResponse(400, {
      success: false,
      message: 'Invalid JSON payload.',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const { name, email, phone, message, botField } = payload;
  const cleanedName = typeof name === 'string' ? name.trim() : '';
  const cleanedEmail = typeof email === 'string' ? email.trim() : '';
  const cleanedPhone = typeof phone === 'string' ? phone.trim() : '';
  const cleanedMessage = typeof message === 'string' ? message.trim() : '';

  if (isNonEmptyString(botField)) {
    console.warn('Honeypot triggered, likely spam', { botField });
    return jsonResponse(400, {
      success: false,
      message: 'Spam detected.',
    });
  }

  const errors = [];
  if (!isNonEmptyString(cleanedName)) errors.push('Name is required.');
  if (!isNonEmptyString(cleanedEmail) || !isValidEmail(cleanedEmail)) errors.push('A valid email is required.');
  if (!isNonEmptyString(cleanedPhone)) errors.push('Phone is required.');
  if (!isNonEmptyString(cleanedMessage)) errors.push('Message is required.');

  if (errors.length > 0) {
    console.warn('Validation errors', { errors });
    return jsonResponse(400, {
      success: false,
      message: 'Validation failed for contact form fields.',
      errors,
    });
  }

  const apiKey = process.env.WEB3FORMS_KEY;
  if (!isNonEmptyString(apiKey)) {
    console.error('Missing WEB3FORMS_KEY environment variable');
    return jsonResponse(500, {
      success: false,
      message: 'Server configuration error. Please try again later.',
    });
  }

  const now = Date.now();
  const rateEntry = rateLimitMap.get(ip) || { count: 0, firstRequestAt: now };

  if (now - rateEntry.firstRequestAt > RATE_LIMIT_WINDOW) {
    rateEntry.count = 0;
    rateEntry.firstRequestAt = now;
  }

  rateEntry.count += 1;
  rateLimitMap.set(ip, rateEntry);

  if (rateEntry.count > RATE_LIMIT_MAX_REQUESTS) {
    console.warn('Rate limit exceeded', { ip, rateEntry });
    return jsonResponse(429, {
      success: false,
      message: 'Too many requests. Please wait a few minutes and try again.',
    });
  }

  try {
    const formData = new FormData();
    formData.append('access_key', apiKey);
    formData.append('name', cleanedName);
    formData.append('email', cleanedEmail);
    formData.append('phone', cleanedPhone);
    formData.append('message', cleanedMessage);
    formData.append('source', 'Portfolio contact form');

    const web3Response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    let web3Result = null;
    try {
      web3Result = await web3Response.json();
    } catch (jsonError) {
      const fallbackText = await web3Response.text().catch(() => 'Unable to read response body');
      console.error('Invalid JSON from Web3Forms', jsonError, { status: web3Response.status, body: fallbackText });
      return jsonResponse(web3Response.status >= 400 ? web3Response.status : 502, {
        success: false,
        message: `Web3Forms response error. ${fallbackText.slice(0, 200)}`,
      });
    }

    if (!web3Response.ok || web3Result?.success !== true) {
      const externalMessage = web3Result?.message || web3Result?.error || 'Failed to submit the contact form.';
      console.error('Web3Forms API error', {
        status: web3Response.status,
        externalMessage,
      });
      return jsonResponse(web3Response.status >= 400 ? web3Response.status : 500, {
        success: false,
        message: externalMessage,
      });
    }

    console.log('Web3Forms submission successful', { ip });
    return jsonResponse(200, {
      success: true,
      message: 'Message sent successfully. I will reach out soon.',
    });
  } catch (error) {
    console.error('Contact submission failed', error);
    return jsonResponse(500, {
      success: false,
      message: 'Unexpected server error. Please try again later.',
    });
  }
};
