var withTransitionedLayout = function(cb) {
  withRenderedComponent(TransitionedLayout, cb);
}

Tinytest.add('TransitionedLayout - _defaultLayout', function (test) {
  withTransitionedLayout(function(transitionedLayout, screen) {
    transitionedLayout.setRegion('one');
    Deps.flush();
    test.equal($(screen).text().trim(), 'One', 'one not rendered');
  });
});

Tinytest.add('TransitionedLayout - basic transitioning', function (test) {
  withTransitionedLayout(function(transitionedLayout, screen) {
    transitionedLayout.setRegion('one');
    Deps.flush();
    test.equal($(screen).text().trim(), 'One', 'one not rendered');
    
    transitionedLayout.setRegion('two');
    Deps.flush();
    test.matches($(screen).text().trim(), /One\s+Two/, 'two not rendered alongside');
  
    transitionedLayout.endTransitions();
    Deps.flush();
    test.equal($(screen).text().trim(), 'Two', 'one not cleared');
  });
});

Tinytest.add('TransitionedLayout - no changes when data changes', function (test) {
  withTransitionedLayout(function(transitionedLayout, screen) {
    transitionedLayout.setRegion('one');
    Deps.flush();
    test.equal($(screen).text().trim(), 'One', 'one not rendered');
    var oneDiv = screen.children[0].children[0].children[0];
  
    transitionedLayout.setData({foo: 'bar'});
    Deps.flush();
    test.equal($(screen).text().trim(), 'One', 'one not re-rendered');
    var newOneDiv = screen.children[0].children[0].children[0];
  
    test.equal(newOneDiv, oneDiv, 'new oneDiv rendered!');
  });
});

Tinytest.add('TransitionedLayout - non transitioned yield', function (test) {
  withTransitionedLayout(function(transitionedLayout, screen) {
    transitionedLayout.template('standardLayout');
    transitionedLayout.setRegion('one');
  
    transitionedLayout.setRegion('one');
    Deps.flush();
    test.equal($(screen).text().trim(), 'One', 'one not rendered');
  
    transitionedLayout.setRegion('two');
    Deps.flush();
    test.equal($(screen).text().trim(), 'Two', 'one not cleared');
  });
});

// XXX: should this be a test on transitionedYield??
Tinytest.add('TransitionedLayout - correct classes set', function (test) {
  withTransitionedLayout(function(transitionedLayout, screen) {
    transitionedLayout.setRegion('one');
    Deps.flush();
  
    transitionedLayout.setRegion('two');
    Deps.flush();
  
    var classes = screen.children[0].className;
    test.matches(classes, /default/, 'No type class set on div');
    test.matches(classes, /from-one/, 'No from class set on div');
    test.matches(classes, /to-two/, 'No to class set on div');
  });
});


Tinytest.add('TransitionedPageManager - transitionType function', function (test) {
  withTransitionedLayout(function(transitionedLayout, screen) {
    transitionedLayout.setTransitionType(function() {
      return 'special';
    });
  
    transitionedLayout.setRegion('one');
    Deps.flush();
  
    transitionedLayout.setRegion('two');
    Deps.flush();
  
    var classes = screen.children[0].className;
    test.matches(classes, /special/, 'No special class set on div');
  });
});

// 
// // var SubscriptionMock = function() {
// //   this.open = false;
// //   this.subCount = 0;
// //   this.reopenCount = 0;
// // }
// // SubscriptionMock.prototype.subscribe = function() {
// //   var self = this;
// //   
// //   self.subCount += 1;
// //   if (! self.open) {
// //     self.reopenCount += 1;
// //     self.open = true;
// //   }
// //   
// //   if (Deps.active) {
// //     Deps.onInvalidate(function() {
// //       self.subCount -= 1;
// //       console.log("SUB COUNT IS", self.subCount)
// //       if (self.subCount === 0)
// //         Deps.afterFlush(function () {
// //           console.log("SUB COUNT IS STILL", self.subCount)
// //           if (self.subCount === 0)
// //             self.open = false;
// //         });
// //       
// //     });
// //   }
// //   
// //   return {ready: function() { return true; }};
// // }
// // 
// // Tinytest.add('Transitioned Router - subscription preservation', function (test) {
// //   var sub = new SubscriptionMock;
// //   
// //   var router = new ClientRouter({
// //     autoStart: false,
// //     autoRender: false
// //   });
// //   
// //   router.configure({
// //     loadingTemplate: 'loading',
// //     waitOn: function() { return Sub.subscribe(); }
// //   })
// //   router.map(function() {
// //     this.route('one');
// //     this.route('two');
// //   });
// //   
// //   var frag = Spark.render(function() {
// //     return router.render();
// //   });
// //   var div = new OnscreenDiv(frag);
// //   
// //   var pageManager = new TransitionedPageManager;
// //   router._page = pageManager;
// //   
// //   console.log('HERE');
// //   router.go('one')
// //   Deps.flush();
// //   test.equal(sub.reopenCount, 1, 'Sub not opened once');
// //   
// //   router.go('two')
// //   Deps.flush();
// //   test.equal(sub.reopenCount, 1, 'Sub opened more than once');
// //   
// //   router.go('two')
// //   Deps.flush();
// //   test.equal(sub.reopenCount, 1, 'Sub opened more than once');
// // });