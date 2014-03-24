// augment the current Layout Component to have a transitionedYield

TransitionedLayout = Layout.extend({
  init: function() {
    var transitionedLayout = this;
    var transitionedYields = {};
    
    // uggh, call "super"
    Layout.init.call(this);
    
    // add a transitionedYield helper that just tracks it
    this.transitionedYield = TransitionedYield.extend({
      init: function() {
        TransitionedYield.init.call(this);
        
        transitionedYields[this.region] = this;
      }
    });
    
    // override the defaultLayout to just be a single TransitionedYield
    this._defaultLayout = this.transitionedYield;
    
    this.setTransitionType = function(fn) {
      this.transitionType = fn;
    }
    
    // now, the meat and potatoes -- hook into setRegion, and transition where necessary
    // XXX: should we just autorun on regions after all?
    var oldSetRegion = this.setRegion;
    var lastRender = {};
    this.setRegion = function (key, template) {
      // XXX: this is due to something weird @cmather is doing in blaze-layout
      var self = transitionedLayout;
      
      if (arguments.length < 2) {
        template = key;
        key = 'main';
      } else if (typeof key === 'undefined') {
        key = 'main';
      }
      
      // XXX: we should get location.href directly from Router._location?
      //  -- I think this would mean that the router would need to pass it in.
      var newRender = {
        template: template, path: location.href
      };
      
      console.log('setTemplate', key, lastRender.template, newRender.template,  lastRender.path, newRender.path)
      self._regions.set(key, newRender.template);
      
      var transitionedYield = transitionedYields[key];
      console.log(transitionedYield)

      // no transition if it's a normal yield, or we haven't yet transitioned
      if (! transitionedYield || ! lastRender.template)
        return lastRender = newRender;
      

      // default is to not transition if the path + template are the same
      var type = EJSON.equals(lastRender, newRender) ? false : 'default';
      // now give the user a chance to pick
      if (self.transitionType)
        type = self.transitionType(lastRender, newRender, type)

      // don't transition if the transitionType is false
      if (! type)
        return lastRender = newRender;;
    
      var classes = type;
      if (_.isString(lastRender.template))
        classes = classes + ' from-' + lastRender.template;
      if (_.isString(newRender.template))
        classes = classes + ' to-' + template;
        
      console.log('starting transition on', transitionedYield)
      transitionedYield.transition(classes);
      
      lastRender = newRender;
    }
    
    this.endTransitions = function() {
      _.each(transitionedYields, function(transitionedYield) {
        transitionedYield.endTransition();
      });
    }
    
  }
});