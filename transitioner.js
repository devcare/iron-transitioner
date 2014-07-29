var TRANSITION_END_KEY = 'transitionend';
var TRANSITION_END_EVENTS = 'webkitTransitionEnd.transitioner oTransitionEnd.transitioner transitionEnd.transitioner msTransitionEnd.transitioner transitionend.transitioner';

Transitioner = function(content, options) {
  options = options || {};
  this.done = options.done || TRANSITION_END_KEY;
  this._doneCbs = [];
  this._doneScheduled = false;
  
  this._content = content;
}

Transitioner.prototype.scheduleRemove = function(n) {
  this.scheduleDone(function() {
    n.parentNode.removeChild(n);
  });
}

Transitioner.prototype.scheduleDone = function(cb) {
  var self = this;
  self._doneCbs.push(cb);
  
  if (self._doneScheduled)
    return;
  
  var onDone = function() {
    _.each(self._doneCbs, function(cb) { cb.call(self); });
    self._doneCbs = [];
    self._doneScheduled = false;
  }
  
  if (_.isNumber(self.done)) {
    Meteor.setTimeout(onDone, self.done);
  
  } else if (self.done === TRANSITION_END_KEY) {
    $(n).one(TRANSITION_END_EVENTS, onDone);
  
  } else if (_.isFunction(self.done)) {
    self.view.autorun(function(c) {
      if (self.done()) {
        onDone();
        c.stop();
      }
    });
  }
  self._doneScheduled = true;
}

Transitioner.prototype.create = function() {
  var self = this;
  
  self.view = Blaze.View('transitioner', function() {
    return self._content;
  });
  
  self.view.onRendered(function() {
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
  
  return self.view;
}

UI.registerHelper('transitioner', Template.__create__('transitioner', function() {
  var args = Iron.DynamicTemplate.args(this);
  return new Transitioner(this.templateContentBlock, {
    done: function() { return args('done'); }
  }).create();
}))
