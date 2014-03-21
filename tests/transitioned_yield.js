var withTransitionedYieldInLayout = function(cb) {
  // instantiate a layout but don't actually render it to the screen.
  var layout = Layout.instantiate();

  var cmp = TransitionedYield.extend({region: 'main'});
  withRenderedComponent(cmp, layout, function (inst, screen) {
    cb(screen, layout, inst, cmp);
  });
}



Tinytest.add('TransitionedYield - standard Layout - basic rendering', function (test) {
  withTransitionedYieldInLayout(function(screen, layout) {
    layout.setRegion('one');
    Deps.flush();
    test.equal(screen.text().trim(), 'One', 'one not rendered');
      
    layout.setRegion('two');
    Deps.flush();
    test.equal(screen.text().trim(), 'Two', 'two not rendered');
  });
});

Tinytest.add('TransitionedYield - standard Layout - basic transitioning', function (test) {
  withTransitionedYieldInLayout(function(screen, layout, transitionedYield) {
    layout.setRegion('one');
    Deps.flush();
    test.equal(screen.text().trim(), 'One', 'one not rendered');

    transitionedYield.transition('two', 'normal');
    layout.setRegion('two');
    Deps.flush();
    test.matches(screen.text().trim(), /One\s+Two/, 'two not rendered alongside');

    transitionedYield.stopTransition();
    test.equal(screen.text().trim(), 'Two', 'one not cleared');

    layout.setRegion('one');
    Deps.flush();
    test.equal(screen.text().trim(), 'One', 'one not rendered');
  });
});


Tinytest.add('TransitionedYield - standard Layout - reactivity', function (test) {
  withTransitionedYieldInLayout(function(screen, layout, transitionedYield) {
    layout.setRegion('oneData');
    layout.setData({property: 'first'})
    Deps.flush();
    test.equal(screen.text().trim(), '1-first', 'one not rendered with data');
  
    transitionedYield.transition('twoData', 'normal');
    layout.setRegion('twoData');
    layout.setData({property: 'second'});
    Deps.flush();
    test.matches(screen.text().trim(), /1-first\s+2-second/, 'two not rendered alongside');
  
    transitionedYield.stopTransition();
    layout.setRegion('twoData');
    Deps.flush();
    test.equal(screen.text().trim(), '2-second', 'two not rendered');
  });
});

Tinytest.add('TransitionedYield - standard Layout - cleanup', function (test) {
  withTransitionedYieldInLayout(function(screen, layout, transitionedYield) {
    var calls = 0;
    Template.oneData.rendered = function() { calls += 1 }
  
    layout.setRegion('oneData');
    layout.setData({property: 'first'});
    Deps.flush();
    test.equal(screen.text().trim(), '1-first', 'one not rendered with data');
    var made_calls = calls;
  
    transitionedYield.transition('twoData', 'normal');
    layout.setRegion('twoData');
    layout.setData({property: 'second'});
    Deps.flush();
    test.matches(screen.text().trim(), /1-first\s+2-second/, 'two not rendered alongside');
    test.equal(made_calls, calls);
  
    layout.setData({property: 'third'});
    Deps.flush();
    test.equal(made_calls, calls);
  
    transitionedYield.stopTransition();
    Deps.flush();
    test.equal(made_calls, calls);
  });
});

Tinytest.add('TransitionedYield - standard Layout - classes set', function (test) {
  withTransitionedYieldInLayout(function(screen, layout, transitionedYield) {
    layout.setRegion('one');
    Deps.flush();
  
    transitionedYield.transition('normal');
    layout.setRegion('two');
    Deps.flush();
  
    var classes = screen.div.children[0].className;
    test.matches(classes, /normal/, 'No class set on div');
    test.matches(classes, /transitioning/, 'No transitioning set on div');
  
    transitionedYield.stopTransition();
    var classes = screen.div.children[0].className;
    Deps.flush();
  
    var classes = screen.div.children[0].className;
    test.equal(classes, 'transitioner-panes', 'Classes not cleared');
  });
});
