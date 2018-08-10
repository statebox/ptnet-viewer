function drawNet_(container, states, transitions, marking, width, height) {
  var r = 10;
  var w = 10;
  var h = 10;

  var svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + "px")
    .attr("height", height + "px");

  // define arrow markers for graph links
  svg
    .append("svg:defs")
    .append("svg:marker")
    .attr({
      id: "arrow",
      viewBox: "0 -5 10 10",
      refX: 3,
      markerWidth: 7,
      markerHeight: 7,
      orient: "auto"
    })
    .append("svg:path")
    .attr({
      d: "M0,-5 L10,0 L0,5",
      fill: "black"
    });

  var places = svg.append("g");

  places
    .selectAll("circle")
    .data(states)
    .enter()
    .append("circle")
    .attr({
      r: r,
      fill: "rgba(0,255,255,.2)",
      stroke: "black",
      cx: function(d) {
        return d.x - 0.5;
      },
      cy: function(d) {
        return d.y - 0.5;
      }
    });

  // construct SVG line from arc
  var arcPathToCenter = function(arc) {
    return "M " + arc.x1 + "," + arc.y1 + "L " + arc.x2 + "," + arc.y2;
  };

  // construct SVG line from arc, trying to be smart about the shapes and length of arc
  var arcPath = function(d) {
    var deltaX        = d.x2 - d.x1;
    var deltaY        = d.y2 - d.y1;
    var dist          = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var normX         = deltaX / dist;
    var normY         = deltaY / dist;

    var sourcePadding = d.incoming ? 10 : 14;
    var targetPadding = d.incoming ? 17 : 15;

    var sourceX       = -0.5 + d.x1 + sourcePadding * normX;
    var sourceY       = -0.5 + d.y1 + sourcePadding * normY;
    var targetX       = -0.5 + d.x2 - targetPadding * normX;
    var targetY       = -0.5 + d.y2 - targetPadding * normY;
    return "M" + sourceX + "," + sourceY + "L" + targetX + "," + targetY;
  };

  var Arcs = svg.append("g");

  Arcs.selectAll("path")
    .data(arcs(transitions, states))
    .enter()
    .append("path")
    .style("marker-end", "url(#arrow)")
    .attr({
      d: arcPath,
      stroke: "black",
      strokeWidth: 1
    });

  var transitionG = svg.append("g");

  var tokensG = svg.append("g");

  function redrawTransitions() {
    var transitionSvg = transitionG.selectAll("rect").data(transitions);

    // create or update
    transitionSvg
      .enter()
      .append("rect")
      .attr({
        stroke: "black",
        width: w * 2,
        height: h * 2
      })
      .on("click", function(t) {
        // transition the marking
        // m_1 = m_0 - (pre t) + (post t)
        updateMarking(t.pre, t.post, marking);
        redraw();
      });

    // update new
    transitionSvg.attr({
      fill: function(d) {
        return isEnabled(d.pre, marking) ? "rgba(0,0,255,.3)" : "rgba(0,0,0,.3)";
      },
      cursor: function(d) {
        return isEnabled(d.pre, marking) ? "pointer" : "default";
      },
      x: function(d) {
        return d.x - w - 0.5;
      },
      y: function(d) {
        return d.y - h - 0.5;
      }
    });

    // remove on exit
    transitionSvg.exit().remove();
  }

  function redrawTokens() {
    var tokenSvg = tokensG.selectAll("text").data(tokens(marking));

    tokenSvg.enter().append("text");

    tokenSvg
      .attr({
        visibility: function(d) {
          return d.tokens === 0 ? "hidden" : "visible";
        },
        x: function(d) {
          return _.find(states, "label", d.state).x - 0.5;
        },
        y: function(d) {
          return _.find(states, "label", d.state).y - 0.5;
        },
        dx: -r / 2 + 0.5,
        dy: r / 2 - 0.5
      })
      .text(function(d) {
        return d.tokens;
      });

    tokenSvg.exit().remove();
  }

  function redraw() {
    redrawTokens();
    redrawTransitions();
  }

  redraw();
}


// compute the boundary and then translate states and transitions
function drawNet(container, states, transitions, marking){
  const MAX = Number.MAX_VALUE
  const MIN = Number.MIN_VALUE

  // bounds[min_x, max_x, min_y, max_y)
  var boundary = [MAX, MIN, MAX, MIN]
  function updateBoundary(x, y) {
    boundary[0] = Math.min(boundary[0], x)
    boundary[1] = Math.max(boundary[1], x)
    boundary[2] = Math.min(boundary[2], y)
    boundary[3] = Math.max(boundary[3], y)
  }

  _.forEach(states, function(el){
    updateBoundary(el.x, el.y)
  })
  _.forEach(transitions, function(el){
    updateBoundary(el.x, el.y)
  })

  var width  = Math.abs(boundary[1] - boundary[0])
  var height = Math.abs(boundary[3] - boundary[2])

  // find top left corner vector and subtract it from all points
  var v = { x: boundary[0], y: boundary[2] }

  radiusShift = 20
  function translateData(data, radiusShift){
    _.forEach(data, function(el){
      el.x = el.x - v.x + radiusShift
      el.y = el.y - v.y + radiusShift
    });
    return data
  };

  var translatedStates      = translateData(states, radiusShift)
  var translatedTransitions = translateData(transitions, radiusShift)
  var translatedMarking     = translateData(marking, radiusShift)

  var padding = 40
  var computedHeight = height + padding
  var computedWidth  = width + padding

  drawNet_(container, translatedStates, translatedTransitions, translatedMarking, computedWidth, computedHeight)
}

// make div with unique id to draw the net inside of
function insertNet(states, transitions, marking, scale) {
  const id = 'ptnet-' + Math.floor(Math.random() * 100000000).toString()
  document.write("<div id=\"" + id + "\"></div>")
  scaleModel(transitions, states, scale, scale)
  drawNet("#" + id, states, transitions, marking)
}

// scale the petrinet
function scaleModel(transitions, states, sx, sy) {
  states.concat(transitions).forEach(function(s) {
    s.x *= sx;
    s.y *= sy;
  });
}
