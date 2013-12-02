Template.one.preserve(['.one']);

Tinytest.add('TransitionedPageManager - basic rendering', function (test) {
  var pageManager = new TransitionedPageManager;
  
  var frag = Spark.render(function() {
    return pageManager.renderLayout();
  });
  var div = new OnscreenDiv(frag);
  
  pageManager.setTemplate('one');
  Deps.flush();
  test.equal(div.text().trim(), 'One', 'one not rendered');
});

Tinytest.add('TransitionedPageManager - basic transitioning', function (test) {
  var pageManager = new TransitionedPageManager;
  
  var frag = Spark.render(function() {
    return pageManager.renderLayout();
  });
  var div = new OnscreenDiv(frag);
  
  pageManager.setTemplate('one');
  Deps.flush();
  test.equal(div.text().trim(), 'One', 'one not rendered');
  
  pageManager.setTemplate('two');
  Deps.flush();
  test.matches(div.text().trim(), /One\s+Two/, 'two not rendered alongside');
  
  pageManager.endTransitions();
  Deps.flush();
  test.equal(div.text().trim(), 'Two', 'one not cleared');
});

Tinytest.add('TransitionedPageManager - no changes when data changes', function (test) {
  var pageManager = new TransitionedPageManager;
  
  var frag = Spark.render(function() {
    return pageManager.renderLayout();
  });
  var div = new OnscreenDiv(frag);
  
  pageManager.setTemplate('one');
  Deps.flush();
  test.equal(div.text().trim(), 'One', 'one not rendered');
  var oneDiv = div.div.children[0].children[0].children[0];
  
  pageManager.setData({foo: 'bar'});
  Deps.flush();
  test.equal(div.text().trim(), 'One', 'one not re-rendered');
  var newOneDiv = div.div.children[0].children[0].children[0];
  
  test.equal(newOneDiv, oneDiv, 'new oneDiv rendered!');
});

Tinytest.add('TransitionedPageManager - non transitioned yield', function (test) {
  var pageManager = new TransitionedPageManager;
  
  pageManager.setLayout('standardLayout');
  var frag = Spark.render(function() {
    return pageManager.renderLayout();
  });
  var div = new OnscreenDiv(frag);
  
  pageManager.setTemplate('one');
  Deps.flush();
  test.equal(div.text().trim(), 'One', 'one not rendered');
  
  pageManager.setTemplate('two');
  Deps.flush();
  test.equal(div.text().trim(), 'Two', 'one not cleared');
});


Tinytest.add('TransitionedPageManager - correct classes set', function (test) {
  var pageManager = new TransitionedPageManager;
  
  var frag = Spark.render(function() {
    return pageManager.renderLayout();
  });
  var div = new OnscreenDiv(frag);
  
  pageManager.setTemplate('one');
  Deps.flush();
  
  pageManager.setTemplate('two');
  Deps.flush();
  
  var classes = div.div.children[0].className;
  test.matches(classes, /default/, 'No type class set on div');
  test.matches(classes, /from-one/, 'No from class set on div');
  test.matches(classes, /to-two/, 'No to class set on div');
});

Tinytest.add('TransitionedPageManager - transitionType function', function (test) {
  var pageManager = new TransitionedPageManager;
  pageManager.transitionType = function() {
    return 'special';
  }
  
  var frag = Spark.render(function() {
    return pageManager.renderLayout();
  });
  var div = new OnscreenDiv(frag);
  
  pageManager.setTemplate('one');
  Deps.flush();
  
  pageManager.setTemplate('two');
  Deps.flush();
  
  var classes = div.div.children[0].className;
  test.matches(classes, /special/, 'No special class set on div');
});

// var SubscriptionMock = function() {
//   this.open = false;
//   this.subCount = 0;
//   this.reopenCount = 0;
// }
// SubscriptionMock.prototype.subscribe = function() {
//   var self = this;
//   
//   self.subCount += 1;
//   if (! self.open) {
//     self.reopenCount += 1;
//     self.open = true;
//   }
//   
//   if (Deps.active) {
//     Deps.onInvalidate(function() {
//       self.subCount -= 1;
//       console.log("SUB COUNT IS", self.subCount)
//       if (self.subCount === 0)
//         Deps.afterFlush(function () {
//           console.log("SUB COUNT IS STILL", self.subCount)
//           if (self.subCount === 0)
//             self.open = false;
//         });
//       
//     });
//   }
//   
//   return {ready: function() { return true; }};
// }
// 
// Tinytest.add('Transitioned Router - subscription preservation', function (test) {
//   var sub = new SubscriptionMock;
//   
//   var router = new ClientRouter({
//     autoStart: false,
//     autoRender: false
//   });
//   
//   router.configure({
//     loadingTemplate: 'loading',
//     waitOn: function() { return Sub.subscribe(); }
//   })
//   router.map(function() {
//     this.route('one');
//     this.route('two');
//   });
//   
//   var frag = Spark.render(function() {
//     return router.render();
//   });
//   var div = new OnscreenDiv(frag);
//   
//   var pageManager = new TransitionedPageManager;
//   router._page = pageManager;
//   
//   console.log('HERE');
//   router.go('one')
//   Deps.flush();
//   test.equal(sub.reopenCount, 1, 'Sub not opened once');
//   
//   router.go('two')
//   Deps.flush();
//   test.equal(sub.reopenCount, 1, 'Sub opened more than once');
//   
//   router.go('two')
//   Deps.flush();
//   test.equal(sub.reopenCount, 1, 'Sub opened more than once');
// });