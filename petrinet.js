function isEnabled (pre, marking) {
  return _(pre).all(function (multiplicity, place) {
    return (marking[place] || 0) >= multiplicity
  })
}

function updateMarking (remove, add) {
  // don't do anything if it's not enabled
  if (!isEnabled(remove)) {
		return
	}

  _.each(add, function (multiplicity, place) {
    if (!marking[place]) {
      marking[place] = 0
    }

    marking[place] += multiplicity
  })

  _.each(remove, function (multiplicity, place) {
    if (!marking[place]) {
      marking[place] = 0
    }

    marking[place] -= multiplicity
  })

  redraw()
}

  // take a multiset dictionary 'label => multiplicity'
  // and return a list of [{x, y, weight}]
  function mapLocations (mset, states) {
    return _.map(mset,
      function (multiplicity, label) {
        var s = _.find(states, 'label', label)
        return {
          x: s.x,
          y: s.y,
          weight: multiplicity
        }
      }
    )
  }

function tokens(marking) {
  return _.map(marking, function(val, key) {
    return {
      state: key,
      tokens: val
    };
  });
}

function arcs (transitions, states) {
  return transitions.reduce(function (arcs, t) {
    var incoming = mapLocations(t.pre, states).map(function (arc) {
      return {
        x1: arc.x,
        y1: arc.y,
        x2: t.x,
        y2: t.y,
        incoming: true,
        weight: arc.weight
      }
    })

    var outgoing = mapLocations(t.post, states).map(function (arc) {
      return {
        x1: t.x,
        y1: t.y,
        x2: arc.x,
        y2: arc.y,
        incoming: false,
        weight: arc.weight
      }
    })

    return arcs.concat(incoming).concat(outgoing)
  }, [])
}
