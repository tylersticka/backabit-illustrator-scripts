/**
 * Helper for exporting Backabit game assets
 */

var document = app.activeDocument;

var designedAt = 2;
var resolutions = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

var checkboxes = [];
var artboardRange = '1';

function rangeToArray (range) {
    var result = [];
    var segments, segment, parsed, index;
    var dashAt, dashSegments, dashEnd, dashIndex;
    
    range = range || '';
    range.replace(/ /g,'');
    segments = range.split(',');
    
    for (i = 0; i < segments.length; i++) {
        segment = segments[i];
        dashAt = segment.indexOf('-');
        
        if (dashAt === -1) {
            parsed = parseInt(segment, 10);
            
            if (!isNaN(parsed)) {
                result.push(parsed);
            }
        } else {
            dashSegments = segment.split('-');
            dashIndex = parseInt(dashSegments[0], 10);
            dashEnd = parseInt(dashSegments[1], 10);
            
            if (!isNaN(dashIndex) && !isNaN(dashEnd)) {
                for (; dashIndex <= dashEnd; dashIndex++) {
                    result.push(dashIndex);
                }
            }
        }
    }

    return result;
}

if (document) {
    var baseName = document.name.replace(/.ai$/, '');
    var folder = document.path;

    if (document.artboards.length > 1) {
        artboardRange += '-' + document.artboards.length;
    }
    
    var dialog = new Window('dialog', 'Backabit export options');
    
    var resolutionGroup = dialog.add('group');
    var resolutionPanel = resolutionGroup.add('panel', undefined, 'Resolutions');
    resolutionPanel.orientation = 'row';
    
    for (var i = 0; i < resolutions.length; i++) {
        var cb = resolutionPanel.add('checkbox', undefined, '@' + resolutions[i] + 'x');
        cb.item = resolutions[i];
        checkboxes.push(cb);
    }
    
    var exportGroup = dialog.add('group');
    
    var artboardLabel = exportGroup.add('statictext', undefined, 'Artboards');
    
    var artboardDefaultValue = '1';
    
    if (document.artboards.length > 1) {
        artboardDefaultValue += '-' + document.artboards.length;
    }
    
    var artboardField = exportGroup.add('edittext', undefined, artboardRange);
    artboardField.characters = 10;
    
    artboardField.addEventListener('onChange', function () {
       artboardRange = this.value; 
    });
    
    var okButton = exportGroup.add('button', undefined, 'Export');
    var cancelButton = exportGroup.add('button', undefined, 'Cancel');
    
    okButton.onClick = function () {
       var artboardIndexes = rangeToArray(artboardRange);
       var artboardIndex, artboard;
       var checkboxIndex, checkbox, scale, scaleString, file, options;
       
       for (index = 0; index < artboardIndexes.length; index++) {
           artboardIndex = artboardIndexes[index] - 1;
           document.artboards.setActiveArtboardIndex(artboardIndex);
           artboard = document.artboards[artboardIndex];
           
           for (checkboxIndex = 0; checkboxIndex < checkboxes.length; checkboxIndex++) {
               checkbox = checkboxes[checkboxIndex];
               
               if (!checkbox.value) continue;
               
               scale = checkbox.item;
               scaleString = (scale > 1) ? '@' + scale + 'x' : '';
               
               file = new File(folder.fsName + '/' + baseName + '_' + artboard.name + scaleString + '.png');
               options = new ExportOptionsPNG24();

               options.transparency = true;
               options.artBoardClipping = true;
               options.antiAliasing = true;
               options.horizontalScale = scale / designedAt * 100;
               options.verticalScale = scale / designedAt * 100;

               document.exportFile(file, ExportType.PNG24, options);
           }
       }
       
       dialog.close(); 
    };
    
    cancelButton.onClick = function () {
       dialog.close(); 
    };
    
    dialog.show();
}