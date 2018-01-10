/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals marked */
'use strict';

sendMessageToHost({command: 'loadDefaultTextContent'});

var $textContent;

function loadLocales(url, options, callback, data) {
  try {
    const waitForLocale = require('bundle-loader!../locales/' + url + '/ns.viewerZIP.json');
    waitForLocale((locale) => {
      callback(locale, { status: '200' });
    });
  } catch (e) {
    callback(null, { status: '404' });
  }
}

$(document).ready(init);
function init() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  var locale = getParameterByName('locale');
  initI18N(locale, 'ns.viewerText.json');

  var extSettings;
  loadExtSettings();

  $textContent = $('#textContent');

  var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
  var currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  var currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $textContent.removeClass();
  $textContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);

  $('#changeStyleButton').bind('click', function() {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $textContent.removeClass();
    $textContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#resetStyleButton').bind('click', function() {
    currentStyleIndex = 0;
    $textContent.removeClass();
    $textContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomInButton').bind('click', function() {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $textContent.removeClass();
    $textContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomOutButton').bind('click', function() {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $textContent.removeClass();
    $textContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomResetButton').bind('click', function() {
    currentZoomState = 3;
    $textContent.removeClass();
    $textContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  function saveExtSettings() {
    var settings = {
      'styleIndex': currentStyleIndex,
      'zoomState':  currentZoomState
    };
    localStorage.setItem('viewerTextSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerTextSettings'));
  }
}

function setContent(content, fileDirectory) {
  $textContent = $('#textContent');
  content = marked(content);
  $textContent.empty().append(content);

  if (fileDirectory.indexOf('file://') === 0) {
    fileDirectory = fileDirectory.substring(('file://').length, fileDirectory.length);
  }
  console.log(content);
  // Cutting preview content 8kb
  var previewSize = 1024 * 10;
  console.log("Content size: " + content.length);
  if (content.length > previewSize) {
    content = content.substring(0, previewSize);
  }

  // removing the script tags from the content
  var cleanedContent = content.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  if (isElectron) {
  /*  $textContent.empty().append($('<div>', {
      style: "background-color: darkgray; width: 100%;",
      class: "flexLayoutVertical",
      id: "mainLayout",
    })
    .append('<span style="font-size: 14px; color: white;">&nbsp;Preview of the document begin: </span>')
    .append($('<textarea>', {
        readonly: "true",
        style: "overflow: auto; height: 100%; width: 100%; font-size: 13px; margin: 0px; background-color: white; border-width: 0px;",
        class: "flexMaxHeight"
      })
    .append(cleanedContent)
    ));*/

    $textContent.find("#mainLayout").prepend($('<button/>', {
      class: 'btn btn-primary',
      style: 'margin: 5px;',
      text: 'Open Natively'
    }).on("click", function() {
      sendMessageToHost({command: 'openFileNatively', link: filePath});
    }));
  }
}
