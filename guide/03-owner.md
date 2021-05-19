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
        async nextOwner(): string|Lock
        async sign(rawtx: string, parents: Array<?{satoshis, script}>, locks: Array<?Lock>)
    }

This is what we'll implement. Our wallet will implement both the `Purse` and the `Owner` APIs at the same time. Users may pass your wallet as both the `owner` and the `purse`, or they may pass it as a `wallet` which is shorthand for both.

    const run = new Run({ owner: myWallet, purse: myWallet })

    // or equivalently

    const run = new Run({ wallet: myWallet })

To get started, paste the following placeholder code into your `MyWallet` class in `my-wallet.js`:

    nextOwner() {
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<< 
    }

    sign(rawtx, parents, locks) {
        const tx = new bsv.Transaction(rawtx)

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<< 

        return tx.toString('hex')
    }

## The nextOwner() method

First, we'll implement the `nextOwner()` method. Your goal is to **provide an address that is fixed and unique for each app**. Run will use this address to assign new jigs. Let's break it down:

> *provide an address*

Why an address? Because the app and Run should not see the wallet's private keys! Key management is a wallet's expertise. Run only needs a way to assign owners to new jigs. Although it's possible and sometimes useful for the `nextOwner()` method to return a public key or a `Lock` instead of an address, these are advanced topics covered for [Chapter 4](04-advanced.md).

> *that is fixed*

The address returned should always be the same for a given app. This allows the app to persist its data to bitcoin because the same jigs will be there next time. However, it's worth dwelling on privacy. Jigs are non-fungible by design. This means unlike Bitcoin, whose outputs can be combined and split at will, jigs have inherently less privacy. By starting with a single address each app is simpler, faster, and doesn't present the app with an illusion of privacy that doesn't exist. [Chapter 4](04-advanced.md) discusses this more.

> *and unique for each app*

The owner address should be different for every app. It's important for apps to have their own space to operate in. When an app calls `run.sync()`, Run loads every jig assigned to the `nextOwner()` address. If the owner address were shared between apps, then not only will slow down each app but it creates risks that apps will change each other's data. We don't want that!

### Deriving the private key

The first step to providing an address is to generate a private key! In the wallet, we'll derive a private key and send its address to the wallet adapter. This key needs to be unique for each app, so your wallet needs a way to distinguish between apps.

Perhaps your wallet already handles app authentication with a Login API. If so, then chances are that you already have a unique string for each app. If not, then apps should provide to you a unique identifier when they create your adapter. This app identifier should be used to derive a unique private key from the wallet's master key.

There are many possible approaches. Here is one:

```
function deriveApplicationKey(masterKey, appIdentifier) {
    // Start at a unique key for all application jigs
    const baseKey = masterKey.derive('m/123/456')
    let appKey = baseKey

    for (let i = 0; i < appIdentifier.length; i++) {
        appKey = appKey.derive(appIdentifier.charCodeAt(i))
    }

    return appKey
}
```

`nextOwner()` is async, so you may use it to establish a connection to your wallet. You may also wish to cache the owner address for future `nextOwner()` calls.

Now you're set. Go ahead and implement the `nextOwner()` method and come back when you're ready to test it.

### Testing nextOwner()

Let's give it a shot. Paste this code into `test.html`:

```
const run = new Run({ wallet: new MyWallet(), network: 'main' })

class Dragon extends Jig { }

const dragon = new Dragon()

await run.sync()

console.log('dragon.owner:', dragon.owner)
```

Run calls your `nextOwner()` method during `new Dragon()`. The value you return will be assigned as `dragon.owner.` If you're wondering, the reason we can test `nextOwner()` before `sign()` is implemented is because new jigs don't require signatures.

Open `test.html` in your browser and then check the web console. If you see `dragon.owner` set to your app's address, congratulations! You've just completed the most difficult part. Let's finish the `Owner API` by implementing the `sign()` method.

## The sign() method

When a jig is updated, Run builds a transaction that spends its UTXO. These inputs need to be signed, so Run then calls the `sign()` method. You'll want to sign the transaction similar to the `pay()` method in the purse. You'll send the transaction to the wallet, the wallet will sign it, and the transaction will be returned back to your adapter and then to Run.

For a first implementation, simply sign all inputs you are able to. The `bsv` library can do this by calling `tx.sign(appPrivateKey)`. You may want to offer the option of prompting the user for each action. This minimizes the ability for an app to take actions on the user's behalf. We'll cover how to make sense of Run transactions in Chapter 4. You may also want to limit signing to only Run transactions as covered in Chapter 2.

When you're ready, paste this code into `test.html`:

```
const run = new Run({ wallet: new MyWallet(), network: 'main' })

class Sword extends Jig {
    upgrade() { this.upgraded = true }
}

const sword = new Sword()

sword.upgrade()

await run.sync()
```

If this method succeeds, congratulations! Your wallet is now signing jig transactions.

## Testing your owner

Similar to the purse, run provides a small set of *owner* tests in the `tests` directory. Open `owner-tests.js` and examine its contents. Then, add the following line to your `test.html`:

    await ownerTests(run)
    
Make sure all tests pass before moving on.

## Where to go from here?

Nice work! You're almost done. We'll cover a few more topics in [Chapter 4: Advanced Considerations](04-advanced.md), but app developers can already start trying your new adapter.

Here are some additional things to try:

* Ensure your wallet generates unique owners for each app with tests
* Document your wallet adapter's security model and threats
* Read about Locks in the Run documentation
* Look at the owner implementation in the demo project
