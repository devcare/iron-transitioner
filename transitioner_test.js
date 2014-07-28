String.prototype.compact = function () {
  return this.trim().replace(/\s/g, '').replace(/\n/g, '');
};

var withDiv = function (callback) {
  var el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

var withRenderedTemplate = function (template, callback) {
  withDiv(function (el) {
    template = _.isString(template) ? Template[template] : template;
    var range = Blaze.render(template);
    range.attach(el);
    Deps.flush();
    callback(el);
  });
};


Tinytest.add('Transitioner - changing region transitions', function (test) {
  var layout = new Iron.Layout;
  
  withRenderedTemplate(layout.create(), function (el) {
    layout.template('TransitionedLayout');
    layout.render('One');
    Deps.flush();
    test.equal(el.textContent.compact(), 'One');

    layout.render('Two');
    Deps.flush();
    test.equal(el.textContent.compact(), 'OneTwo');
    
    $(el).find('.one').trigger('transitionend');
    Deps.flush();
    test.equal(el.textContent.compact(), 'Two');
  });
});