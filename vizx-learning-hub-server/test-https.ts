
import https from 'https';

function testHttps(url: string) {
  return new Promise((resolve, reject) => {
    console.log(`Testing ${url} with https module...`);
    const start = Date.now();
    https.get(url, (res) => {
      console.log(`Result: ${res.statusCode} (${Date.now() - start}ms)`);
      resolve(res.statusCode);
    }).on('error', (e) => {
      console.error(`Error for ${url}:`, e.message);
      reject(e);
    });
  });
}

async function run() {
  const sites = [
    'https://www.google.com',
    'https://login.microsoftonline.com',
    'https://api.github.com'
  ];
  for (const site of sites) {
    try {
      await testHttps(site);
    } catch {}
  }
}

run();
