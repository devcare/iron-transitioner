Package.describe({
  summary: 'Transitions for the Iron Router'
});

Package.on_use(function (api) {
  // right now this is just so we don't use it in tests.
  api.use('iron-router', 'client', {weak: true});
  api.use('blaze-layout', 'client', {weak: true});
  api.use(['reactive-dict', 'ui', 'templating', 'underscore', 'less'], 'client');
  api.add_files([
    'lib/utils.js',
    'lib/transitioned_default_layout.html',
    'lib/transitioned_default_layout.less',
    'lib/transitioned_yield.html', 
    'lib/transitioned_yield.js',
    'lib/transitioned_layout.js',
    'lib/hookup.js'
  ], 'client')
  
  api.export('TransitionedYield', 'client', {testOnly: true});
  api.export('TransitionedLayout', 'client', {testOnly: true});
});

Package.on_test(function(api) {
  api.use([
    'iron-transitioner',
    'test-helpers',
    'tinytest',
    'ui',
    'templating',
    'deps'
  ], 'client');
  
  api.add_files([
    'tests/helpers.js',
    'tests/templates.html',
    'tests/transitioned_yield.js',
    'tests/transitioned_layout.js'
  ], 'client')
});
