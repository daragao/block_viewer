import 'babel-polyfill';
import BlockViz from './blockviz'
import Store from './store'
import Client from './node'

BlockViz.initDOM()

const clientWSURL = ['ws://localhost:8645'];
const clients = Client.initClientListener(clientWSURL, Store.newBlock, console.error)
Client.setDefaultClient(clients[0])
