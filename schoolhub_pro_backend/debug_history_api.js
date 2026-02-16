const loginUrl = 'http://localhost:5000/api/auth/login';

async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@schoolhub.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error('Login failed');
        const token = loginData.data.token;
        console.log('Login successful.');

        // 2. Search for Simon Ghost
        console.log('Searching for Simon Ghost...');
        const searchRes = await fetch('http://localhost:5000/api/students?search=Simon', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const searchData = await searchRes.json();
        const student = searchData.data.find(s => s.name.includes('Simon'));

        if (!student) throw new Error('Simon Ghost not found via API');
        console.log(`Found Student: ${student.name} (${student.id || student._id})`);

        // 3. Get History
        console.log(`Fetching history for ${student.id || student._id}...`);
        const historyUrl = `http://localhost:5000/api/students/${student.id || student._id}/history`;
        const historyRes = await fetch(historyUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyData = await historyRes.json();

        console.log('History API Response:', JSON.stringify(historyData, null, 2));

    } catch (err) {
        console.error('Debug Failed:', err.message);
    }
}

run();
