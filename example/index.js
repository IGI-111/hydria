const readline = require('readline');
const Hydria = require('hydria');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

(async () => {
  const secretKey = 'top-secret';

  const hydria = await new Hydria(secretKey);

  hydria.listen(state => {
    console.log(state);
  });

  rl.on('line', line => {
    hydria.send({ key: line });
  });
})();
