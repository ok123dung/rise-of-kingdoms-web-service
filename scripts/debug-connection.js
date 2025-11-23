const { Client } = require('pg');

async function test() {
    const password = 'Dungvnn001*';
    // Try both raw and encoded if needed, but let's start with raw as it should work if no other special chars
    const connectionString = `postgresql://postgres.inondhimzqiguvdhyjng:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

    console.log('Testing connection with password:', password);
    console.log('Connection string (masked):', connectionString.replace(password, '******'));

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL
    });

    try {
        await client.connect();
        console.log('✅ Connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Time from DB:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.message.includes('password')) {
            console.log('⚠️  Password authentication failed. Please verify the password.');
        }
    }
}

test();
