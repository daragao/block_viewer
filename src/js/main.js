import BlockViz from './blockviz.js'
import Store from './store.js'
import Client from './node.js'

BlockViz.initDOM()

const clientWSURL = ['ws://localhost:8645'];
Client.initClientListener(clientWSURL, Store.newBlock, console.error)
