/* eslint-env browser */

'use strict';

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

export default CssUtil;
