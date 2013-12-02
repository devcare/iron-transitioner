### Installation

Just `mrt add iron-transitioner`. That's it.

### Custom Layouts

If you want to use a layout, you can transition a yielded section simply by calling `{{transitionedYield}}` where you would normally call `{{yield}}`. You can still continue to use `{{yield}}` in your layout.

**NOTE** that due to limitations in IT, you *cannot* use `data` in you layout. Hopefully this limitation will be gone with the release of Meteor UI.

### How it works

Iron Transitioner places down the following HTML structure:

```html
<div clas="transitioner-panes">
  <div class="left-pane"></div>
  <div class="right-pane"></div>
</div>
```

Initially, IT will render the page into `.left-pane`, and will add `.current-page` to it.

When the page changes, IT will render the new page into `.right-pane`, mark it as `.next-page` to it, and then set the class `.transitioning` to the the `.transitioner-panes`, as well as some classes indication which templates are being transitioned from and to.

You can those changes to easily implement CSS transitions. The package comes with a built in `.default` transition that slides the next page in from the right.

### Custom CSS

The built in CSS that's installed with IT might not work with your layout, or perhaps you want to do a different style of transition.

To start, take a look at `transitioned_default_layout.less` to see how it works, and override the CSS as you will.

**IMPORTANT**: You need to have a "null" transition on the `.transitioner-panes` to inform IT when the transition is over. The built in `default` transition uses a delayed opacity transition to achieve this.

NOTE: If you don't want to fight the built in styles, just rename the default transition using `Router.transitionType()` (see the next section).

### Custom transition types

You can use:

```
Router.transitionType(function(fromTemplate, toTemplate) {});
```

to set the type of the transition based on the templates being used.

This type will be added to the `.transitioner-panes`, along with `.from-X` and `.to-Y` (where `X` and `Y` are the names of the templates being transitioned).

**Some examples**:

If you want to reverse the transition when the user hits a "back" button in your app, you could write:

```js
var nextTransition = 'default';

Template.X.events({
  'click .back': function() {
    nextTransition = 'back';
    history.back();
  }
});

Router.transitionType(function() {
  var nt = nextTransition;
  nextTransition = 'default';
  return nt;
});
```

If you want two pages to have a special transition, you could do:
```js
Router.transitionType(function(from, to, type) {
  if (from === 'templateOne' && to === 'templateTwo') {
    return 'special';
  }
  return type;
});
```

Of course, you might be better off just doing (and not polluting your JS with presentation code):
```css
.transitioner-panes.transitioning.from-templateOne.to-templateTwo {
  // special transition CSS
}
```

### Contributing

Contributions are very welcome. One thing that could be cool would be a bunch of built in transitions, although I don't know a general way to make them work with all layouts.

### License 

MIT. (c) Percolate Studio