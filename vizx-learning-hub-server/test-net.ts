
// Node 18+ has global fetch

async function testFetch() {
  const sites = [
    'https://www.google.com',
    'https://login.microsoftonline.com',
    'https://api.github.com'
  ];

  for (const site of sites) {
    try {
      console.log(`Testing ${site}...`);
      const start = Date.now();
      const res = await fetch(site, { method: 'HEAD' });
      console.log(`Result: ${res.status} (${Date.now() - start}ms)`);
    } catch (err) {
      console.error(`Error for ${site}:`, err.message);
    }
  }
}

testFetch();
