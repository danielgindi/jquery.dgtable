/* eslint-env browser */

'use strict';

import jQuery from 'jquery';

const $ = jQuery;

const hasComputedStyle = document.defaultView && document.defaultView.getComputedStyle;

const jQuerySupportsFractions = $ && $.fn.jquery >= '3';

const cssExpands = {
    'width': [
        'Left',
        'Right',
        'Width',
    ],
    'height': [
        'Top',
        'Bottom',
        'Height',
    ],
};

const sizeKeys = ['width', 'height'];

const CssUtil = {};

let _isTransformSupported = null;

CssUtil.getSupportedTransform = () => {
    if (_isTransformSupported === null) {
        let prefixes = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
        let div = document.createElement('div');
        _isTransformSupported = false;
        for (let item of prefixes) {
            if (div && div.style[item] !== undefined) {
                _isTransformSupported = item;
                break;
            }
        }
    }
    return _isTransformSupported;
};

let generateSizeFunction = function (key, cssExpand, inner, outer) {

    return function () {
        let el = arguments[0];
        let value = arguments[1];

        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }

        if (!el) {
            return null;
        }

        let style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        let isBoxing = style['boxSizing'] === 'border-box';
        let size, border, padding;
        let includeMargins = outer && arguments[2] === true || arguments[1] === true;

        if (isBoxing || outer || inner) {
            border = parseFloat(style['border' + cssExpand[0] + 'Width'] || 0)
                + parseFloat(style['border' + cssExpand[1] + 'Width'] || 0);

            padding = parseFloat(style['padding' + cssExpand[0]] || 0)
                + parseFloat(style['padding' + cssExpand[1]] || 0);
        }

        let margin = includeMargins ?
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

let generatejQueryFunction = function (key) {
    return function () {
        let collection = arguments[0];
        if (!$.isArray(collection) && !(collection instanceof $)) {
            collection = [collection];
        }

        let ret = $.fn[key].apply(collection, Array.prototype.slice.call(arguments, 1));

        if (arguments.length > 1) {
            return this;
        }

        return ret;
    };
};

for (let i = 0; i < sizeKeys.length; i++) {
    let key = sizeKeys[i];
    let cssExpand = cssExpands[key];

    if (jQuerySupportsFractions) {

        CssUtil[key] = generatejQueryFunction(key);
        CssUtil['inner' + cssExpand[2]] = generatejQueryFunction('inner' + cssExpand[2]);
        CssUtil['outer' + cssExpand[2]] = generatejQueryFunction('outer' + cssExpand[2]);

    } else {

        CssUtil[key] = generateSizeFunction(key, cssExpand, false, false);
        CssUtil['inner' + cssExpand[2]] = generateSizeFunction(key, cssExpand, true, false);
        CssUtil['outer' + cssExpand[2]] = generateSizeFunction(key, cssExpand, false, true);

    }
}

// Remove that huge function from memory
generateSizeFunction = null;

export default CssUtil;
