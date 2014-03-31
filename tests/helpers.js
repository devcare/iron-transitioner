// stolen and vaguely converted from blaze-layout

renderComponent = function (cmp, parentInst, where) {
  var inst = UI.render(cmp, parentInst);
  UI.DomRange.insert(inst.dom, where);
  return inst;
};

withRenderedComponent = function (cmp, parentInst, cb) {
  if (arguments.length < 3) {
    cb = parentInst;
    parentInst = null;
  }

  var screen = document.createElement('div');
  document.body.appendChild(screen);
  var inst = renderComponent(cmp, parentInst, screen);

  try {
    cb(inst, screen);
  } finally {
    document.body.removeChild(screen);
  }
};