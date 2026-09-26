import autocannon from 'autocannon';

const runTest = () => {
  const url = 'http://localhost:6001/fetchAllPosts';

  console.log(`🔥 Starting benchmark against ${url}...`);
  console.log(`Parameters: 100 concurrent connections, duration 15s\n`);

  const instance = autocannon(
    {
      url,
      connections: 100, // 100 simultaneous simulated users
      duration: 15,     // 15 seconds test run
      pipelining: 1,
    },
    (err, result) => {
      if (err) {
        console.error('Benchmark Error:', err);
      }
    }
  );

  autocannon.track(instance, { renderProgressBar: true });
};

runTest();