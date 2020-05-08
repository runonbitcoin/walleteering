# Chapter 4. Advanced Considerations

TODO

- OP_RETURN data - learned purse how to check.
- Only work on mainnet?
- Handling Backed Jigs properly
    await purseTests(run, { supportsBackedJigs: true })
- Broadcast
- Exported transactions
- Handling custom locks (ie. signing, owner)
- Performance and parallel

## Where to go from here?

* Announce your wallet in the `run` channel on [Atlantis](https://atlantis.planaria.network/)
* Reach out to apps for integration
* Publish the source code on GitHub
* Prepare your wallet for a wave of new apps
* Multiple addresses

It's probably OK to share a single address for all jigs in an app, and this is even desirable in cases. Sure, sometimes a user will not want to reveal that they own a particular jig, for example a rare weapon in a game, but these are special cases.