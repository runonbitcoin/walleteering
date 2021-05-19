

/**
 * The adapter that implements Run's Owner and Purse APIs
 */
class ThirdPartyWallet {
    /**
     * Gets the address assigned as the owner of new jigs
     */
    async nextOwner () {
        return await fetch('/owner').then(r => r.text())
    }

    /**
     * Adds the necessary inputs and outputs to pay for a transaction
     * 
     * We also sign payment inputs in this method.
     */
    async pay (rawtx, parents) {
        console.log('paying')

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx, parents })
        }

        const { rawtx: paid } = await fetch('/pay', options).then(r => r.json())

        return new bsv.Transaction(paid)
    }

    /**
     * Signs owner inputs
     */
    async sign (rawtx, parents, locks) {
        console.log('signing')

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx, parents })
        }

        const { rawtx: signed } = await fetch('/sign', options).then(r => r.json())

        return new bsv.Transaction(signed)
    }

    /**
     * Notifies us when the tx we signed is broadcast. Might need to update the wallet utxos.
     */
    async broadcast(rawtx) {
        console.log('broadcasting')
    }
}