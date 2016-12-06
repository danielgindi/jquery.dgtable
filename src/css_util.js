'use strict';

import jQuery from 'jquery';

const $ = jQuery;

var hasComputedStyle = document.defaultView && document.defaultView.getComputedStyle;

export const contentWidth = ($ && $.fn.jquery >= '3') ?
    function (el) { return $.fn.width.call([el]); } :
    function contentWidth (el) {
        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }
        if (!el) return 0;

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var size = parseFloat(style['width']);

        if (style['boxSizing'] === 'border-box') {
            var border = parseFloat(style['borderLeftWidth'] || 0) + parseFloat(style['borderRightWidth'] || 0);
            //noinspection UnnecessaryLocalVariableJS
            var padding = parseFloat(style['paddingLeft'] || 0) + parseFloat(style['paddingRight'] || 0);

            size -= padding;
            size -= border;
            if (size < 0) {
                size = 0;
            }
        }

        return size;
    };

export const contentHeight = ($ && $.fn.jquery >= '3') ?
    function (el) { return $.fn.height.call([el]); } :
    function contentHeight (el) {
        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }
        if (!el) return 0;

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var size = parseFloat(style['height']);

        if (style['boxSizing'] === 'border-box') {
            var border = parseFloat(style['borderTopWidth'] || 0) + parseFloat(style['borderBottomWidth'] || 0);
            //noinspection UnnecessaryLocalVariableJS
            var padding = parseFloat(style['paddingTop'] || 0) + parseFloat(style['paddingBottom'] || 0);

            size -= padding;
            size -= border;
            if (size < 0) {
                size = 0;
            }
        }

        return size;
    };

export const innerWidth = ($ && $.fn.jquery >= '3') ?
    function (el) { return $.fn.innerWidth.call([el]); } :
    function innerWidth (el) {v
        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }
        if (!el) return 0;

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var size = parseFloat(style['width']);
        var padding = parseFloat(style['paddingLeft'] || 0) + parseFloat(style['paddingRight'] || 0);

        if (style['boxSizing'] === 'border-box') {
            var border = parseFloat(style['borderLeftWidth'] || 0) + parseFloat(style['borderRightWidth'] || 0);
            if (padding + border > size) {
                size = padding + border;
            }
            size -= border;
        } else {
            size += padding;
        }

        return size;
    };

export const innerHeight = ($ && $.fn.jquery >= '3') ?
    function (el) { return $.fn.innerHeight.call([el]); } :
    function innerHeight (el) {
        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }
        if (!el) return 0;

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var size = parseFloat(style['height']);
        var padding = parseFloat(style['paddingTop'] || 0) + parseFloat(style['paddingBottom'] || 0);

        if (style['boxSizing'] === 'border-box') {
            var border = parseFloat(style['borderTopWidth'] || 0) + parseFloat(style['borderBottomWidth'] || 0);
            if (padding + border > size) {
                size = padding + border;
            }
            size -= border;
        } else {
            size += padding
        }

        return size;
    };

export const outerWidth = ($ && $.fn.jquery >= '3') ?
    function (el, includeMargins) { return $.fn.outerWidth.call([el], includeMargins); } :
    function outerWidth (el, includeMargins) {
        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }
        if (!el) return 0;

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var size = parseFloat(style['width']);
        var padding = parseFloat(style['paddingLeft'] || 0) + parseFloat(style['paddingRight'] || 0);
        var border = parseFloat(style['borderLeftWidth'] || 0) + parseFloat(style['borderRightWidth'] || 0);

        if (style['boxSizing'] === 'border-box') {
            if (padding + border > size) {
                size = padding + border;
            }
        } else {
            size += padding;
            size += border;
        }

        if (includeMargins) {
            size += parseFloat(style['marginLeft'] || 0);
            size += parseFloat(style['marginRight'] || 0);
        }

        return size;
    };

export const outerHeight = ($ && $.fn.jquery >= '3') ?
    function (el, includeMargins) { return $.fn.outerHeight.call([el], includeMargins); } :
    function outerHeight (el, includeMargins) {
        if (el && !(el instanceof Element) && 'length' in el) {
            el = el[0];
        }
        if (!el) return 0;

        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
        var size = parseFloat(style['height']);
        var padding = parseFloat(style['paddingTop'] || 0) + parseFloat(style['paddingBottom'] || 0);
        var border = parseFloat(style['borderTopWidth'] || 0) + parseFloat(style['borderBottomWidth'] || 0);

        if (style['boxSizing'] === 'border-box') {
            if (padding + border > size) {
                size = padding + border;
            }
        } else {
            size += padding;
            size += border;
        }

        if (includeMargins) {
            size += parseFloat(style['marginTop'] || 0);
            size += parseFloat(style['marginBottom'] || 0);
        }

        return size;
    };
