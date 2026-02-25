const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });
const TABLE_NAME = process.env.USERS_TABLE;

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);
    
    // Check if user exists
    const existing = await dynamo.get({
      TableName: TABLE_NAME,
      Key: { email }
    }).promise();

    if (existing.Item) {
      return { statusCode: 400, body: JSON.stringify({ message: 'User already exists' }) };
    }

    // Hash password & save
    const hashedPassword = await bcrypt.hash(password, 10);
    await dynamo.put({
      TableName: TABLE_NAME,
      Item: {
        email,
        password: hashedPassword,
        userId: uuidv4(),
        createdAt: new Date().toISOString()
      }
    }).promise();

    return { statusCode: 201, body: JSON.stringify({ message: 'User registered' }) };

  } catch (err) {
        console.error('🔥 Registration error:', err); // 👈 This shows REAL error
        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
            message: 'Registration failed', 
            error: err.message // 👈 Include error in response
            }) 
        };
    }
};