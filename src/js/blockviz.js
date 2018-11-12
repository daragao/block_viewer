// TODO: this whole file needs to be better abstracted from the format expected to come from the store
import * as d3 from 'd3'

// helpers
const domain = [0,1000];
//var x = d3.scaleLinear().domain(domain).range([0, 1005]);
//var y = d3.scaleLinear().domain(domain).range([0, 150]);
const boundingRectSize = d3.select("#tree").node().getBoundingClientRect();
const x = d3.scaleLinear().domain(domain).range([0, boundingRectSize.width])
const y = d3.scaleLinear().domain(domain).range([0, boundingRectSize.height])

const initDOM = () => {
    // Append SVG
    d3.select("#tree").append("svg").attr('width',"100%").attr('height',"100%");
    // Append Groups
    d3.select('svg').append('g').attr('class','nodes');
    d3.select('svg').append('g').attr('class','links');
    d3.select('svg').append('g').attr('class','labels');
};

const nodesAttr = (nodes) => nodes.attr('cx', d => x(d.x)).attr('cy', d => y(d.y)).attr('r', 4)

const linksAttr = (links) => links
        .attr('x1', d => x(d.source.x)).attr('y1', d => y(d.source.y))
        .attr('x2', d => x(d.target.x)).attr('y2', d => y(d.target.y))

// x and y are scaling functions
const svgDraw = (root, domain, x, y) => {
    // transform root data to have positions
    const treeLayout = d3.tree();
    treeLayout.size([domain[1],domain[1]]);
    treeLayout(root);

    // Nodes
    const keyFuncNode = d => 'node-' + d.data.name
    const nodes = d3.select('svg g.nodes').selectAll('circle.node').data(root.descendants(), keyFuncNode);
    nodes.enter()
        .append('circle')
        .classed('node', true)
        .merge(nodes)
        .call(nodesAttr)
        .append('title')
        .text(d => d.data.name)
    // nodesAttr(nodes.transition().duration(0));

    // Text
    const labels = d3.select('svg g.labels').selectAll('text.label').data(root.descendants(), keyFuncNode);
    labels.enter().append('text').classed('label', true).merge(labels)
        .attr('x', d => x(d.x)).attr('y', d => y(d.y))
        .text(d => d.data.name + ' - ' + d.data.signer)


    // Links
    const keyFuncLink = d => 'link' + d.source.data.name + '-' + d.target.data.name
    const links = d3.select('svg g.links').selectAll('line.link').data(root.links(), keyFuncLink);
    links.enter().append('line').classed('link', true).merge(links).call(linksAttr);
    // links.transition().duration(500).call(linksAttr);

    // exit
    labels.exit().remove();
    nodes.exit().remove();
    links.exit().remove();
}

const generateRoot = (data,depth) => {
    // transform data into hierarchy
    const root = d3.hierarchy(data);

    // reduce the size
    const newRootArr = [];
    const highestDepth = root.leaves().reduce((prev,v) => prev > v.depth ? prev : v.depth,Number.MIN_SAFE_INTEGER)
    if(highestDepth > depth) {
      root.eachAfter(d => {
        if((highestDepth-depth) === d.depth) newRootArr.push(d.data)
      })
      return newRootArr.map(r => d3.hierarchy(newRootArr[0]))
    } else {
      return [root]
    }
}

const update = (data,depth) => {
    const rootArr = generateRoot(data, depth)
    rootArr.forEach((r,i,arr) => {
      const maxWidth = boundingRectSize.width / arr.length;
      const minRange = maxWidth * i;
      const maxRange = maxWidth * (i + 1);
      const x = d3.scaleLinear().domain(domain).range([minRange, maxRange])
      svgDraw(rootArr[0],domain,x,y);
    });
};

export default { initDOM, update }
