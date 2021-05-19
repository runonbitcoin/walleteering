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

app.get('/owner', (req, res) => {
    res.send(owner.toAddress().toString())
})

app.post('/pay', async (req, res) => {
    const paid = await run.purse.pay(req.body.rawtx, req.body.parents, [])

    res.send({ rawtx: paid })
})

app.post('/sign', async (req, res) => {
    const signed = await run.owner.sign(req.body.rawtx, req.body.parents, [])

    res.send({ rawtx: signed })

    const tx = new bsv.Transaction(signed)
})

app.listen(8080, () => {
    console.log('Wallet running on 8080')
})