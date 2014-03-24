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

