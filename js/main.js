// can't use ES6 until I make a build system
var data = {
    "name": "A1",
    "children": [
        {
            "name": "B1",
            "children": [
                {
                    "name": "C1",
                    "value": 100
                },
                {
                    "name": "C2",
                    "value": 300
                },
                {
                    "name": "C3",
                    "value": 200
                }
            ]
        },
        {
            "name": "B2",
            "value": 200
        }
    ]
};

var updateTree = function() {
    var name = '#'+Math.floor(Math.random()*16777215).toString(16);
    var value = Math.ceil(Math.random() * 1000);
    var newEl = { name: name, value: value };
    data.children.push(newEl);
    update();
};

// helpers
var domain = [0,1000];
var x = d3.scaleLinear().domain(domain).range([0, 1005]);
var y = d3.scaleLinear().domain(domain).range([0, 150]);

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

var update = function() {
    // transform data into hierarchy
    var root = d3.hierarchy(data);

    // reduce the size
    //root.descendants().forEach(function(d) { if(d.depth >= 1) d.children = null; });

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
    nodes.exit().remove();
    links.exit().remove();
};

initDOM();
update();
