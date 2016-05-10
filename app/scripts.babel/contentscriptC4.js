'use strict';

/*global SoundTipper:false */

var C4SoundTipper = new SoundTipper();

C4SoundTipper.sendMessage = function () { };

//var searchTipRegex = /<span class="glyphicon glyphicon-usd tipIcon"><\/span>(\S*)\s.*\((\d+)\s+token/;
var searchTipRegex = /\((\d+)\s+token/;

// Watch for tips.
C4SoundTipper.startWatchTip = function () {
  var soundTipper = this;
  $('#chatTabPanel').observe('added', '.generalNotification .tokensAmount', function () {
    var elementtext = this.innerHTML;
    
    var isHandled = $(this).attr('gyIsHandled');

    var match = searchTipRegex.exec(elementtext);
    if (match && !isHandled) {
      $(this).attr('gyIsHandled', '1');
      soundTipper.tipsended('null', match[1]);
    }
  });
};

C4SoundTipper.stopWatchTip = function () {
  $('.chat-list').disconnect();
};

C4SoundTipper.notifyStart(true);