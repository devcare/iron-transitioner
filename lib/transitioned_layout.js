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
    
    // now, the meat and potatoes -- hook into setRegion, and transition where necessary
    // XXX: should we just autorun on regions after all?
    var oldSetRegion = this.setRegion;
    this.setRegion = function (key, template) {
      
      // XXX: this is due to something weird @cmather is doing in blaze-layout
      var self = transitionedLayout;
      
      if (arguments.length < 2) {
        template = key;
        key = 'main';
      } else if (typeof key === 'undefined') {
        key = 'main';
      }
      
      var oldTemplate = Deps.nonreactive(function() {
        return self._regions.get(key);
      });
      
      console.log('setTemplate', oldTemplate, template, key)
      self._regions.set(key, template);
      
      var transitionedYield = transitionedYields[key];
      console.log(transitionedYield)

      if (! transitionedYield || oldTemplate === '_defaultMainRegion')
        return;

      var type = 'default';
      if (self.transitionType)
        type = self.transitionType(oldTemplate, template, type)

      // don't transition if the transitionType is false
      if (! type)
        return;
    
      var classes = type;
      if (_.isString(oldTemplate))
        classes = classes + ' from-' + oldTemplate;
      if (_.isString(template))
        classes = classes + ' to-' + template;
        
      console.log('starting transition on', transitionedYield)
      transitionedYield.transition(classes);
    }
    
    this.endTransitions = function() {
      _.each(transitionedYields, function(transitionedYield) {
        transitionedYield.endTransition();
      });
    }
    
  }
});