Template.TransitionedLayout = TransitionedLayout;

// Monkey patch.
//
// Perhaps I should inherit, but @cmather didn't exactly make that easy

if (Package['iron-router']) {
  Package['iron-router'].Router._ui.render = function (props, parentComponent) {
    this._component = UI.render(TransitionedLayout.extend(props || {}), parentComponent || UI.body);
    if (this._transitionType)
      this._component.setTransitionType(this._transitionType);
    return this._component;
  };

  Package['iron-router'].Router.setTransitionType = function(fn) {
    if (this._component)
      this._ui._component.setTransitionType(fn);
    else
      this._ui._transitionType = fn;
  }  
}



// XXX: stolen from blaze-layout. 
//
// this is a temporary hack even there so we may as well copy it
// for now I guess
var findComponentOfKind = function (kind, comp) {
  while (comp) {
    if (comp.kind === kind)
      return comp;
    comp = comp.parent;
  }
  return null;
};

// Override {{> transtionedYield}} to find the closest enclosing layout
var origLookup = UI.Component.lookup;
UI.Component.lookup = function (id, opts) {
  if (id === 'transitionedYield') {
    var layout = findComponentOfKind('Layout', this);
    if (!layout)
      throw new Error("Couldn't find a Layout component in the rendered component tree");
    else {
      return layout[id];
    }
  } else {
    return origLookup.apply(this, arguments);
  }
};
