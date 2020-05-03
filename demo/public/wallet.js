

/**
 * The adapter that implements Run's Owner and Purse APIs
 */
class ThirdPartyWallet {
    /**
     * Creates the ThirdPartyWallet
     */
    static async connect() {
        const addresses = await fetch('/addresses').then(r => r.json())

        return new ThirdPartyWallet(addresses.purse, addresses.owner)
    }

    /**
     * Gets the address assigned as the owner of new jigs
     */
    get owner () { return this.ownerAddress }

    /**
     * Adds the necessary inputs and outputs to pay for a transaction
     * 
     * We also sign payment inputs in this method.
     */
    async pay (tx) {
        console.log('paying')

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tx.toJSON()) 
        }

        const json = await fetch('/pay', options).then(r => r.json())

        return new bsv.Transaction(json)
    }

    /**
     * Signs owner inputs
     */
    async sign (tx, locks) {
        console.log('signing')

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tx.toJSON()) 
        }

        const json = await fetch('/unlock', options).then(r => r.json())

        return new bsv.Transaction(json)
    }

    /**
     * Notifies us when the tx we signed is broadcast. Might need to update the wallet utxos.
     */
    async broadcast(tx) {
        console.log('broadcasting')
    }

    // Private constructor. User should call connect() instead.
    constructor(purseAddress, ownerAddress) {
        this.purseAddress = purseAddress
        this.ownerAddress = ownerAddress
    }
}