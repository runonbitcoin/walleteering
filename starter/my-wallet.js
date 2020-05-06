/**
 * my-wallet.js
 */

class MyWallet {
    pay(txhex) {
        const tx = new bsv.Transaction(txhex)

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<

        return tx.toString('hex')
    }
}
