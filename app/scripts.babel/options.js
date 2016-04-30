'use strict';

function save_options() {
  var tipConfig = [];
  var otherOptions = {};
  otherOptions.randomLevelTip = 0;
  $('#tipConfig tr').each(function () {
    var tip = parseInt($(this).find('.tip').val());
    var speed = parseInt($(this).find('.speed').val());
    var duration = parseInt($(this).find('.duration').val());
    if (tip && speed && duration)
      tipConfig.push({ tip: tip, action: { speed: speed, duration: duration } });
  });

  otherOptions.randomLevelTip = parseInt($('#randomLevelTip').val());

  tipConfig = tipConfig.sort(function (a, b) {
    if (a.tip < b.tip) return -1;
    if (a.tip > b.tip) return 1;
    return 0;
  });

  chrome.storage.local.set({
    tipConfig: tipConfig,
    otherOptions: otherOptions,
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
      restore_options();
    }, 750);
  });
}

function addLine() {
  $('#tipConfig').append('<tr>'
    + '<td><input type=\'number\' min=\'0\' class=\'tip\' /></td>'
    + '<td><input type=\'number\' min=\'0\' max=\'3\' class=\'speed\' /></td>'
    + '<td><input type=\'number\' min=\'1\' class=\'duration\' /></td>'
    + '<td><input type=\'button\' value=\'-\' class=\'removeLine\'></td>'
    + '</tr>');
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    tipConfig:
    [
      { tip: 1, action: { speed: 1, duration: 3 } },
      { tip: 10, action: { speed: 2, duration: 10 } },
      { tip: 30, action: { speed: 3, duration: 30 } },
    ],
    otherOptions: { randomLevelTip: 0 }
  }, function (items) {
    if (items.tipConfig) {
      $('#tipConfig').empty();
      items.tipConfig.forEach(function (element) {
        addLine();
        $('.tip').last().val(element.tip);
        $('.speed').last().val(element.action.speed);
        $('.duration').last().val(element.action.duration);
      }, this);
    }
    if (items.otherOptions) {
      $('#randomLevelTip').val(items.otherOptions.randomLevelTip);
    }
  });
}

// remove line handling
$('#tipConfig').on('click', '.removeLine',
  function () { $(this).closest('tr').remove(); }
);
// add line handling
$('#addline').on('click', addLine);

$('#save').on('click', save_options);


$(function () {
  restore_options();
});
