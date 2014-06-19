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
/* global DGTable, _, Backbone */
DGTable.RowCollection = (function () {
    'use strict';

    // Define class RowCollection
    var RowCollection = function() {

        // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
        // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
        var collection = [];

        // Synthetically set the 'prototype'
        _.extend(collection, RowCollection.prototype);

        // Call initializer
        collection.initialize.apply(collection, arguments);

        return collection;
    };

    // Inherit Array
    RowCollection.prototype = [];

    // Add events model from Backbone
    _.extend(RowCollection.prototype, Backbone.Events);

    RowCollection.prototype.initialize = function(options) {

        options = options || {};

        /** @field {String} filterColumn */
        this.filterColumn = null;

        /** @field {String} filterString */
        this.filterString = null;

        /** @field {Boolean} filterCaseSensitive */
        this.filterCaseSensitive = false;

        /** @field {string} sortColumn */
        this.sortColumn = options.sortColumn == null ? [] : options.sortColumn;
    };

    /**
     * @param {Object|Object[]} rows Row or array of rows to add to this collection
     * @param {number?} at Position to insert rows. This will prevent the sort if it is active.
     */
    RowCollection.prototype.add = function (rows, at) {
        var isArray = ('splice' in rows && 'length' in rows), i, len;
        if (isArray) {
            if (at) {
                for (i = 0, len = rows.length; i < len; i++) {
                    this.splice(at++, 0, rows[i]);
                }
            } else {
                for (i = 0, len = rows.length; i < len; i++) {
                    this.push(rows[i]);
                }
            }
        } else {
            if (at) {
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
     * @param {string} columnName name of the column to filter on
     * @param {string} filter keyword to filter by
     * @param {boolean=false} caseSensitive is the filter case sensitive?
     * @returns {DGTable.RowCollection} success result
     */
    RowCollection.prototype.filteredCollection = function (columnName, filter, caseSensitive) {
        filter = filter.toString();
        if (filter && columnName != null) {
            var rows = new RowCollection({ sortColumn: this.sortColumn });
            this.filterColumn = columnName;
            this.filterString = filter;
            this.filterCaseSensitive = caseSensitive;
            for (var i = 0, len = this.length, row; i < len; i++) {
                row = this[i];
                if (this.shouldBeVisible(row)) {
                    row['__i'] = i;
                    rows.push(row);
                }
            }
            return rows;
        } else {
            this.filterColumn = null;
            this.filterString = null;
            return null;
        }
    };

    /**
     * @param {Array} row
     * @returns {boolean}
     */
    RowCollection.prototype.shouldBeVisible = function (row) {
        if (row && this.filterColumn) {
            var actualVal = row[this.filterColumn];
            if (actualVal == null) {
                return false;
            }
            actualVal = actualVal.toString();
            var filterVal = this.filterString;
            if (!this.filterCaseSensitive) {
                actualVal = actualVal.toUpperCase();
                filterVal = filterVal.toUpperCase();
            }
            return actualVal.indexOf(filterVal) !== -1;
        }
        return true;
    };

    (function(){
        var nativeSort = RowCollection.prototype.sort;

        function getDefaultComparator(column, descending) {
            var lessVal = descending ? 1 : -1, moreVal = descending ? -1 : 1;
            return function(leftRow, rightRow) {
                var col = column, leftVal = leftRow[col], rightVal = rightRow[col];
                return leftVal < rightVal ? lessVal : (leftVal > rightVal ? moreVal : 0);
            };
        }

        /**
         * @param {Boolean=false} silent
         * @returns {DGTable.RowCollection} self
         */
        RowCollection.prototype.sort = function(silent) {
            if (this.sortColumn.length) {
                var comparators = [], i, returnVal;
                for (i = 0; i < this.sortColumn.length; i++) {
                    returnVal = {};
                    this.trigger('requiresComparatorForColumn', returnVal, this.sortColumn[i].column, this.sortColumn[i].descending);
                    comparators.push(_.bind(returnVal.comparator || getDefaultComparator(this.sortColumn[i].column, this.sortColumn[i].descending), this));
                }
                if (comparators.length === 1) {
                    nativeSort.call(this, comparators[0]);
                } else {
                    var len = comparators.length,
                        value,
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
                    this.trigger('sort');
                }
            }
            return this;
        };
    })();

    return RowCollection;

})();