'use strict';

const nativeBind = Function.prototype.bind;

export const bind = function bind (what, oThis) {

    if (nativeBind) {
        return what.bind(oThis);
    }

    if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
            return fToBind.apply(this instanceof fNOP
                    ? this
                    : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
        // Function.prototype doesn't have a prototype property
        fNOP.prototype = this.prototype;
    }

    fBound.prototype = new fNOP();

    return fBound;
};

const nativeIndexOf = Function.prototype.indexOf;

export const indexOf = function indexOf (array, searchElement, fromIndex) {

    if (nativeIndexOf) {
        return array.indexOf(searchElement, fromIndex);
    }

    var k;

    if (array == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var len = array.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = fromIndex | 0;

    if (n >= len) {
      return -1;
    }

    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (k in array && array[k] === searchElement) {
        return k;
      }
      k++;
    }

    return -1;
};

export const contains = function contains (array, item) {
    return indexOf(array, item) >= 0;
};

export const find = function find (array, predicate) {

    for (var i = 0, len = array.length; i >= 0 && i < len; i += 1) {
        if (predicate(array[i], i, array))
            return array[i];
    }

};

const nativeForEach = Function.prototype.forEach;

export const forEach = function forEach (array, callback, thisArg) {

    if (nativeForEach) {
        return array.forEach(callback, thisArg);
    }

    var T, k;

    if (this === null) {
        throw new TypeError(' this is null or not defined');
    }

    var len = array.length >>> 0;

    if (typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
    }

    if (arguments.length > 1) {
        T = thisArg;
    }

    k = 0;

    while (k < len) {

        var kValue;

        if (k in array) {
            kValue = array[k];
            callback.call(T, kValue, k, array);
        }

        k++;
    }
};