# Chapter 2. Implementing Purse

In this chapter, you'll implement the `Purse API` in an adapter that calls your wallet, and then use it pay for a few jigs. Please make sure to read [Chapter 1](01-background.md) first to understand how `pay()` fits into Run's overall flow. Now let's get started.

## The Purse API

Here is Run's `Purse API`:

    class Purse {
        async pay(txhex: string) : string
        async broadcast(txhex: string)
    }

This is what you'll be implementing. Users will pass your wallet adapter as the purse when creating run:

    new Run({ purse: myWallet })

For the rest of this chapter, we'll focus on implementing and testing the `pay()` method. The `broadcast()` method is optional and covered in [Chapter 4: Advanced Considerations](04-advanced.md).

## Getting started

Begin by opening the `starter` project in this repository. This project contains two files:

* `my-wallet.js` - A placeholder for the wallet adapter we'll build
* `test.html` - A webpage that we'll use to test the wallet adapter

In this starter project, the wallet adapter is for a *browser* wallet. If your wallet is designed to work on a backend or using Node, go ahead now and convert this template project for node.

Inside `my-wallet.js`, you'll see a placeholder:

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

Let's add a log statement to see that `pay()` is called. Paste this into the `pay()` method:

    console.log('paying')

In order to hook up the wallet, let's create a basic test case. Open `test.html` and paste the following into `runTests()`:

```
const run = new Run({ purse: new MyWallet(), network: 'main' })

class Dragon extends Jig { }

const dragon = new Dragon()

await run.sync()
```

This code creates a new instance of Run for mainnet using our purse. Then, we create a new Dragon jig and `sync()` it to the blockchain. During the `sync()` step, Run produces a transaction that has one `OP_RETURN` and two resource outputs, just like our second example in [Chapter 1](01-background.md). Run then calls the `pay()` method, the owner's `sign()` method, and finally broadcasts the transaction. We didn't specify an `owner` in this example so one will be randomly generated.

At last, open `test.html` in your browser and then open the web console! You should see two lines.

![Purse Error](assets/purse_error.png)

The first line is the string "paying". Congratulations, our wallet is being called!

However, you'll also see the following error: `Error: Broadcast failed: tx has no inputs`. To get this code to pass, we'll have to add code for the `pay()` method. This will be specific for your wallet, and the remainder of the guide will give tips for how to do that and ensure it works.

## The pay() method

The job of the `pay()` method is to make the transaction acceptable to miners. It does this by adding inputs and outputs to raise its fee and then it should sign these inputs. If the transaction is not paid for successfully, it cannot be broadcast. The first step is to establish a two-way connection between the adapter and your wallet.

### Set up two-way communication

While in theory we could do everything in the `pay()` method itself, to hide private keys and other secrets, it's better if this work is actually done in the wallet so that application never has a chance to see private keys. There are many types of wallets and the details will depend on your wallet. Wallet-space may be a hidden `iframe`, a web server, a browser extension, or even a hardware device. Communication is likely to be asyncronous, so you'll notice the `pay()` method is an async method.

![Communication Flow](assets/communication_flow.png)

If your wallet runs in a hidden `iframe`, you may use [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to send the transaction to your wallet and `addEventListener` to receive it. Then, the wallet may securely pay for the transaction. After the transaction is paid, your wallet sends the transaction back to *application space* using `postMessage`, and the adapter receives it and returns it to Run. Data that crosses these boundaries will be serialized, so we recommend passing passing transactions in hex to be safe.

Other wallet backends require different yet similar code to send and receive the transaction. You'll find an example of using `fetch()` calls to talk to an express server in the `demo` project.

Once you have two-way communication set up, test it by logging calls both in application space and wallet space.

## Pay for the transaction

The `pay()` method is passed a *partial transaction*. Its goal is to add the inputs and outputs necessary for miners to accept the transaction, and then sign it. While this may be done in the adapter, 

A general strategy is to:

1. Add enough UTXOs to more than cover the transaction
2. Add a change output, returning all but the miner transaction fee to the purse
3. Sign the inputs that were transaction

However, different wallets will take different approaches.

- Rule of thumb: Pay more than you need, and then receive change
- Placeholder signatures

- Don't pay for non-dust outputs / backed jigs

## Secure your wallet

- Auth
- Check if run transactions
- Limits on amount spend

## Productionize

- Retry
- Run works in both the browser and in node. If your library only works in one of these environments, specify this.
- Detecting network? Or specify when create

## Testing your purse

- purseTests(run, { supportsBackedJigs: false })

## Where to go from here?

[Chapter 3: Implementing Owner](03-owner.md)

- Automate testing for your purse
- Create a minified browser build
- Support node
- Read about *Backed Jigs* in the Run documentation
- Look at the purse implementation in the demo project
