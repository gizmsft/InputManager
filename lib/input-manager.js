
; function InputManager(element, options) {
    "use strict";

    var $self = this;
    var $target = (element instanceof jQuery) ? element : $(element);
    var _target = $target.get(0);

    // input manager can only be attached to input or textarea elements.
    (function (nodeName) {
        if (nodeName != 'input' && nodeName != 'textarea') {
            throw 'unsupported element type \'' + nodeName + '\' for inputManager';
        }
    })(_target.nodeName.toLowerCase());

    const defaults = {
        containerClass: 'input-manager',
        debug: false,
        enabled: true,
        highlightTemplate: "<div class='highlight'></div>",
        events: {
            onKeydown: null,
            onKeyup: null,
            onCursorPositionChanged: null
        }
    }

    const local = {
        debug: false,
        enabled: true,
        bufferedCusorPosition: 0,
        settings: null
    };

    // save settings by overriding defaults
    local.settings = $.extend(true, {}, defaults, options);
    local.debug = local.settings.debug;
    local.enabled = local.settings.enabled;

    $target.addClass(local.settings.containerClass);

    const _caretLocator = new CaretLocator($target, {
        debug: local.debug
    });

    //////////////////////////////////////////
    // PUBLIC FUNCTIONS
    //////////////////////////////////////////

    // returns element this plugin is attached to.
    this.getTarget = function () {
        return $target;
    }

    // returns current settings of the plugin.
    this.getSettings = function () {
        return local.settings;
    }

    // set debug
    this.setDebug = function (enabled) {
        local.debug = !!enabled;
        _caretLocator.setDebug(enabled);
    }

    // set enable events
    this.setEnabled = function (enabled) {
        local.enabled = enabled;
    }

    // get enable events
    this.getEnabled = function () {
        return local.enabled;
    }

    this.getCursorOffset = function (preText, postText) {
        return _caretLocator.getCursorOffset(preText, postText);
    }

    this.setHighlight = function (element, preText, postText, term) {
        _caretLocator.setHighlight(element, preText, postText, term);
    }

    this.unsetHighlight = function ($element) {
        _caretLocator.unsetHighlight($element);
    }

    // returns current cursor position
    this.getCursorPosition = function () {
        var index = _target.selectionEnd;

        if (typeof index === 'number') {
            return index;
        }
        else if (document.selection) {
            var range = _target.createTextRange();
            range.moveStart('character', 0);
            range.moveEnd('textedit');
            return range.text.length;
        }
    }

    // sets cursor position.
    this.setCursorPosition = function (position) {
        if ($target.is(':focus')) {
            if (typeof _target.selectionEnd === 'number') {
                _target.selectionStart = _target.selectionEnd = position;
            }
            else if (_target.createTextRange) {
                var range = _target.createTextRange();
                range.move('character', position);
                range.select();
            }
        }
    }

    this.getSelectedText = function () {
        // Get Previous text
        var start = _target.selectionStart;

        if (typeof start === 'number') {
            var end = _target.selectionEnd;
            return _target.value.substring(start, end);
        }
        else if (document.selection) {
            return _target.selection.createRange().text;
        }
    }

    this.getInputState = function () {
        return getInputState();
    }

    this.updateCursorPosition = function () {
      raiseCursorPositionChanged();
    }

    /////////////////////////////////
    // PRIVATE FUNCTIONS
    /////////////////////////////////

    // raises event 'onCursorPositionChanged' when cursor is moved.
    var raiseCursorPositionChanged = function () {
        if (local.settings.events.onCursorPositionChanged && local.enabled) {
            if ($target.is(':focus')) {
                var cursorPosition = $self.getCursorPosition();
                if (local.bufferedCusorPosition != cursorPosition) {
                    local.bufferedCusorPosition = cursorPosition;

                    var state = getInputState();
                    var param = $.extend({
                        'cursorPosition': cursorPosition
                    }, state);
                    local.settings.events.onCursorPositionChanged.call($self, param);
                }
            }
        }
    }

    // raises event 'onKeydown' when cursor is moved.
    var raiseKeydown = function (e) {
        if (local.settings.events.onKeydown && local.enabled) {
            var state = getInputState();
            var param = $.extend(e, state);
            local.settings.events.onKeydown.call($self, param);
        }
    }

    // raises event 'onKeyup' when cursor is moved.
    var raiseKeyup = function (e) {
        if (local.settings.events.onKeyup && local.enabled) {
            var state = getInputState();
            var param = $.extend(e, state);
            local.settings.events.onKeyup.call($self, param);
        }
    }

    var getInputState = function () {
        var preText = getPreText();
        var postText = $target.val().substring(preText.length);
        var offset = getCursorOffset(preText, postText);
        return {
            preText: preText,
            postText: postText,
            cursorOffset: offset
        };
    }

    // returns all text before cursor.
    var getPreText = function () {
        // Get Previous text
        var index = _target.selectionEnd;

        if (typeof index === 'number') {
            return _target.value.substring(0, index);
        }
        else if (document.selection) {
            var range = _target.createTextRange();
            range.moveStart('character', 0);
            range.moveEnd('textedit');
            return range.text;
        }
    }

    // returns offset of the cursor.
    var getCursorOffset = function (preText, postText) {
        return _caretLocator.getCursorOffset(preText, postText);
    };

    // changes function scope so that 'this' could point to source object
    var contextBinder = function (func, scope) {
        if (func.bind) {
            return func.bind(scope);
        } else {
            return function () {
                func.apply(scope, arguments[2]);
            };
        }
    };

    // trap all events that we are interested in.
  // keypress is depricated
    $target.on('keydown', raiseKeydown);
    $target.on('keyup', raiseKeyup);
    $target.on('keypress keydown keyup input click paste change', raiseCursorPositionChanged);
}
