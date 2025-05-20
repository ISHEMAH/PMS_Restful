import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Get the absolute path to the .env file
const envPath = path.join(__dirname, '../../.env');
console.log('Looking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Load environment variables
const result = dotenv.config({ path: envPath });

console.log('Environment variables loaded:', result);
console.log('ADMIN_KEY:', process.env.ADMIN_KEY);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

if (!process.env.ADMIN_KEY) {
    console.error('ADMIN_KEY is not set in the environment variables!');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in the environment variables!');
    process.exit(1);
}

console.log('All required environment variables are set correctly!'); 