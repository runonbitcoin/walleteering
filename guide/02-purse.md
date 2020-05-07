# Chapter 2. Implementing Purse

In this chapter, you'll implement the `Purse API` in an adapter that calls your wallet, and then use it pay for a few jigs. Please make sure to read [Chapter 1](01-background.md) first to understand how `pay()` fits into Run's overall flow. Now let's get started.

## The Purse API

Here is Run's `Purse API`:

    class Purse {
        async pay(txhex: string, spent: number) : string
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
    pay(txhex, spent) {
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

The job of the `pay()` method is to make the transaction acceptable to miners. It does this by adding inputs and outputs to raise its fee and then sign those new inputs. There are two parameters passed to `pay()`, `txhex` and `spent`. 

`txhex` is the partial transaction that Run builds. You should inflate this transaction into an object to add additional inputs and outputs. The [bsv library](https://github.com/moneybutton/bsv), while optional, is capable of inflating the hex transaction via

    new bsv.Transaction(txhex)

and converting it back to hex again via

    tx.toString('hex')

The second parameter, `spent`, and is the total amount of satoshis spent in inputs of the transaction. Where as output amounts are part of the transaction itself, input amounts are not, so you may find this value helpful when calculating the miner fee. Finally, the return value from `pay()` should be the paid transaction in hex format.

To implement `pay()`, your first step is to establish a two-way connection between the adapter and your wallet.

### Setting up two-way communication

While in theory we could do everything in the `pay()` method itself, to hide private keys and other secrets, it's better if the signing is perofrmed in the wallet so the application never has a chance to see the user's private keys. Wallets may be a hidden `iframe`, a web server, a browser extension, or even a hardware device. There are many types and the details will depend on your kind of wallet. However, communication is likely to be asyncronous, so you'll notice the `pay()` method is an async method.

![Communication Flow](assets/communication_flow.png)

If your wallet runs in a hidden `iframe`, you may use [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to send the transaction to your wallet and `addEventListener` to receive it. Then, the wallet may securely pay for the transaction. After the transaction is paid, your wallet sends the transaction back to *application space* using `postMessage`, and the adapter receives it and returns it to Run. Data that crosses these boundaries will be serialized, so we recommend passing passing transactions in hex to be safe.

Other wallet backends require different yet similar code to send and receive the transaction. You'll find an example of using `fetch()` calls to talk to an express server in the `demo` project.

Once you have two-way communication set up, test it by logging calls both in application space and wallet space.

## Paying for a transaction

It is likely that your wallet already has a method to pay for a transaction, so we won't dwell on the details. A general strategy is:

1. Add enough UTXOs to more than cover the transaction
2. Calculate the expected miner fees
3. Add a change output, returning all but the fee back to the purse
4. Sign the new inputs added

Calculating the miner fee is worth dwelling on. The partial transaction passed to `pay()` will already have inputs and outputs. Run supports a feature called **backed jigs** which are tokens backed by an amount of BSV in their UTXOs. These backed jigs may be outputs, inputs, or both, so wallets should not assume that all inputs and outputs are dust. In fact this assumption is likely to lead to bugs. Therefore it's recommended that your first adapter not support backed jigs at all. You can detect backed jigs via:

    const hasNonDustInputs = spent / tx.inputs.length > 546
    const hasNonDustOutputs = tx.outputs.some(output => output.satoshis > 546)
    const hasBackedJigs = hasNonDustInputs || hasNonDustOutputs

If `hasBackedJigs` is true, throw an error. we'll cover how to support backed jigs in [Chapter 4: Advanced Considerations](04-advanced.md).

The inputs of the transaction will also have their unlocking scripts set to dummy placeholders that are the presumptive length of the actual signature scripts. You can use this knowledge when calculating the fee because the final transaction is unlikely to be bigger than the original plus any inputs and outputs you add. The current recommended miner fee as of May 2020 is 0.5 satoshis per byte.

## Testing your purse

At this point, you should have two-way communication and a payment working. It is now time to open `test.html` again and see if your purse works! Using the dragon code from before, if your purse works, there should be no errors and you should be able to see the transaction on a blockchain.

To test your wallet in different scenarioes, we provide a small set of tests in the `tests` directory of this project. Go ahead and open `purse-tests.js` and copy the contents into `test.html`. Then run the tests via

    await purseTests(run, { supportsBackedJigs: false })
    
Make sure all tests pass before moving on. Congratulations, you've now implemented a purse!

## Securing your wallet

In theory, anyone is able to call `run.purse.pay()` and use your purse to pay for any transaction, not just a Run transaction. This might actually be OK depending on your wallet, but if you'd like to restrict the wallet adapter to only Run transactions, this is easy. An Run protocol always has a OP_RETURN output as its first output, and the contents of the script will always begins with `OP_FALSE OP_RETURN "run"`, or 006a0372756e in hex. Here's code using the `bsv` library:

```
const isRunTransaction =
    tx.outputs.length &&
    tx.outputs[0].script.isSafeDataOut() &&
    tx.outputs[0].script.chunks[2].buf.toString('utf8') === 'run'
```

It's possible to use Run to generate very large data transactions. This also may be OK, but consider setting a limit on either the total amount to spend per transaction, or the total amount to spend per app over some time period.

Lastly, it is very important to authenticate the application to the wallet. Users may log in with your wallet using a password, or the app may authenticate itself with a token, or any number of techniques, but however this is done, take some care to make sure it's the app that is calling the wallet.

## Productionization

If your wallet performs any network calls, consider adding retries and timeouts. If the wallet fails to pay for a transaction, the jigs will be rolled back. While application developers are expected to plan for this, you can minimize the chances by improving robustness. Run will wait forever if necessary when calling your purse, so this is up to you.

Many wallets only work on mainnet. If this is the case for you, it is prudent to ask the user to specify the network when creating the wallet. This ensures they don't accidentally use the wallet on the wrong network. Otherwise, the only way to differentiate between mainnet and testnet is by querying UTXOs.

Finally, Run works in both the browser and node. If your wallet also supports both, now would be a good time to add a build tool like `webpack` or `rollup` to build for both the browser and node. Make sure to test both!

## Where to go from here?

[Chapter 3: Implementing Owner](03-owner.md)

- Create a minified builds for the browser
- Automate testing of your wallet adapter
- Read about *Backed Jigs* in the Run documentation
- Look at the purse implementation in the demo project
