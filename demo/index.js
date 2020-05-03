const express = require('express')
const bsv = require('bsv')
const Run = require('./public/lib/run.node.min')

const owner = new bsv.PrivateKey('testnet')
const purse = 'cT7uSf2Q4nFDWoqQtSBaKHnQsuWVdcvxZMiuCs3nkwYh94xctaFg'
const network = 'test'
const run = new Run({ owner, purse, network })

const app = express()

app.use(express.static('public'))
app.use(express.json())

// A real wallet would have more secure endpoints than this :)

app.get('/addresses', (req, res) => {
    res.send({
        owner: run.owner.bsvPrivateKey.toAddress().toString(),
        purse: run.purse.bsvPrivateKey.toAddress().toString(),
    })
})

app.post('/pay', async (req, res) => {
    const tx = new bsv.Transaction(req.body)
    const paid = await run.purse.pay(tx)
    res.send(paid.toJSON())
})

app.post('/unlock', async (req, res) => {
    const tx = new bsv.Transaction(req.body)
    tx.sign(run.owner.bsvPrivateKey)
    res.send(tx.toJSON())
})

app.listen(8080, () => {
    console.log('Wallet running on 8080')
})