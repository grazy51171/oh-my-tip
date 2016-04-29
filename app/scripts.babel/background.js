'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

var audio = new Audio();

chrome.runtime.onMessage.addListener(
  function (request, sender) {
    if (request.action == 'ChangeSpeed') {
      changeSpeed(request.speed, request.user);
      updateIcon(sender.tab.id, '' + request.speed, true);
    } else if (request.action == 'ChangeState') {
      updateIcon(sender.tab.id, '', request.state);
    }
  });



function changeSpeed(speed, user) {
  audio.pause();
  audio.currentTime = 0;
  if (speed != 0) {

    audio.loop = true;
    audio.src = chrome.extension.getURL('images/sound' + speed + '.wav');
    audio.play();
  }

}




// Called when the url of a tab changes.
function updateIcon(tabId, mess, running) {

  // page icon
  var canvas = document.createElement('canvas');
  var img = document.createElement('img');
  img.onload = function () {
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    //context.fillStyle = "rgba(255,0,0,1)";
    //context.fillRect(10, 0, 19, 19);
    context.fillStyle = 'black';
    context.font = '8px Arial';
    context.fillText(mess, 0, 19);
    if (!running) {

      context.beginPath();
      context.strokeStyle = 'rgba(255,0,0,1)';
      context.lineWidth = 4;
      context.moveTo(0, 0);
      context.lineTo(19, 19);
      context.stroke();
    }
    chrome.pageAction.setIcon({
      imageData: context.getImageData(0, 0, 19, 19),
      tabId: tabId
    });
  };
  img.src = 'images/icon-19.png';


  chrome.pageAction.show(tabId);
}

chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'ChangeState' });
});