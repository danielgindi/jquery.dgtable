'use strict';

import jQuery from 'jquery';

const $ = jQuery;

const hasComputedStyle = document.defaultView && document.defaultView.getComputedStyle;

const jQuerySupportsFractions = $ && $.fn.jquery >= '3';

const cssExpands = {
    'width': [
        'Left',
        'Right',
        'Width'
    ],
    'height': [
        'Top',
        'Bottom',
        'Height'
    ]
};

const sizeKeys = ['width', 'height'];

const CssUtil = {};

var generateSizeFunction = function (key, cssExpand, inner, outer) {

    return function () {
        var el = arguments[0];
        var value = arguments[1];

        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }

        if (!el) {
            return null;
        }

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var isBoxing = style['boxSizing'] === 'border-box';
        var size, border, padding;
        var includeMargins = outer && arguments[2] === true || arguments[1] === true;

        if (isBoxing || outer || inner) {
            border = parseFloat(style['border' + cssExpand[0] + 'Width'] || 0)
                + parseFloat(style['border' + cssExpand[1] + 'Width'] || 0);

            padding = parseFloat(style['padding' + cssExpand[0]] || 0)
                + parseFloat(style['padding' + cssExpand[1]] || 0);
        }

        var margin = includeMargins ?
            (parseFloat(style['margin' + cssExpand[0]] || 0)
            + parseFloat(style['margin' + cssExpand[1]] || 0)) : 0;

        if (value == undefined) {
            size = parseFloat(style[key]);

            if (isBoxing) {

                if (padding + border > size) {
                    size = padding + border;
                }

                if (outer) {
                    if (includeMargins) {
                        size += margin;
                    }
                }
                else if (inner) {
                    size -= border;
                }
                else {
                    size -= padding + border;
                }

            } else {

                if (outer) {
                    size += padding + border;

                    if (includeMargins) {
                        size += margin;
                    }
                }
                else if (inner) {
                    size += padding;
                }

            }

            return size;
        } else {
            value = value || 0;
            size = value;

            if (isBoxing) {

                if (outer) {
                    if (includeMargins) {
                        size -= margin;
                    }
                }
                else if (inner) {
                    size += border;
                }
                else {
                    size += padding + border;
                }

            } else {

                if (outer) {
                    size -= padding + border;

                    if (includeMargins) {
                        size -= margin;
                    }
                }
                else if (inner) {
                    size -= padding;
                }

                if (size < 0) {
                    size = 0;
                }
            }

            el.style[key] = size + 'px';

            return value;
        }
    };
};

for (var i = 0; i < sizeKeys.length; i++) {
    var key = sizeKeys[i];
    var cssExpand = cssExpands[key];

    if (jQuerySupportsFractions) {

        CssUtil[key] = (function (key) {
            return function () {
                return $.fn[key].apply(arguments[0], Array.prototype.slice.call(arguments, 1));
            };
        })(key);

        CssUtil['inner' + cssExpand[2]] = (function (key) {
            return function () {
                return $.fn[key].apply(arguments[0], Array.prototype.slice.call(arguments, 1));
            };
        })('inner' + cssExpand[2]);

        CssUtil['outer' + cssExpand[2]] = (function (key) {
            return function () {
                return $.fn[key].apply(arguments[0], Array.prototype.slice.call(arguments, 1));
            };
        })('outer' + cssExpand[2]);

    } else {

        CssUtil[key] = generateSizeFunction(key, cssExpand, false, false);
        CssUtil['inner' + cssExpand[2]] = generateSizeFunction(key, cssExpand, true, false);
        CssUtil['outer' + cssExpand[2]] = generateSizeFunction(key, cssExpand, false, true);

    }
}

// Remove that huge function from memory
generateSizeFunction = null;

export default CssUtil;