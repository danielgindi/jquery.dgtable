/*
The MIT License (MIT)

Copyright (c) 2014 Daniel Cohen Gindi (danielgindi@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* global DGTable */
DGTable.ColumnCollection = (function () {
    'use strict';

    // Define class RowCollection
    var ColumnCollection = function() {
        this.initialize.apply(this, arguments);
    };

    // Inherit Array
    ColumnCollection.prototype = [];

    ColumnCollection.prototype.initialize = function() {

    };

    /**
     * Get the column by this name
     * @param {String} column column name
     * @returns {Object} the column object
     */
    ColumnCollection.prototype.get = function(column) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i].name == column) {
                return this[i];
            }
        }
        return null;
    };

    /**
     * Get the index of the column by this name
     * @param {String} column column name
     * @returns {int} the index of this column
     */
    ColumnCollection.prototype.indexOf = function(column) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i].name == column) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Get the column by the specified order
     * @param {Number} order the column's order
     * @returns {Object} the column object
     */
    ColumnCollection.prototype.getByOrder = function(order) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i].order == order) {
                return this[i];
            }
        }
        return null;
    };

    /**
     * Normalize order
     * @returns {ColumnCollection} self
     */
    ColumnCollection.prototype.normalizeOrder = function() {
        var ordered = [], i;
        for (i = 0; i < this.length; i++) {
            ordered.push(this[i]);
        }
        ordered.sort(function(col1, col2){ return col1.order < col2.order ? -1 : (col1.order > col2.order ? 1 : 0); });
        for (i = 0; i < ordered.length; i++) {
            ordered[i].order = i;
        }
        return this;
    };

    /**
     * Get the array of visible columns, order by the order property
     * @returns {Array<Object>} ordered array of visible columns
     */
    ColumnCollection.prototype.getVisibleColumns = function() {
        var visible = [];
        for (var i = 0, column; i < this.length; i++) {
            column = this[i];
            if (column.visible) {
                visible.push(column);
            }
        }
        visible.sort(function(col1, col2){ return col1.order < col2.order ? -1 : (col1.order > col2.order ? 1 : 0); });
        return visible;
    };

    /**
     * @returns {int} maximum order currently in the array
     */
    ColumnCollection.prototype.getMaxOrder = function() {
        var order = 0;
        for (var i = 0, column; i < this.length; i++) {
            column = this[i];
            if (column.order > order) {
                order = column.order;
            }
        }
        return order;
    };

    /**
     * Move a column to a new spot in the collection
     * @param {Object} src the column to move
     * @param {Object} dest the destination column
     * @returns {ColumnCollection} self
     */
    ColumnCollection.prototype.moveColumn = function (src, dest) {
        if (src && dest) {
            var srcOrder = src.order, destOrder = dest.order, i, col;
            if (srcOrder < destOrder) {
                for (i = srcOrder + 1; i <= destOrder; i++) {
                    col = this.getByOrder(i);
                    col.order--;
                }
            } else {
                for (i = srcOrder - 1; i >= destOrder; i--) {
                    col = this.getByOrder(i);
                    col.order++;
                }
            }
            src.order = destOrder;
        }
        return this;
    };

    return ColumnCollection;

})();