import 'babel-polyfill';
import BlockViz from './blockviz'
import Store from './store'
import Client from './node'

BlockViz.initDOM()

const clientWSURL = [];
for(let i = 0; i < 7; i++) clientWSURL.push('ws://localhost:' + (i + 8645))
// const clientWSURL = ['wss://rinkeby.infura.io/ws']
const clients = Client.initClientListener(clientWSURL, Store.newBlock, console.error)
Client.setDefaultClient(clients[0])
