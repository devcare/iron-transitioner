if (Meteor.isClient) {
  Session.setDefault('one', 'one');
  Session.setDefault('two', 'two');
}

Router.map(function() {
  this.route('one', {path: '/', data: function() { return Session.get('one'); }});
  this.route('two', {data: function() { return Session.get('two'); }});
});