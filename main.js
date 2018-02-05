/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals sendMessageToHost, getParameterByName, initI18N, $, isElectron */
'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent', preview: true });

const locale = getParameterByName('locale');
const filePath = getParameterByName('file');

let $textContent;

$(document).ready(() => {
  initI18N(locale, 'ns.viewerText.json');
  $textContent = $('#textContent');
});

function setContent(content, fileDir) {
  $textContent = $('#textContent');
  $textContent.empty().append(content);

  let fileDirectory = fileDir;
  if (fileDirectory.indexOf('file://') === 0) {
    fileDirectory = fileDirectory.substring(
      'file://'.length,
      fileDirectory.length
    );
  }

  // console.log(content);
  // Cutting preview content 8kb
  const previewSize = 1024 * 10;
  // console.log('Content size: ' + content.length);

  // removing the script tags from the content
  let cleanedContent = content.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  if (content.length > previewSize) {
    cleanedContent = content.substring(0, previewSize);
  }

  // if (isElectron) {
  $textContent.empty().append(
    $('<div>', {
      style: 'background-color: darkgray; width: 100%; height: 100%;',
      class: 'flexLayoutVertical',
      id: 'mainLayout'
    })
      .append(
        '<span style="margin-left: auto; margin-right: auto; font-size: 14px; color: white;">Preview of the document: </span>'
      )
      .append(
        $('<textarea>', {
          readonly: 'true',
          style:
            'overflow: auto; height: 100%; width: 100%; font-size: 13px; margin: 0px; background-color: white; border-width: 0px;',
          class: 'flexMaxHeight'
        }).append(cleanedContent)
      )
  );

  $textContent.find('#mainLayout').prepend(
    $('<button/>', {
      class: 'btn btn-primary',
      style: 'margin: 10px; margin-left: auto; margin-right: auto; max-width: 200px;',
      text: 'Open File Natively'
    }).on('click', () => {
      sendMessageToHost({ command: 'openFileNatively', link: filePath });
    })
  );
  // }
}
