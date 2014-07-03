// See https://github.com/meteor/meteor/issues/2031

finalize = function(node) {;
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
    var comps = UI.DomRange.getComponents(node);
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
    if (mem instanceof UI.DomRange)
      rangeRemoved(mem, viaBackend);
    else
      nodeRemoved(mem, viaBackend);
  }
};