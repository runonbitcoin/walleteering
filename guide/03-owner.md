# Chapter 3. Implementing Owner

You may wonder how a wallet could be expected to manage items as diverse as tickets, social media posts, game items, digital pets, votes, rewards points, and more, each with their own challenges and user interfaces. Here's the good news: you won't have to! Run was built to cleanly separate the responsibilities of the wallet, Run, and apps.

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

This is what we'll implement. Users may either pass your wallet as both the `owner` and the `purse`, or it may pass them as a `wallet` which is shorthand for both.

    const run = new Run({ owner: myWallet, purse: myWallet })

    // or equivalently

    const run = new Run({ wallet: myWallet })

To get started, paste the following into your `MyWallet` class in `my-wallet.js`:

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

First we'll implement, and test, the `owner()` method. The general idea of this method is to return an *address* that is 100% unique for the app. No other app should share this address, and this address should not be used for anything else. The `owner()` method tells Run and the app which *address* should be used to assign as the owner for new jigs. See, when apps call `new Dragon()`, the dragon initially doesn't have an owner. This is assigned by Run, and provided by the `Owner API`.

Each app should have its own unique private key and address. The private key should live securely in the wallet. We don't want to mix jig outputs with payment outputs, and we also don't to mix jigs between different apps. However, unlike payment wallets, in jig wallets it's OK for each app to have a fixed private key and address that doesn't change. Jigs are non-fungible by design and have inherently less privacy than payments.

So all we have to do is return an address, right? Yes! The challenge is how to derive a unique key for each app. If your wallet already handles user authentication for the app by providing a Login API, then chances are high that you already have a unique identifer for each application. Otherwise, apps may provide a unique string that identifies themselves when they create your adapter. Either way, this application identifier string can be used to derive a unique private key from the wallet's master key. Here is one approach:

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

If applications pass an app identifier themselves, you may find it useful to create an `async connect(appId)` method that connects to your wallet and gets the owner address.

```
const wallet = await MyWallet.connect('<my game name>')

console.log(wallet.owner())
```

> **Note**: In the future, `owner()` will be `async`. In 0.5 however it is not. 

Go ahead and implement the `owner()` method now, having it return a unique address for the application. Then, let's give it a test. Paste this code into your test runner:


```
const run = new Run({ wallet: new MyWallet(), network: 'main' })

class Dragon extends Jig { }

const dragon = new Dragon()

await run.sync()

console.log('dragon.owner:', dragon.owner)
```

Creating jigs doesn't require any owner signatures! Open `test.html` in your browser and then check the web console. If you see `dragon.owner` is your address, congratulations! That was the hard part. Let's finish the Owner API by implementing the `sign()` method.

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
