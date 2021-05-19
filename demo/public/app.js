class Dragon extends Jig {
    setName (name) { this.name = name }
}

let wallet = null
let run = null
let dragon = null

async function setup () {
    wallet = new ThirdPartyWallet()

    // The wallet option is shorthand for passing both owner and purse
    run = new Run({ network: 'test', wallet })

    dragon = new Dragon()

    await dragon.sync()
}

async function setName() {
    const name = document.getElementById('name').value

    dragon.setName(name)

    await dragon.sync()

    const url = `https://test.whatsonchain.com/tx/${dragon.location.slice(0, 64)}`
    const link = `<a href="${url}" target="_blank">Click to view on WhatsOnChain</a>`
    document.getElementById('txid').innerHTML = link
}

setup()