/**
 * Backabit Ease Each Script for Illustrator CC 2015
 *
 * Displays a dialog that lets you make some simple transformations to each
 * selected item progressively, optionally with easing applied. Useful when
 * making simple sprite animations that require x/y changes or rotation.
 *
 * http://backabit.com
 */

var doc = app.activeDocument;

/**
 * Easing functions
 * only considering the t value for the range [0, 1] => [0, 1]
 *
 * See: https://gist.github.com/frederickk/6165768
 */

var Ease = {
  // no easing, no acceleration
	linear: function (t) { return t },
	// accelerating from zero velocity
	easeInQuad: function (t) { return t*t },
	// decelerating to zero velocity
	easeOutQuad: function (t) { return t*(2-t) },
	// acceleration until halfway, then deceleration
	easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	// accelerating from zero velocity 
	easeInCubic: function (t) { return t*t*t },
	// decelerating to zero velocity 
	easeOutCubic: function (t) { return (--t)*t*t+1 },
	// acceleration until halfway, then deceleration 
	easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	// accelerating from zero velocity 
	easeInQuart: function (t) { return t*t*t*t },
	// decelerating to zero velocity 
	easeOutQuart: function (t) { return 1-(--t)*t*t*t },
	// acceleration until halfway, then deceleration
	easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	// accelerating from zero velocity
	easeInQuint: function (t) { return t*t*t*t*t },
	// decelerating to zero velocity
	easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
	// acceleration until halfway, then deceleration 
	easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
	// accelerating from zero velocity
	easeInSine: function (t) { return -1*Math.cos(t*(Math.PI/2))+1 },
	// decelerating to zero velocity
	easeOutSine: function (t) { return 1*Math.sin(t*(Math.PI/2)) },
	// accelerating until halfway, then decelerating
	easeInOutSine: function (t) { return -0.5*(Math.cos(Math.PI*t)-1) },
	// accelerating from zero velocity
	easeInExpo: function (t) { return 1*Math.pow(2, 10*(t-1)) },
	// decelerating to zero velocity
	easeOutExpo: function (t) { return 1*(-Math.pow(2, -10*t)+1 ) },
	// accelerating until halfway, then decelerating
	easeInOutExpo: function (t) { t /= 0.5; if (t < 1) return 0.5 * Math.pow(2, 10*(t-1)); t--; return 0.5 * (-Math.pow(2, -10*t)+2); },
	// accelerating from zero velocity
	easeInCirc: function (t) { return -1*(Math.sqrt(1-t*t)-1) },
	// decelerating to zero velocity
	easeOutCirc: function (t) { t--; return 1*Math.sqrt(1-t*t); },
	// acceleration until halfway, then deceleration
	easeInOutCirc: function (t) { t /= 0.5; if(t<1) { return -0.5*(Math.sqrt(1-t*t)-1); }else{ t-=2; return 0.5*(Math.sqrt(1-t*t)+1); } }
};

/**
 * Sort array of items by x/y position.
 * Left to right, top to bottom.
 */

function sortByPosition (items) {
  items.sort(function (a, b) {
    if (a.top !== b.top) {
      return b.top - a.top; // Measured from bottom of page
    }
    return a.left - b.left;
  });
  
  return items;
}

/**
 * Transfoooooooorm!!
 */

function easeEach (items, deltaX, deltaY, angle, ease, anchor) {
  var i, end, progress;
  
  items = sortByPosition(items);
  end = items.length - 1;
  ease = ease || Ease.linear;
  
  for (i = 0; i <= end; i++) {
    progress = ease(i / end);
    
    if (deltaX !== 0 || deltaY !== 0) {
      items[i].translate(deltaX * progress, deltaY * progress);
    }
    
    if (angle !== 0) {
      items[i].rotate(angle * progress, null, null, null, null, anchor);
    }
  }
}

/**
 * UI
 */

function createDialog () {
  var dialog = new Window('dialog', 'Backabit Ease Each');
  
  // Groups
  var transformGroup = dialog.add('group');
  var optionsGroup = dialog.add('group');
  var actionsGroup = dialog.add('group');
  
  // Panels
  var translatePanel = transformGroup.add('panel', undefined, 'Translate');
  var rotatePanel = transformGroup.add('panel', undefined, 'Rotate');
  var easePanel = optionsGroup.add('panel', undefined, 'Easing');
  var anchorPanel = optionsGroup.add('panel', undefined, 'Transform Anchor');
  translatePanel.orientation = 'row';
  rotatePanel.orientation = 'row';
  
  // Translate options
  var xLabel = translatePanel.add('statictext', undefined, 'X');
  var xInput = translatePanel.add('edittext', undefined, '0');
  var yLabel = translatePanel.add('statictext', undefined, 'Y');
  var yInput = translatePanel.add('edittext', undefined, '0');
  xInput.characters = 5;
  yInput.characters = 5;
  
  // Rotate options
  var rotateInput = rotatePanel.add('edittext', undefined, '0');
  rotateInput.characters = 5;
  
  // Easing options
  var easeList = easePanel.add('dropdownlist');
  for (var key in Ease) {
    if (Ease.hasOwnProperty(key)) {
      easeList.add('item', key);
    }
  }
  easeList.selection = 0;
  
  // Anchor options
  var anchorList = anchorPanel.add('dropdownlist');
  anchorList.add('item', 'Center');
  anchorList.add('item', 'Top Left');
  anchorList.add('item', 'Top');
  anchorList.add('item', 'Top Right');
  anchorList.add('item', 'Bottom Right');
  anchorList.add('item', 'Bottom');
  anchorList.add('item', 'Bottom Left');
  anchorList.selection = 0;
  
  // OK
  var okButton = actionsGroup.add('button', undefined, 'Go!');
  okButton.onClick = function () {
    easeEach(
      doc.selection,
      Number(xInput.text),
      Number(yInput.text),
      Number(rotateInput.text),
      Ease[easeList.selection.text],
      Transformation[anchorList.selection.text.replace(/ /g, '').toUpperCase()]);
    dialog.close();
  };
  
  // Cancel
  var cancelButton = actionsGroup.add('button', undefined, 'Never mind');
  cancelButton.onClick = function () {
    dialog.close();
  };
  
  dialog.show();
}

if (doc) {
  createDialog();
}