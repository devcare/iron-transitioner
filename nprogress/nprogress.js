Router.configure({layoutTemplate: 'Layout'});

// not sure what's happening, IR seems to be broken
var action = function() {
  if (! this.ready()) {
    this.render('Loading');
  } else {
    this.render();
  }
}

Router.map(function() {
  this.route('/', function() { this.redirect('/a'); });
  this.route('/a', {
    waitOn: function() { return Meteor.subscribe('wait', 'a'); },
    action: action
  });
  this.route('/b', {
    waitOn: function() { return Meteor.subscribe('wait', 'b'); },
    action: action
  });
});

if (Meteor.isClient) {
  // XXX: not sure why this isn't working
  // Router.plugin('loading', {loadingTemplate: 'Loading'});
  
  Router.onBeforeAction(function() {
    console.log(this.ready())
    if (! this.ready()) {
      this.render('Loading');
    } else {
      this.next();
    }
  });
  
  Template.Loading.rendered = function() {
    NProgress.start();
  }
  Template.Loading.destroyed = function() {
    NProgress.done();
  }
  
  Template.Layout.helpers({
    routeReady: function() {
      return Router.current().ready();
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish('wait', function(arg) {
    console.log('sleeping', arg)
    Meteor._sleepForMs(1000);
    console.log('slept')
    this.ready();
  })
}
