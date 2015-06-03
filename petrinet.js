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

var marking = {a: 1};

function isEnabled(pre) {
	return _(pre).all(function(multiplicity, place){
		return (marking[place] || 0) >= multiplicity;
	})
}

function updateMarking(remove, add){

	// don't do anything if it's not enabled
	if(!isEnabled(remove))
		return;	
	
	_.each(add, function(multiplicity, place){
		if(!marking[place])
			marking[place] = 0;
		
		marking[place] += multiplicity;
	});
	
	_.each(remove, function(multiplicity, place){
		if(!marking[place])
			marking[place] = 0;
		
		marking[place] -= multiplicity;
	});
	
	redraw();
}

(states.concat(transitions)).forEach(function(s){s.x *= 1.25;})

function arcs(transitions) {

	return transitions.reduce(function(arcs, t){

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
	
}