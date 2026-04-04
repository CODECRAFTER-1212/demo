const url = 'https://demo-gos5.onrender.com';

async function test() {
  try {
    const login = await fetch(`${url}/api/auth/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        identifier: 'testbot_999@test.com',
        password: 'password123'
      })
    }).then(r => r.json());
    console.log('Login Result:', login);
    
    if (login.token) {
        console.log('Sending OTP...');
        const otp = await fetch(`${url}/api/profile/send-otp`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${login.token}` }
        }).then(r => r.json());
        console.log('OTP Result:', otp);
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
