// var MAIN_YIELD = '__main__';
// var DEFAULT_LAYOUT = '__transitionedDefaultLayout__'
// 
// var Utils = Package['iron-router'].Utils;
// var PageManager = Package['iron-router'].PageManager;
// 
// TransitionedPageManager = Utils.extend(PageManager, {
//   constructor: function (options) {
//     var self = this;
//     
//     TransitionedPageManager.__super__.constructor.apply(this, arguments);
//     
//     // override the default layout
//     this.layout.set(DEFAULT_LAYOUT);
//     
//     this.transitionedYields = {};
//   },
//   
//   setLayout: function(layout) {
//     layout = layout || DEFAULT_LAYOUT;
//     TransitionedPageManager.__super__.setLayout.call(this, layout);
//   },
//   
//   setTemplate: function (template, key) {
//     var self = this;
//     var key = key || MAIN_YIELD;
//     var oldTemplate = Deps.nonreactive(function() {
//       return self.yieldsToTemplates.get(key);
//     });
//     
//     // console.log('setTemplate', oldTemplate, template, key)
//     TransitionedPageManager.__super__.setTemplate.apply(this, arguments);
//     
//     var transitionedYield = this.transitionedYields[key];
//     
//     if (! transitionedYield || ! oldTemplate)
//       return;
//     
//     var type = 'default';
//     if (this.transitionType)
//       type = this.transitionType(oldTemplate, template, type)
//     
//     // don't transition if the transitionType is false
//     if (! type)
//       return;
//     
//     var classes = type;
//     if (_.isString(oldTemplate))
//       classes = classes + ' from-' + oldTemplate;
//     if (_.isString(template))
//       classes = classes + ' to-' + template;
//     
//     transitionedYield.transition(classes);
//   },
//   
//   // mainly for testing
//   endTransitions: function() {
//     _.each(this.transitionedYields, function(transitionedYield) {
//       transitionedYield.endTransition();
//     });
//   },
//   
//   helpers: function () {
//     var self = this;
//     return _.extend(TransitionedPageManager.__super__.helpers.apply(this, arguments), {
//       // exactly the same as yield for now
//       'transitionedYield': function(key, options) {
//         var html;
// 
//         if (arguments.length < 2)
//           key = null;
// 
//         html = self._renderTransitionedYield(key);
//         return new Handlebars.SafeString(html);
//       }
//     });
//   },
//   
//   _renderTransitionedYield: function (key) {
//     var key = key || MAIN_YIELD;
//     // console.log('rendering template ' + key);
//     
//     // XXX: ??
//     if (! this.transitionedYields[key])
//       this.transitionedYields[key] = new TransitionedYield(this, key);
//     
//     return this.transitionedYields[key].render();
//   },
//   
//   // XXX: copied over from IR but with data dependency removed
//   renderLayout: function () {
//     var getTemplateFunction = function (template, defaultFn) {
//       if (_.isFunction(template))
//         return template;
//       else if (Template[template])
//         return Template[template];
//       else if (defaultFn)
//         return defaultFn;
//       else
//         throw new Error('Oops, no template found named "' + template + '"');
//     };
//     
//     var self = this;
//     // console.log('rendering layout ' + this.layout.get())
// 
//     var html = Spark.isolate(function () {
//       var layout = getTemplateFunction(self.layout.get());
//       // XXX: don't supply data in the layout to avoid re-renders
//       // var data = self.data.get();
//       var helpers = self.helpers();
//       var dataContext = _.extend({}, helpers);
//       return layout(dataContext);
//     });
// 
//     return html;
//   }
// });
// 
// 
// // override the page manager
// // XXX: instead, probably override the whole router so we can redefine
// Router._page = new TransitionedPageManager;
// 
// _.extend(Router, {
//   transitionType: function(fn) {
//     this._page.transitionType = fn;
//   },
// })
// 
// // Router.prototype.back
// // Router.prototype.setNextTransitionType
