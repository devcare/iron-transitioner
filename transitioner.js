var TRANSITION_END_KEY = 'transitionend';
var TRANSITION_END_EVENTS = 'webkitTransitionEnd.transitioner oTransitionEnd.transitioner transitionEnd.transitioner msTransitionEnd.transitioner transitionend.transitioner';

Transitioner = function(content, options) {
  options = options || {};
  this.done = options.done || TRANSITION_END_KEY;
  console.log(content)
  this._content = content;
}

Transitioner.prototype.scheduleRemove = function(n) {
  var self = this;
  
  var remove = function() {
    n.parentNode.removeChild(n);
  }
  
  if (_.isNumber(self.done)) {
    Meteor.setTimeout(remove, self.done);
  
  } else if (self.done === TRANSITION_END_KEY) {
    $(n).one(TRANSITION_END_EVENTS, remove);
  
  // XXX: should this setup an autorun?
  } else if (_.isFunction(self.done)) {
    self.done(remove);
  }
}

Transitioner.prototype.create = function() {
  var self = this;
  
  var view = Blaze.View('transitioner', function() {
    return self._content;
  });
  
  view.onRendered(function() {
    console.log(this.domrange.parentElement)
    this.domrange.parentElement._uihooks = {
      insertElement: function(n, next) {
        // XXX: add some styles to containing divs
        next.parentNode.insertBefore(n, next);
      },
      removeElement: function(n) {
        self.scheduleRemove(n);
      }
    }
  });
  
  return view;
}

UI.registerHelper('transitioner', Template.__create__('transitioner', function() {
  var options = Iron.DynamicTemplate.getInclusionArguments(this);
  return new Transitioner(this.templateContentBlock, options).create();
}))
