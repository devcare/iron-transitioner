debug = false;
debugAndStop = false;

// XXX: I'm sure there's a better way to link together components
// in shark.
//
// the key thing I need really is just to be able to know when the
// transitionedYield is rendered. 
Template.__transitionedYield__.rendered = function() {
  var transitionedYield = this.__component__.get('transitionedYieldComponent');
  if (this.firstNode)
    transitionedYield.setPanesTemplate(this);
}

TransitionedYield = UI.Component.extend({
  init: function() {
    var data = this.get();
    this.region = data && data.region || 'main';
    
    // we use these to render
    this.pageManager = data && data.pageManager;
    this.dependency = new Deps.Dependency;
  
    // this gets set by the rendered function above
    this.panesTemplate = null;
    this.leftIsNext = null;
    
    this._transitioning = false;
    this._queued = false;
    
    var layout = this.transitionedLayout;
    this.data = function () {
      return layout.getData();
    };
  },
  
  //****************** External API ********************//
  render: function() {
    var self = this;
    
    return Template.__transitionedYield__.extend({transitionedYieldComponent: self})
  },
  
  transition: function(classes) {
    debug && console.log('transitioning as ' + classes);
    this.nextTransitionClasses = classes;
    
    // ok, we have a transition type, so we re-run the rendering computation 
    this.dependency.changed();
  },
  
  stopTransition: function() {
    this.endTransition()
  },
  
  //****************** External API ********************//
  setPanesTemplate: function(template) {
    var self = this;
    
    if (self.panesTemplate)
      return;
    self.panesTemplate = template;
    
    self.getPanes();
  
    // now we have the panes, lets we can start drawing to them
    self.startComputation();
  },
  
  // set up the autorun that will re-run every time we need to redraw
  startComputation: function() {
    var self = this;
    
    Deps.autorun(function() {
      debug && console.log('in computation');
      
      self.dependency.depend();
      
      // if currentPage is false, this must be the first time
      if (! self.currentPage) {
        self.renderToCurrentPage(self.leftPane);
        self.leftIsNext = false;
      } else if (self._transitioning) {
        self.queueTransition();
      } else {
        self.startTransition();
      }
    });
  },
  
  // wait for the current transition to end, then transition in the next page
  queueTransition: function() {
    var self = this;
    if (! self._transitioning)
      throw  new Meteor.Error("You must be transitioning to queue a new transition");
    debug && console.log('queueing transition');
    
    // if we were transitioning from A -> B, then C was queued, and now we want
    // to queue D before C has even had a chance to appear, then that's OK.
    // When A -> B finishes, we are just going to go ahead and go B -> D. 
    // C missed it's window. Sorry C.
    if (self._queued)
      return;
    
    // first, stop the next page from rendering itself, otherwise we'll get an
    // instant transition, which isn't really very nice.
    self.stopPaneRendering(self.nextPage);
    self._queued = true;
  },
  
  startTransition: function() {
    var self = this;
    if (self._transitioning)
      throw new Meteor.Error("You can't transition when you've already started!");
    debug && console.log('starting transition');
    
    // first up, we need to make sure the old pane pauses, otherwise the new 
    // page will appear
    self.stopPaneRendering(self.currentPage);
    
    self.renderToNextPage(self.leftIsNext ? self.leftPane : self.rightPane);
    self.leftIsNext = ! self.leftIsNext;
    
    debug && console.log('transitioning with', self.nextTransitionClasses)
    $(self.container).addClass(self.nextTransitionClasses);
    self.lastTransitionClasses = self.nextTransitionClasses;
    
    self._transitioning = true;
    
    self.container.offsetWidth; // force a redraw
    if (debugAndStop) debugger;
    
    // XXX: build in a timeout
    $(self.container).addClass('transitioning')
      .on(self._transitionEvents, function(e) {
        if (! $(e.target).is(self.container))
          return;
        
        if (debugAndStop) debugger;
        self.endTransition();
      });
  },
  
  endTransition: function() {
    var self = this;
    if (! self._transitioning)
      throw new Meteor.Error("You must be transitioning to stop the transition");
    debug && console.log('transitionEnd', self.currentPage, self.nextPage);
    
    // switch classes around
    if (self.currentPage) {
      $(self.currentPage).removeClass('current-page');
      
      self.clearPane(self.currentPage);
    }
    self.makeCurrentPage(self.nextPage);
    
    // finish.
    $(self.container).removeClass('transitioning ' + self.lastTransitionClasses)
      .off(self._transitionEvents);
    
    self._transitioning = false;
    
    // we had a transition queued up, so let's do it now..
    if (self._queued) {
      // console.log(self.container.opacity); // force a redraw
      self._queued = false;
      self.startTransition();
    }
  },
  
  // ******* The stuff that actually deals with the panes ********* //
  getPanes: function() {
    this.container = this.panesTemplate.find('.transitioner-panes');
    this.leftPane = this.panesTemplate.find('.left-pane');
    this.rightPane = this.panesTemplate.find('.right-pane');
    
    // if we do this later on
    this.currentPage = this.panesTemplate.find('.current-page');
    this.nextPage = this.panesTemplate.find('.next-page');
  },
  
  // Don't need to do anything here any more. For some reason it
  // seems to just work automatically. Not totally sure why.
  stopPaneRendering: function(pane) {
    debug && console.log('finalizing pane', pane);
    
    // this triggers Blaze to think the template inside the pane 
    // was removed from the dom and thus kills reactivity in it
    // See https://github.com/meteor/meteor/issues/2031
    var newPane = $(pane.outerHTML).get(0);
    $(pane).replaceWith(newPane);
    
    // we need to re-connect pointers to the varous panes
    this.getPanes();
  },
  
  clearPane: function(pane) {
    debug && console.log('clearing pane', pane)
    $(pane).empty();
  },
  
  renderToPane: function(pane) {
    debug && console.log('rendering to pane', pane)
    var self = this;
    
    // XXX: THIS BIT IS STOLEN FROM blaze-layout
    var region = self.region;
    
    // XXX: *this bit isn't*
    var lookupTemplate = function(name) {
      return Template[name];
    }
    
    var component = UI.block(function () {
      // returning a function tells UI.materialize to
      // create a computation. then, if the region template
      // changes, this comp will be rerun and the new template
      // will get put on the screen.
      return function() {
        // create a reactive dep
        var tmpl = self.transitionedLayout._regions.get(region);
        // console.log('get regions', region, tmpl)
      
        // don't call lookup if tmpl is undefined
        if (tmpl) {
          return lookupTemplate.call(self, tmpl);
        }
        
      }
    });
    
    // probably store this dom somewhere for stop pane rendering above
    
    var dom = UI.render(component, self).dom;
    
    UI.DomRange.insert(dom, pane)
  },  
  
  makeCurrentPage: function(pane) {
    this.currentPage = pane;
    $(pane).removeClass('next-page').addClass('current-page');
  },
  
  makeNextPage: function(pane) {
    this.nextPage = pane;
    $(pane).removeClass('current-page').addClass('next-page');
  },
  
  renderToCurrentPage: function(pane) {
    this.renderToPane(pane);
    this.makeCurrentPage(pane);
  },
  
  renderToNextPage: function(pane) {
    this.renderToPane(pane);
    this.makeNextPage(pane);
  },
  
  _transitionEvents: 'webkitTransitionEnd.transitioner oTransitionEnd.transitioner transitionEnd.transitioner msTransitionEnd.transitioner transitionend.transitioner'
});

