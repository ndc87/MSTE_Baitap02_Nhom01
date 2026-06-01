const axios = require('axios');

async function testCart() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'tung@gmail.com', // or the user's email
      password: 'password123'
    });
    
    const token = loginRes.data.data.token;
    console.log('Login successful');

    // Get cart
    const cartRes = await axios.get('http://localhost:5000/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(JSON.stringify(cartRes.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testCart();
