import 'babel-polyfill';
import Client from './node'
import BlockViz from './blockviz'

const chain = {} // map of hash => block
const treeChain = [] // hierarchy used in d3
const newBlock = (block) => {
  if(!chain[block.hash]) {
    const node = { name: block.hash, parent: block.parentHash, children: [], block }
    if(Client.getDefaultClient()) {
      Client.getBlockSignerAddress(Client.getDefaultClient(),block).then((addr) => { node.signer = addr; });
    }
    chain[block.hash] = node
    if(chain[block.parentHash]) {
      if(!chain[block.parentHash].children) chain[block.parentHash].children = []
      chain[block.parentHash].children.push(node)
    }
    if(treeChain.length == 0) {
      treeChain.push(node)
      //root = treeChain[0];
    }
    //console.log(block)
    BlockViz.update(treeChain[0],20)
  }
}

export default { newBlock }
