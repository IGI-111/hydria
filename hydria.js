const IPFS = require('ipfs');
const CryptoJS = require('crypto-js');
const uuid = require('uuid');
const Y = require('yjs');

const yMem = require('y-memory');
const yMap = require('y-map');
const yIpfsConnector = require('y-ipfs-connector');

yMem(Y);
yMap(Y);
yIpfsConnector(Y);

module.exports = class Hydria {
  send (state) {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(state), this.secretKey).toString();
    this.y.share.data.set('state', ciphertext);
  }

  listen (observer) {
    this.y.share.data.observe(evt => {
      const ciphertext = evt.object.contents['state'];
      const plaintext = CryptoJS.AES.decrypt(ciphertext, this.secretKey).toString(CryptoJS.enc.Utf8);
      observer(JSON.parse(plaintext));
    });
  }

  constructor (secretKey, ipfs) {
    this.secretKey = secretKey;
    this.ipfs = ipfs !== undefined
      ? ipfs
      : new IPFS({
        EXPERIMENTAL: {
          pubsub: true,
          sharding: true,
          dht: true
        },
        repo: `/tmp/hydria/${uuid.v4()}/`,
        config: {
          Addresses: {
            Swarm: [
              '/ip4/0.0.0.0/tcp/0',
              '/ip4/127.0.0.1/tcp/0/ws',
              '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            ]
          }
        }
      });

    return new Promise((resolve) => {
      this.ipfs.once('ready', () => this.ipfs.id(async (err, info) => {
        if (err) { throw err; }

        console.log('IPFS node ready with address ' + info.id);

        this.y = await Y({
          db: { name: 'memory' },
          connector: {
            name: 'ipfs',
            room: CryptoJS.SHA256(secretKey),
            ipfs: this.ipfs
          },
          share: {
            data: 'Map'
          }
        });

        resolve(this);
      }));
    });
  }
};
