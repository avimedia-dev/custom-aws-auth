const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
const TABLE_NAME = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Get user
    const result = await dynamo.get({
      TableName: TABLE_NAME,
      Key: { email }
    }).promise();

    if (!result.Item) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, result.Item.password);
    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
    }

    // Generate JWT
    const token = jwt.sign(
      { sub: result.Item.userId, email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return { statusCode: 200, body: JSON.stringify({ accessToken: token }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Login failed' }) };
  }
};