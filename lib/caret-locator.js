; function CaretLocator(element, options) {
    "use strict";

    const $target = (element instanceof jQuery) ? element : $(element);
    const _target = $target.get(0);
    const _nodeName = _target.nodeName.toUpperCase();

    const nodeTypes = {
        TextArea: "TEXTAREA",
        Input: "INPUT"
    };

    // input manager can only be attached to input or textarea elements.
    (function (nodeName) {
        if (nodeName != nodeTypes.TextArea && nodeName != nodeTypes.Input) {
            throw "unsupported element type '" + nodeName + "' for InputManager";
        }
    })(_nodeName);

    const defaults = {
        debug: false
    };

    const local = {
        marker: $("<span style='white-space: nowrap; padding: 0; margin: 0;'>\u200B</span>"),
        debug: false,
        settings: null
    };

    // save settings by overriding defaults
    local.settings = $.extend(true, {}, defaults, options);
    local.debug = local.settings.debug;

    var _twinContainerTextArea = $("<div></div>").css({
        'border-width': '1px',
        'border-style': 'solid',
        'overflow': 'hidden',
        'box-sizing': 'border-box',
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
        'position': 'absolute',
        'top': local.debug ? ($target.position().top) + 'px' : '0px',
        'left': local.debug ? ($target.position().left + $target.width() + 100) + 'px' : '-9999px',
        'visibility': local.debug ? 'visible' : 'hidden'
    });

    var _twinContainerInput = $('<div></div>').css({
        'border-width': '1px',
        'border-style': 'solid',
        'overflow': 'hidden',
        'box-sizing': 'border-box',
        'white-space': 'nowrap',
        'word-wrap': 'nowrap',
        'position': 'absolute',
        'top': local.debug ? ($target.position().top) + 'px' : '0px',
        'left': local.debug ? ($target.position().left + $target.width() + 100) + 'px' : '-9999px',
        'visibility': local.debug ? 'visible' : 'hidden'
    });

    var _cssTextArea = [
        'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
        'font-stretch', 'font-size-adjust', 'line-height',

        'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-style',
        'padding-top', 'padding-left', 'padding-bottom', 'padding-right',

        'box-sizing', 'width', 'height', 'overflow-x', 'overflow-y', 'tab-size', 'moz-tab-size',

        'line-height', 'letter-spacing', 'word-spacing', 'text-decoration', 'text-align',
        'text-transform', 'text-indent', 'direction'
    ];

    var _cssInput = [
        'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
        'padding-top', 'padding-left', 'padding-bottom', 'padding-right',
        'line-height', 'letter-spacing', 'word-spacing', 'text-decoration', 'text-align',
        'direction'
    ];

    this.setHighlight = function ($element, preText, postText, term) {
        $element.empty();

        if (term) {
            if (_nodeName == nodeTypes.TextArea) {
                var $css = $target.css(_cssTextArea);
                $element.css($css);
                $element.append(preText.substr(0, preText.length - term.length));
                $element.append($("<span style='background-color: yellow; color: transparent;'></span>").append(term));
                $element.append(postText);
                $element.css({ top: -1 * $target.scrollTop() });
            } else if (_nodeName == nodeTypes.Input) {
                var $css = $target.css(_cssInput);
                $element.css($css);
                $element.append(preText.substr(0, preText.length - term.length));
                $element.append($("<span style='background-color: yellow; color: transparent;'></span>").append(term));
                $element.append(postText);
            }
        }
    }

    this.unsetHighlight = function ($element) {
        $element.empty();
    }

    this.setDebug = function (enabled) {
        local.debug = !!enabled;
    }

    this.getCursorOffset = function (preText, postText) {
        var height = _target.clientHeight;
        var width = _target.clientWidth;

        if (_nodeName == nodeTypes.TextArea) {
            // Get textbox/textarea style.
            var $css = $target.css(_cssTextArea);

            $.extend($css, {
                'height': height - 2,
                'width': width - 2,
            });

            //create div as a copy and get cursor position.
            _twinContainerTextArea.appendTo($target.parent()).css($css).empty().append(preText, local.marker, postText);

            var position = { top: null, right: null, left: null, height: null, isRTL: false };
            var pos = local.marker.position();

            position.height = local.marker.height();
            position.top = pos.top - $target.scrollTop();
            position.bottom = height - position.top;

            position.isRTL = ($target.css('direction') === 'rtl' || _target.dir === 'rtl');
            position.left = pos.left
            position.right = width - pos.left;

            if (!local.debug) {
                _twinContainerTextArea.empty();
                _twinContainerTextArea.remove();
            }

            return position;
        }
        else if (_nodeName == nodeTypes.Input) {
            var height = _target.clientHeight;
            var width = _target.clientWidth;

            // Get textbox/textarea style.
            var $css = $target.css(_cssInput);

            $.extend(true, $css, {
                'height': height - 2,
                'min-width': width - 2,
            });

            //create div as a copy and get cursor position.
            _twinContainerInput.appendTo($target.parent()).css($css).empty().append(preText, local.marker, postText);

            var position = { top: null, right: null, left: null, height: null, isRTL: false };
            var pos = local.marker.position();

            position.height = local.marker.height();
            position.top = pos.top;
            position.bottom = height - position.top;

            position.isRTL = ($target.css('direction') === 'rtl' || _target.dir === 'rtl');
            position.left = pos.left - $target.scrollLeft();
            position.right = width - pos.left;

            if (!local.debug) {
                _twinContainerInput.empty();
                _twinContainerInput.remove();
            }

            return position;
        }
    }
}
