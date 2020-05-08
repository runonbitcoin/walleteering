# Chapter 3. Implementing Owner

You may wonder how a wallet could be expected to manage items as diverse as tickets, social media posts, game items, digital pets, votes, rewards points, and more, each with their own challenges and user interfaces. Here's the good news: you won't have to! Run was built to cleanly separate the responsibilities of the wallet, Run, and apps. Broadly speaking:

| Run | Wallet | App |
| --- | ------ | --- |
| Loading jigs and code | Securing keys and backup | Defining jigs |
| Querying token UTXOs | Signing transactions | Creating jigs |
| Building Run transactions | Authentication and login | Displaying jigs |
| Broadcasting transactions | Payments | Updating jigs |

In this chapter, we'll learn about and implement the `Owner API`. This API provides an abstraction for your wallet to securely store an app's jigs and sign their transactions without needing to know all the details. 

## The Owner API

Here is Run's `Owner API`:

    class Owner {
        owner(): string|Lock
        async sign(txhex: string, locks: Array<Lock>)
    }

This is what we'll implement on our wallet. Our wallet will implement both the `Purse` and the `Owner` APIs at the same time. Users may pass your wallet as both the `owner` and the `purse`, or they may pass it as a `wallet` which is shorthand for both.

    const run = new Run({ owner: myWallet, purse: myWallet })

    // or equivalently

    const run = new Run({ wallet: myWallet })

To get started, paste the following placeholder code into your `MyWallet` class in `my-wallet.js`:

    owner() {
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<< 
    }

    sign(txhex, locks) {
        const tx = new bsv.Transaction(txhex)

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<< 

        return tx.toString('hex')
    }

## The owner() method

First we'll implement the `owner()` method. Your mission is to **provide a address that is fixed and unique for each app**. Let's break this down:

> *provide an address*

Why an address? Because the app and Run should not see the private keys! Key management is the responsibility of the wallet, but Run still needs a way to identifier owners, so we provide an address instead. In a sense, the wallet *is* the private key.

> *that is fixed*

The address and private key should not change each time. Why fixed? This lets the app load the same jigs every time, but also, the privacy model for jigs is fundamentally different from payments. Jigs are non-fungible by design. Because they cannot be mixed with each other like Bitcoin outputs can, they inherently have less privacy. And that's OK! So, by returning a fixed address, syncs can be simpler and faster, and we don't present the app with an illusion of privacy that doesn't exist.

> *and unique for each app*

The `owner` address should not be shared between apps. Why not? Well, you may not break anything, but Run thinks it's important for apps to have its own room to operate in. When the apps calls `run.sync()`, run load every jig assigned to the `owner()` address, and if this returns other application's jigs, this will slow down the app and create risks that apps will alter each other's data. We don't want that!

### Deriving the private key

In the wallet, we'll want to derive a private key and send its address to the adapter. This key needs to be unique for each app, so your first step is to distinguish between apps.

If your wallet already handles user authentication with a Login API, then chances are that you already have a unique app identifer. If you don't have a Login API however, you'll want apps to provide their own unique identifier when the adapter is created. This application identifier can be used to derive a unique private key from the wallet's master key.

Here is one approach:

```
function deriveApplicationKey(masterKey, appIdentifier) {
    // Start at a unique key for all application jigs
    const baseKey = masterKey.derive('m/123/456/789')
    let appKey = baseKey

    for (let i = 0; i < appIdentifier.length; i++) {
        appKey = appKey.derive(appIdentifier.charCodeAt(i))
    }

    return appKey
}
```

You may find it useful to create an `async connect(app)` method that connects to your wallet and calculates the owner address.

```
const wallet = await MyWallet.connect('<my-app-name>')
```

> **Note**: In the future, `owner()` will be `async`. In 0.5 however it is not. 

Go ahead and implement the `owner()` method.

### Testing owner()

Now, let's give it a shot. Paste this code into your `test.html`:

```
const run = new Run({ wallet: new MyWallet(), network: 'main' })

class Dragon extends Jig { }

const dragon = new Dragon()

await run.sync()

console.log('dragon.owner:', dragon.owner)
```

Run will call your `owner()` method when the `new Dragon()` line is called. The value returned will be assigned as `dragon.owner.` New jigs don't require any signatures so we can test this before the `sign()` method is implemented.

Open `test.html` in your browser and then check the web console. If you see `dragon.owner` is your address, congratulations! You've just completed the hard part. Let's finish the Owner API by implementing the `sign()` method.

## The sign() method

The `sign()` method is called by Run when there are jig inputs in a transaction. Run builds a transaction that spends a jig UTXO whenever that jig is updated. However, it doesn't have the private key to sign it! You'll want to sign the transaction similar to the `pay()` method in the purse. You'll send the transaction hex to the wallet, the wallet will sign it, and the transaction will be returned back to your adapter and then to Run.

The simplest approach to sign is to sign all inputs it is able to! The `bsv` library will do this by calling `tx.sign(appPrivateKey)`. We recommend starting by implementing `sign()` this way, and then only later optimize it to sign just the inputs required.

You may also prompt the user if they would like to sign for particular updates to jigs. We'll cover how to make sense of the actions in the next Chapter. You may also want to limit signing to only Run transactions. See the previous Chapter for that.

When you're ready to test, paste this code into your `test.html` file and see if it works:

```
const run = new Run({ wallet: new MyWallet(), network: 'main' })

class Store extends Jig {
    set (value) { this.value = value }
}

const store = new Store()

store.set(1)

await store.sync()
```

If this method succeeds, congratulations! Your wallet is not signing jig transactions.

## Testing your owner

Like the `Purse API`, run provides a small set of sets in the `tests` directory for the owner. Go ahead and open `owner-tests.js` and examine its contents. Then, add the following line to your `test.html`:

    await ownerTests(run)
    
Make sure all tests pass before moving on.

## Where to go from here?

Way to go! At this point, you are basically done. We'll cover a few more topics in [Chapter 4: Advanced Considerations](04-advanced.md), but you're wallet adapter is working and that's what matters!

For curious minds, here are a few additional things to do:

* Test your wallet generates unique owners for each app
* Document your wallet adapter's security model and threats
* Read about Locks in the Run documentation
* Look at the owner implementation in the demo project
