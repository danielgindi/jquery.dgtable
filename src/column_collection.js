'use strict';

// Define class RowCollection
function ColumnCollection () {

    // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
    // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
    let collection = [];

    // Synthetically set the 'prototype'
    Object.assign(collection, ColumnCollection.prototype);

    // Call initializer
    collection.initialize.apply(collection, arguments);

    return collection;
}

// Inherit Array
ColumnCollection.prototype = [];

ColumnCollection.prototype.initialize = function () {

};

/**
 * Get the column by this name
 * @param {String} column column name
 * @returns {Object} the column object
 */
ColumnCollection.prototype.get = function (column) {
    for (let i = 0, len = this.length; i < len; i++) {
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
ColumnCollection.prototype.indexOf = function (column) {
    for (let i = 0, len = this.length; i < len; i++) {
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
ColumnCollection.prototype.getByOrder = function (order) {
    for (let i = 0, len = this.length; i < len; i++) {
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
ColumnCollection.prototype.normalizeOrder = function () {
    let ordered = [], i;
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
 * Get the array of columns, order by the order property
 * @returns {Array<Object>} ordered array of columns
 */
ColumnCollection.prototype.getColumns = function () {
    let cols = [];
    for (let i = 0, column; i < this.length; i++) {
        column = this[i];
        cols.push(column);
    }
    cols.sort((col1, col2) => col1.order < col2.order ? -1 : (col1.order > col2.order ? 1 : 0));
    return cols;
};

/**
 * Get the array of visible columns, order by the order property
 * @returns {Array<Object>} ordered array of visible columns
 */
ColumnCollection.prototype.getVisibleColumns = function () {
    let cols = [];
    for (let i = 0, column; i < this.length; i++) {
        column = this[i];
        if (column.visible) {
            cols.push(column);
        }
    }
    cols.sort((col1, col2) => col1.order < col2.order ? -1 : (col1.order > col2.order ? 1 : 0));
    return cols;
};

/**
 * @returns {int} maximum order currently in the array
 */
ColumnCollection.prototype.getMaxOrder = function () {
    let order = 0;
    for (let i = 0, column; i < this.length; i++) {
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
        let srcOrder = src.order, destOrder = dest.order, i, col;
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

export default ColumnCollection;