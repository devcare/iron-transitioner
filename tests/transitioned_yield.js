// XXX: Stolen from blaze-layout, converted

var renderComponent = function (cmp, parentInst, where) {
  var inst = UI.render(cmp, parentInst);
  UI.DomRange.insert(inst.dom, where);
  return inst;
};

var withRenderedComponent = function (cmp, parentInst, cb) {
  if (arguments.length < 3) {
    cb = parentCmp;
    parentCmp = null;
  }

  var screen = new OnscreenDiv;
  var inst = renderComponent(cmp, parentInst, screen.node());

  try {
    cb(inst, screen);
  } finally {
    screen.kill();
  }
};


// *****************************************************

// // XXX: could I just use a real layout?
// var LayoutMock = UI.Component.extend({
//   init: function() {
//     this.dependency = new Deps.Dependency;
//     this.template = null;
//     this.data = null;
//     
//     this.regions = this._regions = new ReactiveDict;
//   },
//   
//   setRegion: function(key, name) {
//     
//   }
// });
//   
//   
// PageManagerMock.prototype = {
//   _renderTemplate: function() {
//     this.dependency.depend();
//     return Template[this.template](this.data);
//   },
//   
//   setTemplate: function(template) {
//     this.template = template;
//     this.dependency.changed();
//   },
//   
//   setData: function(data) {
//     this.data = data;
//     this.dependency.changed();
//   }
// }

Tinytest.add('TransitionedYield - basic rendering', function (test) {
  // instantiate a layout but don't actually render it to the screen.
  var layout = Layout.instantiate();
  
  var cmp = TransitionedYield.extend({region: 'main'});
  withRenderedComponent(cmp, layout, function (inst, screen) {
    console.log(screen.html());
    
    layout.setRegion('one');
    Deps.flush();
    console.log(screen.html());
    test.equal(screen.text().trim(), 'One', 'one not rendered');
      
    layout.setRegion('two');
    Deps.flush();
    console.log(screen.html());
    test.equal(screen.text().trim(), 'Two', 'two not rendered');
  });
});
// 
// Tinytest.add('TransitionedYield - basic transitioning', function (test) {
//   var pageManager = new PageManagerMock()
//   var transitionedYield = new TransitionedYield(pageManager, '__main__');
//   
//   var frag = Spark.render(function() {
//     return transitionedYield.render();
//   });
//   var div = new OnscreenDiv(frag);
//   
//   pageManager.setTemplate('one');
//   Deps.flush();
//   test.equal(div.text().trim(), 'One', 'one not rendered');
//   
//   transitionedYield.transition('two', 'normal');
//   pageManager.setTemplate('two');
//   Deps.flush();
//   test.matches(div.text().trim(), /One\s+Two/, 'two not rendered alongside');
//   
//   transitionedYield.stopTransition();
//   test.equal(div.text().trim(), 'Two', 'one not cleared');
//   
//   pageManager.setTemplate('one');
//   Deps.flush();
//   test.equal(div.text().trim(), 'One', 'one not rendered');
// });
// 
// Tinytest.add('TransitionedYield - reactivity', function (test) {
//   var pageManager = new PageManagerMock()
//   var transitionedYield = new TransitionedYield(pageManager, '__main__');
//   
//   var frag = Spark.render(function() {
//     return transitionedYield.render();
//   });
//   var div = new OnscreenDiv(frag);
//   
//   pageManager.setTemplate('oneData');
//   pageManager.setData({property: 'first'});
//   Deps.flush();
//   test.equal(div.text().trim(), '1-first', 'one not rendered with data');
//   
//   transitionedYield.transition('twoData', 'normal');
//   pageManager.setTemplate('twoData');
//   pageManager.setData({property: 'second'});
//   Deps.flush();
//   test.matches(div.text().trim(), /1-first\s+2-second/, 'two not rendered alongside');
//   
//   transitionedYield.stopTransition();
//   pageManager.setTemplate('twoData');
//   Deps.flush();
//   test.equal(div.text().trim(), '2-second', 'two not rendered');
// });
// 
// Tinytest.add('TransitionedYield - cleanup', function (test) {
//   var pageManager = new PageManagerMock()
//   var transitionedYield = new TransitionedYield(pageManager, '__main__');
//   
//   var frag = Spark.render(function() {
//     return transitionedYield.render();
//   });
//   var div = new OnscreenDiv(frag);
//   
//   var calls = 0;
//   Template.oneData.rendered = function() { calls += 1 }
//   
//   pageManager.setTemplate('oneData');
//   pageManager.setData({property: 'first'});
//   Deps.flush();
//   test.equal(div.text().trim(), '1-first', 'one not rendered with data');
//   var made_calls = calls;
//   
//   transitionedYield.transition('twoData', 'normal');
//   pageManager.setTemplate('twoData');
//   pageManager.setData({property: 'second'});
//   Deps.flush();
//   test.matches(div.text().trim(), /1-first\s+2-second/, 'two not rendered alongside');
//   test.equal(made_calls, calls);
//   
//   pageManager.setData({property: 'third'});
//   Deps.flush();
//   test.equal(made_calls, calls);
//   
//   transitionedYield.stopTransition();
//   Deps.flush();
//   test.equal(made_calls, calls);
// });
// 
// Tinytest.add('TransitionedYield - classes set', function (test) {
//   var pageManager = new PageManagerMock()
//   var transitionedYield = new TransitionedYield(pageManager, '__main__');
//   
//   var frag = Spark.render(function() {
//     return transitionedYield.render();
//   });
//   var div = new OnscreenDiv(frag);
//   
//   pageManager.setTemplate('one');
//   Deps.flush();
//   
//   transitionedYield.transition('normal');
//   pageManager.setTemplate('two');
//   Deps.flush();
//   
//   var classes = div.div.children[0].className;
//   test.matches(classes, /normal/, 'No class set on div');
//   test.matches(classes, /transitioning/, 'No transitioning set on div');
//   
//   transitionedYield.stopTransition();
//   var classes = div.div.children[0].className;
//   Deps.flush();
//   
//   var classes = div.div.children[0].className;
//   test.equal(classes, 'transitioner-panes', 'Classes not cleared');
// });
