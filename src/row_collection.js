'use strict';

// Define class RowCollection
function RowCollection () {

    // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
    // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
    let collection = [];

    // Synthetically set the 'prototype'
    Object.assign(collection, RowCollection.prototype);

    // Call initializer
    collection.initialize.apply(collection, arguments);

    return collection;
}

// Inherit Array
RowCollection.prototype = [];

RowCollection.prototype.initialize = function (options) {

    options = options || {};

    /** @field {string} sortColumn */
    this.sortColumn = options.sortColumn == null ? [] : options.sortColumn;
};

/**
 * @param {Object|Object[]} rows - row or array of rows to add to this collection
 * @param {number?} at - position to insert rows at
 */
RowCollection.prototype.add = function (rows, at) {
    let isArray = ('splice' in rows && 'length' in rows), i, len;
    if (isArray) {
        if (typeof at === 'number') {
            for (i = 0, len = rows.length; i < len; i++) {
                this.splice(at++, 0, rows[i]);
            }
        } else {
            for (i = 0, len = rows.length; i < len; i++) {
                this.push(rows[i]);
            }
        }
    } else {
        if (typeof at === 'number') {
            this.splice(at, 0, rows);
        } else {
            this.push(rows);
        }
    }
};

/**
 * @param {Object|Object[]=} rows Row or array of rows to add to this collection
 */
RowCollection.prototype.reset = function (rows) {
    this.length = 0;
    if (rows) {
        this.add(rows);
    }
};

/**
 * @param {Function} filterFunc - Filtering function
 * @param {Object|null} args? - Options to pass to the function
 * @returns {RowCollection} success result
 */
RowCollection.prototype.filteredCollection = function (filterFunc, args) {
    if (filterFunc && args) {
        let rows = new RowCollection({ sortColumn: this.sortColumn });
        
        for (let i = 0, len = this.length, row; i < len; i++) {
            row = this[i];
            if (filterFunc(row, args)) {
                row['__i'] = i;
                rows.push(row);
            }
        }
        return rows;
    } else {
        return null;
    }
};

/**
 * @type {Function|null|undefined}
 */
RowCollection.prototype.onComparatorRequired = null;

/**
 * @type {Function|null|undefined}
 */
RowCollection.prototype.onSort = null;

let nativeSort = RowCollection.prototype.sort;

function getDefaultComparator(column, descending) {
    let columnName = column.column;
    let comparePath = column.comparePath || columnName;
    if (typeof comparePath === 'string') {
        comparePath = comparePath.split('.');
    }
    let pathLength = comparePath.length,
        hasPath = pathLength > 1,
        i;

    let lessVal = descending ? 1 : -1, moreVal = descending ? -1 : 1;
    return function(leftRow, rightRow) {
        let leftVal = leftRow[comparePath[0]],
            rightVal = rightRow[comparePath[0]];
        if (hasPath) {
            for (i = 1; i < pathLength; i++) {
                leftVal = leftVal && leftVal[comparePath[i]];
                rightVal = rightVal && rightVal[comparePath[i]];
            }
        }
        if (leftVal === rightVal) return 0;
        if (leftVal == null) return lessVal;
        if (rightVal == null) return moreVal;
        if (leftVal < rightVal) return lessVal;
        return moreVal;
    };
}

/**
 * @param {Boolean=false} silent
 * @returns {RowCollection} self
 */
RowCollection.prototype.sort = function (silent) {
    if (this.sortColumn.length) {
        let comparators = [], i, comparator;

        for (i = 0; i < this.sortColumn.length; i++) {
            comparator = null;
            if (this.onComparatorRequired) {
                comparator = this.onComparatorRequired(this.sortColumn[i].column, this.sortColumn[i].descending);
            }
            if (!comparator) {
                comparator = getDefaultComparator(this.sortColumn[i], this.sortColumn[i].descending);
            }
            comparators.push(comparator.bind(this));
        }

        if (comparators.length === 1) {
            nativeSort.call(this, comparators[0]);
        } else {
            let len = comparators.length,
                value;

            comparator = function(leftRow, rightRow) {
                for (i = 0; i < len; i++) {
                    value = comparators[i](leftRow, rightRow);
                    if (value !== 0) {
                        return value;
                    }
                }
                return value;
            };

            nativeSort.call(this, comparator);
        }

        if (!silent) {
            if (this.onSort) {
                this.onSort();
            }
        }
    }
    return this;
};

export default RowCollection;