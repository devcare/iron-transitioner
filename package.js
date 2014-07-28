Package.describe({
  summary: 'Tools to transition route changes.',
  version: "0.1.0",
  // git: "https://github.com/eventedmind/iron-dynamic-template"
});

Package.on_use(function (api) {
  api.use(['blaze', 'ui', 'underscore', 'templating']);

  api.use('iron:core');
  api.imply('iron:core');
  
  api.use('iron:dynamic-template');

  api.add_files('transitioner.js', 'client');
});

Package.on_test(function (api) {
  api.use('iron:transitioner');
  api.use('templating');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('ui');
  api.use('deps');

  api.use('iron:layout');
  
  api.add_files('transitioner_test.html', 'client');
  api.add_files('transitioner_test.js', 'client');
});
