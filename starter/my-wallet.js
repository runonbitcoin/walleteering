/**
 * my-wallet.js
 */

class MyWallet {
    pay(rawtx, parents) {
        const tx = new bsv.Transaction(rawtx)

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // TODO: Implement this section
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<

        return tx.toString('hex')
    }
}
