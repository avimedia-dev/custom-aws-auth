const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  // Get token from headers (works both locally and on AWS)
  const token = event.headers?.Authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
  }

  try {
    // Verify token with same secret used in login
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Protected route accessed successfully!',
        userId: decoded.sub,
        email: decoded.email
      })
    };
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return { statusCode: 401, body: JSON.stringify({ message: 'Invalid token' }) };
  }
};