const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./seed');

let memoryServer = null;

const connectToDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
        try {
            console.log('Attempting to connect to external MongoDB cluster...');
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 2000
            });
            console.log('Connected successfully to external MongoDB cluster!');
            await seedDatabase();
            return;
        } catch (error) {
            console.warn('External MongoDB connection failed or timed out:', error.message);
            console.log('Falling back to embedded MongoDB server for seamless zero-setup operation...');
        }
    }

    try {
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log('Connected to embedded MongoDB at:', fallbackUri);
        await seedDatabase();
    } catch (fallbackError) {
        console.error('Fatal: Could not initialize embedded MongoDB:', fallbackError);
        process.exit(1);
    }
};

module.exports = connectToDB;
