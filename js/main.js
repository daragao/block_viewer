// can't use ES6 until I make a build system
//
// helpers
var domain = [0,1000];
//var x = d3.scaleLinear().domain(domain).range([0, 1005]);
//var y = d3.scaleLinear().domain(domain).range([0, 150]);
var boundingRectSize = d3.select("#tree").node().getBoundingClientRect();
var x = d3.scaleLinear().domain(domain).range([0, boundingRectSize.width])
var y = d3.scaleLinear().domain(domain).range([0, boundingRectSize.height])

var initDOM = function() {
    // Append SVG
    d3.select("#tree").append("svg").attr('width',"100%").attr('height',"100%");
    // Append Groups
    d3.select('svg').append('g').attr('class','nodes');
    d3.select('svg').append('g').attr('class','links');
    d3.select('svg').append('g').attr('class','labels');
};

var nodesAttr = function(nodes) {
    return nodes
        .attr('cx', function(d) {return x(d.x);})
        .attr('cy', function(d) {return y(d.y);})
        .attr('r', 4);
};

var linksAttr = function(links) {
    return links
        .attr('x1', function(d) {return x(d.source.x);})
        .attr('y1', function(d) {return y(d.source.y);})
        .attr('x2', function(d) {return x(d.target.x);})
        .attr('y2', function(d) {return y(d.target.y);});
};

// x and y are scaling functions
var svgDraw = function(root, domain, x, y) {
    // transform root data to have positions
    var treeLayout = d3.tree();
    treeLayout.size([domain[1],domain[1]]);
    treeLayout(root);

    // Nodes
    var keyFuncNode = function(d) { return 'node-' + d.data.name; };
    var nodes = d3.select('svg g.nodes').selectAll('circle.node').data(root.descendants(), keyFuncNode);
    nodes.enter()
        .append('circle')
        .classed('node', true)
        .merge(nodes)
        .call(nodesAttr)
        .append('title')
        .text(function(d) {return d.data.name;});
    // nodesAttr(nodes.transition().duration(0));

    // Text
    var labels = d3.select('svg g.labels').selectAll('text.label').data(root.descendants(), keyFuncNode);
    labels.enter()
        .append('text')
        .classed('label', true)
        .merge(labels)
        .attr('x', function(d) { return x(d.x); })
        .attr('y', function(d) { return y(d.y); })
        .text(function(d) { return d.data.name; });


    // Links
    var keyFuncLink = function(d) { return 'link' + d.source.data.name + '-' + d.target.data.name; };
    var links = d3.select('svg g.links').selectAll('line.link').data(root.links(), keyFuncLink);
    links.enter().append('line').classed('link', true).merge(links).call(linksAttr);
    // links.transition().duration(500).call(linksAttr);

    // exit
    labels.exit().remove();
    nodes.exit().remove();
    links.exit().remove();
}

var generateRoot = function(data,depth) {
    // transform data into hierarchy
    var root = d3.hierarchy(data);

    // reduce the size
    var newRootArr = [];
    var highestDepth = root.leaves().reduce(function(prev,v) { return prev > v.depth ? prev : v.depth},Number.MIN_SAFE_INTEGER)
    if(highestDepth > depth) {
      root.eachAfter(function(d) {
        if((highestDepth-depth) === d.depth) {
          newRootArr.push(d.data);
        }
      });
      root = newRootArr.map(function(r) { return d3.hierarchy(newRootArr[0]); });
    } else {
      root = [root]
    }
    return root;
}

var update = function(data,depth) {
    var rootArr = generateRoot(data, depth)
    rootArr.forEach(function(r,i,arr) {
      var maxWidth = boundingRectSize.width / arr.length;
      var minRange = maxWidth * i;
      var maxRange = maxWidth * (i + 1);
      var x = d3.scaleLinear().domain(domain).range([minRange, maxRange])
      svgDraw(rootArr[0],domain,x,y);
    });
};

initDOM();
//update();

// ==========================================================================
// ========================== WEB 3 =========================================
// ==========================================================================
/*
var sigHash = function(header) {
	var encodedHeader = rlp.encode([
		header.parentHash,
		header.sha3Uncles,
		header.miner,
		header.stateRoot,
		header.transactionsRoot,
		header.receiptsRoot,
		header.logsBloom,
		web3.utils.toBN(header.difficulty),
		web3.utils.toBN(header.number),
		header.gasLimit,
		header.gasUsed,
		web3.utils.toBN(header.timestamp),
		header.extraData,
		header.mixHash,
		header.nonce,
	]);
	return web3.utils.sha3(encodedHeader);
};

var getBlockSignerAddress = function(header) {
  var extraVanity = 32
  var extraSeal = 65 // r(32 bytes) + s(32 bytes) + v(1 byte)

  var signature = '0x' + header.extraData.slice(-(extraSeal*2))
  var extraDataUnsigned = header.extraData.slice(0,header.extraData.length-(extraSeal*2))//.padEnd(header.extraData.length,0)

  var blockHeaderNoSignature = Object.assign({},header, {extraData: extraDataUnsigned})
  var blockHashNoSignature = sigHash(blockHeaderNoSignature)

  var unsignedBlockBuffer = Buffer.from(blockHashNoSignature.slice(2),'hex')

  var signerAddressPromise = web3.eth.accounts.recover(blockHashNoSignature, signature, true)
  return signerAddressPromise
}
*/

var rootHash = undefined
var chain = {}
var treeChain = []
var newBlock = function(block) {
  if(!rootHash) rootHash = block.hash
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
      root = treeChain[0];
    }
    //console.log(block)
    update(treeChain[0],20)
  }
}

var clientWSURL = ['ws://localhost:8645'];
clientWSURL.forEach(function(url) {
  var web3 = new Web3(url);
  web3.eth.subscribe('newBlockHeaders').on("data", newBlock).on("error", console.error)
});
