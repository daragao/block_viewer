import BlockViz from './blockviz.js'

const chain = {} // map of hash => block
const treeChain = [] // hierarchy used in d3
const newBlock = (block) => {
  if(!chain[block.hash]) {
    var node = { name: block.hash, parent: block.parentHash, children: [], block }
    //getBlockSignerAddress(block).then(function(addr) { node.signer = addr; });
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
