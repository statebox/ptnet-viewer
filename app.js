var states = [
	{label:'a', y:60, x:20},
	{label:'b0', y:30, x:100},
	{label:'b1', y:90, x:100},
	{label:'d0', y:30, x:180},
	{label:'d1', y:90, x:180},
	{label:'c', y:60, x:260}
]

var transitions = [

	{label: 'x', y: 60, x: 60,
		pre: {a: 1},
		post: {
			b0: 1,
			b1: 1
		}
	},

	{label: 'z0', y: 30, x: 140,
		pre: {b0: 1},
		post: {d0: 1}
	},

	{label: 'z1', y: 90, x: 140,
		pre: {b1: 1},
		post: {d1: 1}
	},

	{label: 'y', y: 60, x: 220,
		pre: {
			d0: 1,
			d1: 1
		},
		post: {c: 1}}
];

var marking = {a: 1, d0: 1};

(states.concat(transitions)).forEach(function(s){s.x *= 1.25;})

var svg = d3.select('body')
	.append('svg')
	.attr('width', '500px')
	.attr('height', '250px');

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr({
    	id: 'arrow',
		viewBox: '0 -5 10 10',
		refX: 3,
		markerWidth: 7,
		markerHeight: 7,
		orient: 'auto',
    })
	.append('svg:path')
	.attr({
		d: 'M0,-5 L10,0 L0,5',
		fill: 'black'
	});

svg.selectAll(".state")
	.data(states)
	.enter()
		.append("svg:circle")
		.attr({
			r: 10,
			fill: 'rgba(0,255,255,.2)',
			stroke: 'black',
			cx: function(d) { return d.x - .5},
			cy: function(d) { return d.y - .5}
		});

var w = 10;
var h = 10;

svg.selectAll("g.transition")
	.data(transitions)
	.enter()
		.append("svg:rect")
		.attr({
			fill: 'rgba(0,0,255,.3)',
			stroke: 'black',
			x: function(d) { return d.x - w - .5},
			y: function(d) { return d.y - h - .5},
			width: w * 2,
			height: h * 2
		});

// take a multiset dictionary 'label => multiplicity'
// and return a list of [{x, y, weight}]
function mapLocations(mset) {
	return _.map(mset,
		function(multiplicity, label){
			var s = _.find(states, 'label', label);
			return {
				x: s.x,
				y: s.y,
				weight: multiplicity
			}
		}
	);
} 

var arcs = transitions.reduce(function(arcs, t){

	var incoming = mapLocations(t.pre).map(function(arc){
		return {
			x1: arc.x,
			y1: arc.y,
			x2: t.x,
			y2: t.y,
			incoming: true,
			weight: arc.weight
		}
	});
	
	var outgoing = mapLocations(t.post).map(function(arc){
		return {
			x1: t.x,
			y1: t.y,
			x2: arc.x,
			y2: arc.y,
			incoming: false,
			weight: arc.weight
		}
	});
	
	return arcs.concat(incoming).concat(outgoing);

}, []);

// construct SVG line from arc
var arcD = function(arc) { return 'M ' + arc.x1 + ',' + arc.y1 + 'L ' + arc.x2 + ',' + arc.y2; };


var test = function( d) {
    var deltaX = d.x2 - d.x1,
    deltaY = d.y2 - d.y1,
    dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
    normX = deltaX / dist,
    normY = deltaY / dist,
    sourcePadding = (d.incoming ? 10 : 14),
    targetPadding = (d.incoming ? 17 : 15),
    sourceX = -.5 + d.x1 + (sourcePadding * normX),
    sourceY = -.5 + d.y1 + (sourcePadding * normY),
    targetX = -.5 + d.x2 - (targetPadding * normX),
    targetY = -.5 + d.y2 - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
};

svg.selectAll( "g.arc")
	.data(arcs)
	.enter()
	.append("path")
	.style('marker-end', 'url(#arrow)')
	.attr({
		d: test,
		stroke: 'black',
		strokeWidth: 1
	});
	
var tokens = _.map(marking, function(val, key){
	return {
		state: key,
		tokens: val
	}
})

svg.selectAll( "g.token")
	.data(tokens)
	.enter()
		.append("circle")
		.attr({
			r: 3,
			fill: 'black',
			stroke: 'none',
			cx: function(d) {
				return _.find(states, 'label', d.state).x - .5;
			},
			cy: function(d) {
				return _.find(states, 'label', d.state).y - .5;
			}
		});