# Chapter 2. Implementing Purse

In this chapter, you'll implement a basic Purse using your wallet and then use it pay for some jigs. Please read [Chapter 1](01-background.md) if you haven't already to understand where `pay()` fits into Run. Now let's get started.

## Getting started

Here is what Run's `Purse API` looks like:

```
class Purse {
	async pay(txhex: string) : string
	async broadcast(txhex: string)
}
```

You'll implement this API and then pass in your wallet as the purse when creating Run:

    new Run({ purse: myWallet })

We'll focus on the `pay()` method. The `broadcast()` method is optional and covered in [Chapter 4: Advanced Considerations](04-advanced.md).

## The Purse API

Start by creating an empty project and adding a file called `my-wallet.js`. Then, paste the following code:

```
class MyWallet {
    pay(txhex) {
        const tx = new bsv.Transaction(txhex)

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<

        return tx.toString('hex)
    }
}
```

Next, add a test file. This can either be a browser HTML or a node.js project, and you'll need to link the `run` and `bsv` libraries. See the Run examples if this is unfamilar. Paste the following code:

```
const run = new Run({ purse: new MyWallet(), network: 'main' })

class Dragon extends Jig { }

const dragon = new Dragon()

await run.sync()
```

This test will create Run using your wallet and then instantiate a basic dragon. The result will be a transaction that has two resource outputs (the Dragon class and the dragon instance). When `run.sync()` is called, the transaction is broadcasted. The `owner` in this example will be randomly generated from a local private key.

If you run this test, you'll see the following error: `Error: Broadcast failed: tx has no inputs`. We now have to add code to the `pay()` method.

## The pay method

TODO

- Talking to your wallet (post message). Quering UTXOs. Async.
- Rule of thumb: Pay more than you need, and then receive change
- Placeholder signatures
- BSV library
- Check if run transactions
- Run works in both the browser and in node. If your library only works in one of these environments, specify this.
- Assume a hypothetical REST API or postMessage
- Create a new project for this wallet adapter. Put this in a `my-wallet.js`:
- Backed jigs
- UTXO management
- Limits on amount spend
- Detecting network? Or specify when create

## Testing your purse

TODO

- purseTests(run, { supportsBackedJigs: false })

## Where to go from here?

[Chapter 3: Implementing Owner](03-owner.md)

- Automate testing for your purse
- Create a minified browser build
- Read about *Backed Jigs* in the Run documentation
- Look at the purse implementation in the demo project
