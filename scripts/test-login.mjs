// Manual test case for POST /api/kuesioner/login
// Runs server-side (Node), so it is not affected by the browser's CORS block.
//
// Usage:
//   node scripts/test-login.mjs
//   node scripts/test-login.mjs 003130771 Ukwms_2026

const API_URL = process.env.VITE_API_URL || 'https://simanja2.ukwms.ac.id/api';

const userid = process.argv[2] || '003130771';
const password = process.argv[3] || 'Ukwms_2026';

const assert = (condition, message) => {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
};

async function testLoginSuccess() {
  console.log(`\n[Test] Login dengan kredensial valid (${userid})`);

  const res = await fetch(`${API_URL}/kuesioner/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ userid, password }),
  });

  const contentType = res.headers.get('content-type') || '';
  assert(res.status === 200, `status code is 200 (got ${res.status})`);
  assert(contentType.includes('application/json'), `response is JSON (got "${contentType}")`);

  const body = await res.json();
  assert(body.success === true, 'response.success === true');
  assert(typeof body?.data?.token === 'string' && body.data.token.length > 0, 'response.data.token is a non-empty string');
  assert(body?.data?.user?.userid === userid, 'response.data.user.userid matches request');
  assert(typeof body?.data?.user?.nama === 'string', 'response.data.user.nama is present');

  console.log('Token:', body.data.token);
  console.log('User:', body.data.user);

  return body.data.token;
}

async function testLoginInvalidCredentials() {
  console.log('\n[Test] Login dengan password salah');

  const res = await fetch(`${API_URL}/kuesioner/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ userid, password: 'password-salah-sengaja' }),
  });

  assert(res.status === 401 || res.status === 422, `status code is 401/422 for invalid credentials (got ${res.status})`);

  const contentType = res.headers.get('content-type') || '';
  assert(contentType.includes('application/json'), `error response is JSON, not an HTML debug page (got "${contentType}")`);
}

async function testUserEndpointWithToken(token) {
  console.log('\n[Test] GET /kuesioner/user dengan token hasil login');

  const res = await fetch(`${API_URL}/kuesioner/user`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    redirect: 'manual',
  });

  // A 3xx redirect here means the route is not validating the Sanctum
  // bearer token (falls back to session/SSO guard) — known backend issue.
  if (res.status >= 300 && res.status < 400) {
    throw new Error(`FAIL: /kuesioner/user returned ${res.status} redirect (Location: ${res.headers.get('location')}) instead of validating the Bearer token.`);
  }

  const contentType = res.headers.get('content-type') || '';
  assert(res.status === 200, `status code is 200 (got ${res.status})`);
  assert(contentType.includes('application/json'), `response is JSON (got "${contentType}")`);

  const body = await res.json();
  assert(body?.data?.userid === userid, 'response.data.userid matches logged-in user');
}

async function main() {
  try {
    const token = await testLoginSuccess();
    await testLoginInvalidCredentials();
    await testUserEndpointWithToken(token);
    console.log('\nAll test cases completed.');
  } catch (err) {
    console.error('\n' + err.message);
    process.exitCode = 1;
  }
}

main();
