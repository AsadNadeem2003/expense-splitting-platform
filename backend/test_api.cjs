const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ userId: 2 }, 'super_secret_key_change_me');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/users/dashboard',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
