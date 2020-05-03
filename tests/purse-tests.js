/**
 * purse-tests.js
 * 
 * Tests for the Purse functionality of a wallet.
 * 
 * Usage:
 * 
 *      Copy this function into a browser or node script. Then:
 * 
 *      const wallet = new CustomWallet()
 *      const run = new Run({ wallet })
 *      purseTests(run, false)
 * 
 * The supportsBackedJigs parameter depends on the wallet's implementation. If your wallet
 * will pay for non-dust outputs, pass true. If not, pass false. Either behavior is OK as
 * long as it is intentional.
 */

async function purseTests(run, supportsBackedJigs = true) {
    class Weapon extends Jig {
        upgrade () { this.upgrades = this.upgrades + 1 }
        setMeltValue (satoshis) { this.satoshis = satoshis }
    }

    console.log('Test 01: Pay for a single dust output')
    run.deploy(Weapon)
    await run.sync()

    console.log('Test 02: Pay for multiple dust outputs')
    run.transaction.begin()
    const sword = new Weapon()
    const staff = new Weapon()
    run.transaction.end()
    await run.sync()

    console.log('Test 03: Pay for a single dust input and output')
    sword.upgrade()
    await run.sync()

    console.log('Test 04: Pay for multiple dust inputs and outputs')
    run.transaction.begin()
    sword.upgrade()
    staff.upgrade()
    run.transaction.end()
    await run.sync()

    if (supportsBackedJigs) {
        // Spy on the blockchain to monitor transactions published
        const originalBroadcast = run.blockchain.broadcast
        let lastBroadcastedTx = null
        run.blockchain.broadcast = async tx => {
            lastBroadcastedTx = tx
            await originalBroadcast.call(run.blockchain, tx)
        }

        console.log('Test 05: Pay to back a jig with satoshis')
        sword.setMeltValue(5000)
        await run.sync()

        console.log('Test 06: Receive change from a backed jig')
        sword.setMeltValue(0)
        await run.sync()

        // Check that change is sent back to the wallet by looking at the fee
        if (lastBroadcastedTx.getFee() > 1000) throw new Error('Back jig change not received')
    }

    if (!supportsBackedJigs) {
        console.log('Test 05: Do not back any jigs with satoshis')
        sword.setMeltValue(5000)
        let errored = false
        await run.sync().catch(e => { errored = true })
        if (!errored) throw new Error('Expected error')
    }

    console.log('All tests passed')
}