# Chapter 1. Background Knowledge

The goal of this guide is to build a basic wallet adapter for Run. Your new wallet adapter will connect to your wallet, and it will allow third-party apps to use your wallet in combination with Run, not only to make payments, but more importantly to store and use jigs.

A common request from app developers is that they would like their users to be able to login to their app using a wallet, similar to Login with Google or Facebook options popular on websites, and then for users to be able to access their data. Apps like Twetch do this today. However, we will see that compared to other OP_RETURN protocols, Run takes a little more work to support. Making these changes will be worth it however.

Wallets are experts at securing keys. App developers, generally, are not. We think private keys should be fully managed by wallets and should never be exposed to the app developer or to Run. We'll build towards that design in this guide.

Before continuing, it would be good to take [Run Tutorial #1](https://run.network/lessons/mockchain-jig-web-console/) to get a general understanding of what Run does. Now, let's get started.

## Tokens in Unspent Outputs

![Token Transaction](assets/token_transaction.png)

Run is a UTXO-based token protocol. All jigs and code that you own are stored in UTXOs. If you control a particular UTXO, you control that token. And if you can spend a jig UTXO, then you can update that jig's data. Similarly, querying your UTXOs is the same as querying your resources.

There's nothing special about a jig UTXO. They are generally dust outputs, and if you looked at one alone, it would look like any other payment. However, its *meaning* within Run is derived from a separate OP_RETURN output that is present in every Run transaction. This strategy is similar to [SLP](https://simpleledger.cash/) and various other colored coin protocols.

Unfortunately, it also means that special care must be taken not to accidentally spend token outputs since they look identical to payment outputs. Run uses separating keys for tokens for this reason. While this makes Run more difficult for wallets to integrate, it is an important safety measure for users.

## The Owner and the Purse

Run requires two sets of keys to use:

* The **owner** is the account that stores the user’s jigs and code. All tokens in Run are represented as UTXOs. 

* The **purse** is the account that pays for a token transaction, most commonly its miner fees. This account is separate from the owner.

When learning Run, users learn they can specify these accounts as private keys:

    new Run({ owner: '<owner key>', purse: '<purse key>' })

But, that's not the full story. Run actually treats these as APIs. It never *needs* to see any keys. An owner is just an implementation of the `Owner API`. A purse is just an implementation of the `Purse API`. You'll find APIs documented in the API Reference section of the Run docs.

By implementing these APIs, a wallet can store the keys securely in an iframe or on a backend, sign there, and talk to Run via a secure channel.

## How Run Builds a Transaction

When you type:

	dragon.setName('Empress')

Run internally builds a *partial transaction* that looks like:

| Inputs | Outputs |
|--------|---------|
| P2PKH<br>Dragon instance<br>546 satoshis<br>**UNSIGNED** | OP_RETURN<br>`dragon.setName('Empress')` |
| | P2PKH<br>Dragon instance<br>546 satoshis |

Miners will not accept this transaction, however, because there are no miner fees. So Run calls the purse’s `pay()` method and passes in this partial transaction. The purse adds the necessary inputs and outputs to make it acceptable to miners, signs the payment inputs, and returns the updated transaction. The transaction returned might look like:

| Inputs | Outputs |
|--------|---------|
| P2PKH<br>Dragon instance<br>546 satoshis<br>**UNSIGNED** | OP_RETURN<br>`dragon.setName('Empress')` |
| P2PKH<br>Payment<br>10000 satoshis<br>**SIGNED** | P2PKH<br>Dragon instance<br>546 satoshis |
| | P2PKH<br>Change<br>9000 satoshis |

Input #2 and Output #3 were both added by the purse. However, Input #1 is still unsigned. It could not be signed before all transaction inputs and outputs were added. Now, this transaction is sent to the owner’s `sign()` method to sign the jig inputs. The `sign()` method is also passed information that Input #1 is a jig input so that it knows what to sign. It returns a fully signed transaction.

The transaction is now complete and Run will broadcast it.

### Creating New Jigs

There is a second flow to build a transaction when you create new resources. When you type:

    new Dragon()

Run creates two token outputs, one for the Dragon class, and one for the new dragon instance. The partial transaction looks like:

| Inputs | Outputs |
|--------|---------|
| | OP_RETURN<br>`new Dragon()`<br>Dragon code: "class Dragon extends Jig { }" |
| | P2PKH<br>Dragon class<br>546 satoshis |
| | P2PKH<br>Dragon instance<br>546 satoshis |

The output scripts for each new resource should be controlled by the **owner** account. To do this, when building the partial transaction, Run calls the `owner` *getter* on the **owner** object. Usually, the `owner` *getter* will return an *address* string that the Owner API is able to sign. This will be covered more in [Chapter 3](03-owner.md).

The value returned from this getter is set as `Dragon.owner` and `dragon.owner`, and then Run uses those owner values to build the output scripts.

## Where to go from here?

Congratulations! This is all you need to know for now. In [Chapter 2](02-purse.md), we will implement the `Purse API` for your wallet to pay for transactions.

For a deeper dive into Run transactions:

* Use Run to create a transaction with multiple jig inputs and outputs
* Use Run to create a backed jig and then inspect the transaction
* Set a jig owner to a `GroupLock` and then inspect the transaction
* Read the *How it Works* section of the Run documentation
