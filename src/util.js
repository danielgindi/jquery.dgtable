'use strict';

const indexOf = Array.prototype.indexOf;

export const includes = function includes (array, item) {
    return indexOf.call(array, item) >= 0;
};

export const find = function find (array, predicate) {
    for (let i = 0, len = array.length; i >= 0 && i < len; i += 1) {
        if (predicate(array[i], i, array))
            return array[i];
    }
};
