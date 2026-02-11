
import net from 'net';

function testPort(host: string, port: number) {
  return new Promise((resolve) => {
    console.log(`Testing ${host}:${port}...`);
    const start = Date.now();
    const socket = net.connect(port, host, () => {
      console.log(`Connected to ${host}:${port} (${Date.now() - start}ms)`);
      socket.end();
      resolve(true);
    });

    socket.on('error', (err) => {
      console.error(`Error for ${host}:${port}:`, err.message);
      resolve(false);
    });

    socket.setTimeout(5000, () => {
      console.error(`Timeout for ${host}:${port}`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function run() {
  await testPort('smtp.office365.com', 587);
  await testPort('login.microsoftonline.com', 443);
}

run();
