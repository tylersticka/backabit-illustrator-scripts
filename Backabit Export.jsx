/**
 * Backabit Export Script for Illustrator CC 2015
 *
 * Displays a dialog allowing you to export assets for the current document
 * with some different settings, including initial scale, export scales,
 * artboards and filename prefix.
 *
 * Created to eliminate some busy work while designing games! :)
 *
 * http://backabit.com
 */

var doc = app.activeDocument;

var settings = {
  sourceScale: 2,
  exportScales: '2,3',
  artboards: (doc && doc.artboards.length > 1) ? '1-' + doc.artboards.length : 1,
  filePrefix: doc ? doc.name.replace(/.ai$/, '_') : '',
  folder: doc ? doc.path : ''
};

/**
 * Expand a string representing a numerical range into an array of numbers.
 *
 *     expandRange('-6,-3--1,3-5,7-11,14,15,17-20')
 *     //=> [-6,-3,-2,-1,3,4,5,7,8,9,10,11,14,15,17,18,19,20]
 *
 * See: http://www.rosettacode.org/wiki/Range_expansion#JavaScript
 */

function expandRange (rangeExpr) {
  var result = [];
  var terms = rangeExpr.split(/,/);
  var key;
  
  for (key in terms) {
    result = result.concat(expandRange.expandTerm(terms[key]));
  }
  
  return result;
}

expandRange.getFactors = function (term) {
  var matches = term.match(/(-?[0-9]+)-(-?[0-9]+)/);
  var result = [];
  
  if (matches) {
    result.push(Number(matches[1]));
    result.push(Number(matches[2]));
  } else {
    result.push(Number(term));
  }
  
  return result;
};

expandRange.expandTerm = function (term) {
  var factors = expandRange.getFactors(term);
  var range = [];
  var n;
  
  if (factors.length < 2) {
    range.push(factors[0]);
  } else {
    for (n = factors[0]; n <= factors[factors.length - 1]; n++) {
      range.push(n);
    }
  }
  
  return range;
};

/**
 * Export
 */

function startExport () {
  var sourceScale = Number(settings.sourceScale);
  var exportScales = expandRange(settings.exportScales);
  var artboards = expandRange(settings.artboards);
  var i;
  
  for (i = 0; i < artboards.length; i++) {
    exportArtboard(
      artboards[i] - 1,
      sourceScale,
      exportScales,
      settings.folder,
      settings.filePrefix);
  }
}

function exportArtboard (artboardIndex, sourceScale, scales, folder, prefix) {
  var artboard, scale, pathBase, path, file, options, i;
  
  doc.artboards.setActiveArtboardIndex(artboardIndex);
  artboard = doc.artboards[artboardIndex];
  pathBase = folder.fsName + '/' + prefix + artboard.name;
  
  for (i = 0; i < scales.length; i++) {
    scale = scales[i];
    path = pathBase;
    
    if (scale > 1) {
      path += '@' + scale + 'x';
    }
    
    path += '.png';
    file = new File(path);
    options = new ExportOptionsPNG24();
    
    options.transparency = true;
    options.artBoardClipping = true;
    options.antiAliasing = true;
    options.horizontalScale = scale / sourceScale * 100;
    options.verticalScale = scale / sourceScale * 100;

    doc.exportFile(file, ExportType.PNG24, options);
  }
}

/**
 * UI
 */

function addSettingsField (parent, key, labelText) {
  var group = parent.add('group');
  var label = group.add('statictext', undefined, labelText);
  var input = group.add('edittext', undefined, settings[key]);
  label.characters = 7;
  input.characters = 10;
  input.onChange = function () {
    settings[key] = this.text;
  };
}

function createDialog () {
  var dialog = new Window('dialog', 'Backabit Export');
  
  // Groups
  var optionsGroup = dialog.add('group');
  var folderGroup = dialog.add('group');
  var actionsGroup = dialog.add('group');
  
  // Panels
  var inPanel = optionsGroup.add('panel', undefined, 'In');
  var outPanel = optionsGroup.add('panel', undefined, 'Out');
  var folderPanel = folderGroup.add('panel', undefined, 'Folder');
  folderPanel.orientation = 'row';
  
  // Add simple fields
  addSettingsField(inPanel, 'sourceScale', 'Scale');
  addSettingsField(inPanel, 'artboards', 'Artboards');
  addSettingsField(outPanel, 'exportScales', 'Scales');
  addSettingsField(outPanel, 'filePrefix', 'Prefix');
  
  // Folder
  var folderPreview = folderPanel.add('statictext', undefined, settings.folder);
  var folderButton = folderPanel.add('button', undefined, 'Change...');
  folderPreview.characters = 30;
  folderButton.onClick = function () {
    var folder = Folder.selectDialog('Select destination folder');
    if (folder) {
      settings.folder = folder;
      folderPreview.text = folder;
    }
  };
  
  // OK
  var okButton = actionsGroup.add('button', undefined, 'Go!');
  okButton.onClick = function () {
    startExport();
    dialog.close();
  };
  
  // Cancel
  var cancelButton = actionsGroup.add('button', undefined, 'Never mind');
  cancelButton.onClick = function () {
    dialog.close();
  };
  
  dialog.show();
}

/**
 * Initialization
 */

if (doc) {
  createDialog();
}
