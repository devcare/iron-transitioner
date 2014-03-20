// XXX: I'm sure there's a better way to link together components
// in shark.
//
// the key thing I need really is just to be able to know when the
// transitionedYield is rendered. 
Template.transitionedYield.rendered = function() {
  var transitionedYield = this.__component__.get('transitionedYield');
  console.log(transitionedYield.get('run'))
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
  },
  
  //****************** External API ********************//
  render: function() {
    var self = this;
    console.log(this.get('run'))
    
    return Template.transitionedYield.extend({transitionedYield: self})
    
    // return UI.With(
    //   // XXX: does this *need* to be a fn?
    //   function () { return {transitionedYield: self}; },
    //   Template.transitionedYield
    // );
  },
  
  transition: function(classes) {
    // console.log('transitioning as ' + classes);
    this.nextTransitionClasses = classes;
    
    // first up, we need to make sure the old pane pauses rendering
    this.stopPaneRendering(this.currentPage);
    
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
      // console.log('in computation');
      
      self.dependency.depend();
      
      // if currentPage is false, this must be the first time
      if (_.isUndefined(self.currentPage)) {
        self.renderToCurrentPage(self.leftPane);
        self.leftIsNext = false;
      } else {
        
        self.startTransition();
      }
    });
  },
  
  startTransition: function() {
    // console.log('starting transition');
    var self = this;
    
    // kill exisiting transition
    self.transitioning && self.endTransition();
    self.transitioning = true;
    
    self.renderToNextPage(self.leftIsNext ? self.leftPane : self.rightPane);
    self.leftIsNext = ! self.leftIsNext;
    
    // console.log(self.nextTransitionClasses)
    $(self.container).addClass(self.nextTransitionClasses);
    self.lastTransitionClasses = self.nextTransitionClasses;
    
    self.container.offsetWidth; // force a redraw
    
    // XXX: build in a timeout
    $(self.container).addClass('transitioning')
      .on(self._transitionEvents, function(e) {
        if (! $(e.target).is(self.container))
          return;
        
        self.endTransition();
      });
  },
  
  endTransition: function() {
    var self = this;
    // console.log('transitionEnd', self.currentPage, self.nextPage);
    
    // switch classes around
    if (self.currentPage) {
      $(self.currentPage).removeClass('current-page');
      
      self.clearPane(self.currentPage);
    }
    self.makeCurrentPage(self.nextPage);
    
    // finish.
    $(self.container).removeClass('transitioning ' + self.lastTransitionClasses)
      .off(self._transitionEvents);
    
    self.transitioning = false;
  },
  
  // ******* The stuff that actually deals with the panes ********* //
  getPanes: function() {
    this.container = this.panesTemplate.find('.transitioner-panes');
    this.leftPane = this.panesTemplate.find('.left-pane');
    this.rightPane = this.panesTemplate.find('.right-pane');
  },
  
  stopPaneRendering: function(pane) {
    // console.log('finalizing pane', pane);
    // pane && Spark.finalize(pane);
    //
    // XXX: SOMETHING LIKE
    // pane[.component].dom.removed()
  },
  
  clearPane: function(pane) {
    // console.log('clearing pane', pane)
    pane.innerHTML = '';
  },
  
  renderToPane: function(pane) {
    // console.log('rendering to pane', pane)
    var self = this;
    
    // XXX: THIS BIT IS STOLEN FROM blaze-layout
    var region = self.region;
    
    // XXX: *this bit isn't*
    var lookupTemplate = function(name) {
      return Template[name];
    }
    
    // returning a function tells UI.materialize to
    // create a computation. then, if the region template
    // changes, this comp will be rerun and the new template
    // will get put on the screen.
    var component = UI.block(function () {
      return function() {
        var regions = Deps.nonreactive(function () {
          return self.get('_regions');
        });
      
        // create a reactive dep
        var tmpl = regions.get(region) || Template.two;
        console.log('get regions', region, tmpl)
      
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

