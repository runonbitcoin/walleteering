## About

Demo showing how a third-party wallet might be plugged into RUN to (1) own jigs and (2) pay for transactions. This is done by creating an adapter that implements RUN's `Owner` and `Purse` APIs, which allows RUN to talk to the wallet. This adapter object is passed as `wallet` when creating a `Run` instance.

## Running the demo

1. Start the wallet: `node .`
2. Open the app: `https://localhost:8080`
3. Type a name for your digital pet and click **Set Name**
4. Click the TXID to verify it was created on a block explorer