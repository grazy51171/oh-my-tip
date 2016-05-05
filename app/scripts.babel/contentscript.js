'use strict';

(function () {

  var timerHandleTip = 0;
  var tipQueue = [];
  var tipConfig = [];
  var otherOptions = {};
  var isStarted = false;

  //read configuration.
  chrome.storage.onChanged.addListener(function (changes) {
    var tipconfigChange = changes['tipConfig'];

    if (tipconfigChange)
      tipConfig = tipconfigChange.newValue;
    
    var otherOptionschange = changes['otherOptions'];
    if(otherOptionschange)
      otherOptions = otherOptionschange.newValue;
  });

  chrome.storage.local.get(
    {
      tipConfig:
      [
        { tip: 1, action: { speed: 1, duration: 3 } },
        { tip: 10, action: { speed: 2, duration: 10 } },
        { tip: 100, action: { speed: 3, duration: 30 } },
      ],
      otherOptions: { randomLevelTip: 0 }
    },
    function (items) {
      var tipConfigItem = items.tipConfig;
      if (tipConfigItem) {
        tipConfig = tipConfigItem;
      }
      otherOptions = items.otherOptions;
    });


  function changeSpeed(speed, user) {
    chrome.runtime.sendMessage({ action: 'ChangeSpeed', speed: speed, user: user });
  }

  function getActionFromSpeed(amount) {
    var action = { speed: 0, duration: 0 };
    tipConfig.forEach(function (element) {
      if (amount >= element.tip)
        action = element.action;
    }, this);

    return action;
  }

  function dequeuOneTip() {
    var message = tipQueue.shift();
    if (message) {
      // console.log('Handle tip from User ' + message.user + ' , ' + message.tip);
      var action;
      if (otherOptions.randomLevelTip == message.tip) {
        action = tipConfig[Math.floor(Math.random() * tipConfig.length)].action;
      }
      else {
        action = getActionFromSpeed(parseInt(message.tip));
      }

      if (action.speed > 0) {
        changeSpeed(action.speed, message.user);
        var textMessage = chrome.i18n.getMessage('reactMessage', [message.user, action.duration]);
        sendMessage(textMessage);
      }
      timerHandleTip = setTimeout(dequeuOneTip, action.duration * 1000);
    } else {
      changeSpeed(0, '');
      timerHandleTip = 0;
    }
  }

  function tipsended(user, tokens) {
    if (!isStarted)
      return;
    //        console.log("User "+user + " tip "+tokens);
    var message = { user: user, tip: tokens };
    tipQueue.push(message);
    if (timerHandleTip === 0) {
      dequeuOneTip();
    }
    // 
  }

  var searchTipRegex = /(.*)\s+tipped\s+(\d+)\s+token/;

  // send message to the chat.
  function sendMessage(texte) {
    var lines = texte.split('\n');
    $.each(lines, function (index, line) {
      var messageJSON = JSON.stringify({ 'm': line, 'c': '', 'f': '' });
      $('#movie')[0].SendRoomMsg(messageJSON);
    });
  }

  // Watch for tips.
  function startWatchTip() {
    $('.chat-list').observe('added','.tipalert', function () {
      var elementtext = $(this).text();
      var match = searchTipRegex.exec(elementtext);
      tipsended(match[1], match[2]);
    });
  }

  function stopWatchTip() {
    $('.chat-list').disconnect();
  }

  
  chrome.runtime.onMessage.addListener(
    function (request) {
      if (request.action == 'ChangeState') {
        isStarted = !isStarted;
        chrome.runtime.sendMessage({ action: 'ChangeState', state: isStarted });

        var messageKey = isStarted ? 'activateExtension' : 'desactivateExtension';
        if(isStarted)
          startWatchTip();
        else
          stopWatchTip();
        
        var textMessage = chrome.i18n.getMessage(messageKey);
        sendMessage(textMessage);
      }
    });

  chrome.runtime.sendMessage({ action: 'ChangeState', state: isStarted });
})();
