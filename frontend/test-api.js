// Test script to check the API response
const testAPI = async () => {
  try {
    console.log('Testing /api/v1/users endpoint...');
    
    const response = await fetch('http://localhost:3001/api/v1/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    // Check if it's an array or has a property with users
    if (Array.isArray(data)) {
      console.log('Response is an array with', data.length, 'users');
      const admins = data.filter(user => user.id_rol === 2);
      console.log('Admins found:', admins.length);
      console.log('Admins:', admins);
    } else {
      console.log('Response is an object with keys:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// If running in Node.js
if (typeof fetch === 'undefined') {
  // For Node.js environment
  console.log('Run this in a browser console or install node-fetch');
} else {
  testAPI();
}

// If you want to run this in browser, copy and paste this into the browser console