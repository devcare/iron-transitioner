// See https://github.com/meteor/meteor/issues/2031

var DomRange;
finalize = function(node) {
  // super hacky -- we need to get a reference to a DomRange for
  // the below. Not sure if there's a more reliable way.
  if (! DomRange)
    DomRange = document.body.children[0].$ui.constructor;
    
  // debugger;
  nodeRemoved(node, true);
}

var rangeRemoved = function (range, viaBackend) {
  if (! range.isRemoved) {
    range.isRemoved = true;

    if (range._rangeDict)
      delete range._rangeDict[range._rangeId];

    // XXX clean up events in $_uievents

    // notify component of removal
    if (range.removed)
      range.removed();

    membersRemoved(range, viaBackend);
  }
};

var nodeRemoved = function (node, viaBackend) {
  if (node.nodeType === 1) { // ELEMENT
    var comps = DomRange.getComponents(node);
    for (var i = 0, N = comps.length; i < N; i++)
      rangeRemoved(comps[i], viaBackend);

    // if (! viaBackend)
    //   DomBackend.removeElement(node);
  }
};

var membersRemoved = function (range, viaBackend) {
  var members = range.members;
  for (var k in members) {
    var mem = members[k];
    if (mem instanceof DomRange)
      rangeRemoved(mem, viaBackend);
    else
      nodeRemoved(mem, viaBackend);
  }
};