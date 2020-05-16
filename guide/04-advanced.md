# Chapter 4. Advanced Considerations

## Broadcast notifications

Many wallets need to be notified when a transaction is broadcast to update their UTXOs. Some wallets will even want to broadcast to Bitcoin nodes themselves. The `Purse API` has an optional `broadcast()` method for this purse. Run will call the `broadcast()` method after the transaction is fully signed and before Run broadcasts the transaction itself. If you choose to broadcast the transaction yourself, be prepared for the case where a node has already received this transaction. This might happen due to timing.

Similarly, Run supports exporting a transaction to be imported by another instance of Run, rather than broadcasting it immediately. This is useful when two or more owners need to co-sign a transaction, such as an atomic swap. This means that `pay()` is not a reliable way of determining whether a UTXOs have been spent. You should wait until `broadcast()` is called.

## Supporting backed jigs

Backed jigs are jigs whose UTXOs have non-dust satoshi amounts in them. In order for your Purse to support paying for transactions, there are two cases to consider:

1. Adding satoshis to a jig UTXO
2. Receiving change from a jig UTXO

When the user increases the satoshis value of a jig, the purse is expected to pay for this in the transaction. However, the satoshis value of a jig may also be decreased, and the change is expected to be returned back to the purse. You can access the amount of satoshis spent in a transaction using the `spent` property. Once you've implemented both cases, you can test your purse using:

    await purseTests(run, { supportsBackedJigs: true })

## Custom locking scripts

In [Chapter 3](03-owner.md), we wrote that the `owner()` method should return an address. This isn't strictly true. It's true that most wallets will choose to return a Bitcoin address, but this method supports returning any owner that is supported by Run, including public keys and `Locks`, which are custom locking scripts. Similarly, the `sign()` method is passed a list of parents, one for each input. Each jig parent will contain a `lock` that may be used to detect and sign custom locking scripts. If your wallet would like to implement this, the best place to start is by reading the `Locks` section of the Run documentation and *Example 8: Locks* in the SDK.

## Increasing privacy

While jigs are inherently non-fungible, sometimes it's important to hide the fact that a single user owns two different jigs. For example, perhaps it would be advantageous not to make obvious that you own a rare weapon in a game to your opponents. We consider this enhanced privacy, because it is unlikely to be the default privacy model, but if you would like to support this, you can return an array of owners from `owner()`. Run will use the first one in the list to assign to new resources. Your `sign()` method should be able to sign any owner previously returned.

## Parsing Run actions

The `OP_RETURN` output in a Run transaction contains a list of actions. Wallets may only want to sign for certain actions, or they may wish to alert the user that actions were taken on their behalf. Currently, the only way to access this list is to import the transaction into Run. However, in the future, Run will offer more robust methods to access this list. Stay tuned.

```
run.transaction.import(tx)

// Inspect run.transaction.actions

run.transaction.rollback()
```

## Parallelization

Wallet adapters should be as stateless as possible because Run is likely to parallelize its broadcast queue in the future.

## Where to go from here?

* Announce your wallet in the `run` channel on [Atlantis](https://atlantis.planaria.network/)
* Reach out to apps for integration
* Publish your source code on GitHub
* Prepare your wallet for a wave of new apps
