Template.TransitionedLayout = TransitionedLayout;

// Monkey patch.
//
// Perhaps I should inherit, but @cmather didn't exactly make that easy

Package['iron-router'].Router._ui.render = function (props, parentComponent) {
  this._component = UI.render(TransitionedLayout.extend(props || {}), parentComponent || UI.body);
  return this._component;
};