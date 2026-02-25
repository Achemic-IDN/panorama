const users = [
  { endpoint: '/api/staff/login', body: { username: 'entry', password: 'entry123' } },
  { endpoint: '/api/staff/login', body: { username: 'transport', password: 'transport123' } },
  { endpoint: '/api/staff/login', body: { username: 'packaging', password: 'pack123' } },
  { endpoint: '/api/staff/login', body: { username: 'penyerahan', password: 'pen123' } },
  { endpoint: '/api/auth/login', body: { role: 'admin', username: 'admin', password: 'admin123' } },
];

async function run() {
  for (const u of users) {
    try {
      const res = await fetch('http://localhost:3000' + u.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u.body),
      });

      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch (e) { json = text; }

      console.log('---', u.endpoint, '---');
      console.log('Status:', res.status);
      console.log('Body:', JSON.stringify(json, null, 2));
      console.log('Cookies:', res.headers.get('set-cookie'));
    } catch (err) {
      console.error('Error calling', u.endpoint, err);
    }
  }
}

run();
