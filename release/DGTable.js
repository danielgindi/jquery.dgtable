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
/* global jQuery, _, Backbone */
/*jshint -W018 */
(function (global, $) {
    'use strict';

    var userAgent = navigator.userAgent;
    var ieVersion = userAgent.indexOf('MSIE ') != -1 ? parseFloat(userAgent.substr(userAgent.indexOf('MSIE ') + 5)) : null;
    var hasIeTableDisplayBlockBug = ieVersion && ieVersion < 10;
    var hasIeDragAndDropBug = ieVersion && ieVersion < 10;
    var createElement = _.bind(document.createElement, document);

    /**
     * @class DGTable
     * @extends Backbone.View
     */
    var DGTable = Backbone.View.extend(
        /** @lends DGTable.prototype */
        {
            /** @expose */
            className: 'dgtable-wrapper',
            
            /** @expose */
            tagName: 'div',
			
			/** @expose */
            VERSION: '0.2.8',

            /**
             * @constructs
             * @expose
             * @param {INIT_OPTIONS?} options initialization options
             */
            initialize: function (options) {

                options = options || {};
                
                options.columns = options.columns || [];

                this._onMouseMoveResizeAreaBound = _.bind(this._onMouseMoveResizeArea, this);
                this._onEndDragColumnHeaderBound = _.bind(this._onEndDragColumnHeader, this);
                this._onTableScrolledHorizontallyBound = _.bind(this._onTableScrolledHorizontally, this);

                this.$el.on('dragend', this._onEndDragColumnHeaderBound);

                /**
                 * @private
                 * @field {Boolean} _tableSkeletonNeedsRendering */
                this._tableSkeletonNeedsRendering = true;

                /**
                 * @private
                 * @field {Boolean} _dataAppended */
                this._dataAppended = false;

                /**
                 * @private
                 * @field {Boolean} _virtualTable */
                this._virtualTable = options.virtualTable === undefined ? true : !!options.virtualTable;

                /**
                 * @private
                 * @field {Number} _rowsBufferSize */
                this._rowsBufferSize = options.rowsBufferSize || 10;

                /**
                 * @private
                 * @field {Number} _minColumnWidth */
                this._minColumnWidth = Math.max(options.minColumnWidth || 35, 0);

                /**
                 * @private
                 * @field {Number} _resizeAreaWidth */
                this._resizeAreaWidth = options.resizeAreaWidth || 8;

                /**
                 * @private
                 * @field {Boolean} _resizableColumns */
                this._resizableColumns = options.resizableColumns === undefined ? true : !!options.resizableColumns;

                /**
                 * @private
                 * @field {Boolean} _movableColumns */
                this._movableColumns = options.movableColumns === undefined ? true : !!options.movableColumns;

                /**
                 * @private
                 * @field {Number} _sortableColumns */
                this._sortableColumns = options.sortableColumns === undefined ? 1 : (parseInt(options.sortableColumns, 10) || 1);

                /**
                 * @private
                 * @field {Boolean} _adjustColumnWidthForSortArrow */
                this._adjustColumnWidthForSortArrow = options.adjustColumnWidthForSortArrow === undefined ? true : !!options.adjustColumnWidthForSortArrow;

                /**
                 * @private
                 * @field {Boolean} _convertColumnWidthsToRelative */
                this._convertColumnWidthsToRelative = options.convertColumnWidthsToRelative === undefined ? false : !!options.convertColumnWidthsToRelative;

                /**
                 * @private
                 * @field {String} _cellClasses */
                this._cellClasses = options.cellClasses === undefined ? '' : options.cellClasses;

                /**
                 * @private
                 * @field {String} _resizerClassName */
                this._resizerClassName = options.resizerClassName === undefined ? 'dgtable-resize' : options.resizerClassName;

                /**
                 * @private
                 * @field {String} _tableClassName */
                this._tableClassName = options.tableClassName === undefined ? 'dgtable' : options.tableClassName;

                /**
                 * @private
                 * @field {Boolean} _allowCellPreview */
                this._allowCellPreview = options.allowCellPreview === undefined ? true : options.allowCellPreview;

                /**
                 * @private
                 * @field {Boolean} _allowHeaderCellPreview */
                this._allowHeaderCellPreview = options.allowHeaderCellPreview === undefined ? true : options.allowHeaderCellPreview;

                /**
                 * @private
                 * @field {String} _cellPreviewClassName */
                this._cellPreviewClassName = options.cellPreviewClassName === undefined ? 'dgtable-cell-preview' : options.cellPreviewClassName;

                /**
                 * @private
                 * @field {Function(String,Boolean)Function(a,b)Boolean} _comparatorCallback */
                this._comparatorCallback = options.comparatorCallback === undefined ? null : options.comparatorCallback;

                /**
                 * @private
                 * @field {Boolean} _width */
                this._width = options.width === undefined ? DGTable.Width.NONE : options.width;

                /**
                 * @private
                 * @field {Boolean} _relativeWidthGrowsToFillWidth */
                this._relativeWidthGrowsToFillWidth = options.relativeWidthGrowsToFillWidth === undefined ? true : !!options.relativeWidthGrowsToFillWidth;

                /**
                 * @private
                 * @field {Boolean} _relativeWidthShrinksToFillWidth */
                this._relativeWidthShrinksToFillWidth = options.relativeWidthShrinksToFillWidth === undefined ? false : !!options.relativeWidthShrinksToFillWidth;

                /**
                 * @private
                 * @field {Function} _cellFormatter */
                this._cellFormatter = options.cellFormatter || function (val) {
                    return val;
                };
                
                /**
                 * @private
                 * @field {Function} _headerCellFormatter */
                this._headerCellFormatter = options.headerCellFormatter || function (val) {
                    return val;
                };
                
                var i, len, col, column, columnData, order;

                // Prepare columns
                var columns = new DGTable.ColumnCollection();
                for (i = 0, order = 0; i < options.columns.length; i++) {
                    columnData = options.columns[i];
                    column = this._initColumnFromData(columnData);
                    if (columnData.order !== undefined) {
                        if (columnData.order > order) {
                            order = columnData.order + 1;
                        }
                        column.order = columnData.order;
                    } else {
                        column.order = order++;
                    }
                    columns.push(column);
                }
                columns.normalizeOrder();

                this._columns = columns;
                this._visibleColumns = columns.getVisibleColumns();

                if (options.sortColumn === undefined) {
                    options.sortColumn = null;
                } else {
                    if (typeof options.sortColumn == 'string') {
                        if (!this._columns.get(options.sortColumn)) {
                            options.sortColumn = null;
                        } else {
                            options.sortColumn = [{ column: options.sortColumn, descending: false }];
                        }
                    } else if (options.sortColumn instanceof Array) {
                        var cols = [];
                        for (i = 0, len = options.sortColumn.length, column; i < len; i++) {
                            col = options.sortColumn[i];
                            col = col.column !== undefined ? col : { column: col, descending: false };
                            column = this._columns.get(col.column);
                            if (column && !_.contains(cols, column.name)) {
                                cols.push(column.name);
                            }
                            if (cols.length == this._sortableColumns || cols.length == this._visibleColumns.length) {
                                break;
                            }
                        }
                        options.sortColumn = cols;
                    } else if (typeof options.sortColumn == 'object') {
                        if (!this._columns.get(options.sortColumn.column)) {
                            options.sortColumn = null;
                        }
                    } else {
                        options.sortColumn = null;
                    }
                }

                /** @private
                 * @field {DGTable.RowCollection} _rows */
                this._rows = new DGTable.RowCollection({ sortColumn: options.sortColumn, columns: this.columns });
                this.listenTo(this._rows, 'sort', this.render)
                    .listenTo(this._rows, 'requiresComparatorForColumn', _.bind(function(returnVal, column, descending){
                        if (this._comparatorCallback) {
                            returnVal.comparator = this._comparatorCallback(column, descending);
                        }
                    }, this));

                /** @private
                 * @field {DGTable.RowCollection} _filteredRows */
                this._filteredRows = null;

                this._height = options.height;
                this._prevScrollTop = 0;

                /*
                    Setup hover mechanism.
                    We need this to be high performance, as there may be MANY cells to call this on, on creation and destruction.
                    Using native events to spare the overhead of jQuery's event binding, and even just the creation of the jQuery collection object.
                 */

                var self = this;

                /**
                 * @param {Event} evt
                 * @this {HTMLElement}
                 * */
                var hoverMouseOverHandler = function(evt) {
                    evt = evt || event;
                    var relatedTarget = evt.fromElement || evt.relatedTarget;
                    if (relatedTarget == this || jQuery.contains(this, relatedTarget)) return;
                    if (this['__previewEl'] && (relatedTarget == this['__previewEl'] || jQuery.contains(this['__previewEl'], relatedTarget))) return;
                    self._cellMouseOverEvent.call(self, this);
                };

                /**
                 * @param {Event} evt
                 * @this {HTMLElement}
                 * */
                var hoverMouseOutHandler = function(evt) {
                    evt = evt || event;
                    var relatedTarget = evt.toElement || evt.relatedTarget;
                    if (relatedTarget == this || jQuery.contains(this, relatedTarget)) return;
                    if (this['__previewEl'] && (relatedTarget == this['__previewEl'] || jQuery.contains(this['__previewEl'], relatedTarget))) return;
                    self._cellMouseOutEvent.call(self, this);
                };

                if ('addEventListener' in window) {

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverIn = function (el) {
                        if (!el['__hoverIn']) {
                            el.addEventListener('mouseover', el['__hoverIn'] = _.bind(hoverMouseOverHandler, el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._unhookCellHoverIn = function (el) {
                        if (el['__hoverIn']) {
                            el.removeEventListener('mouseover', el['__hoverIn']);
                            el['__hoverIn'] = null;
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverOut = function (el) {
                        if (!el['__hoverOut']) {
                            el.addEventListener('mouseout', el['__hoverOut'] = _.bind(hoverMouseOutHandler, el['__cell'] || el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._unhookCellHoverOut = function (el) {
                        if (el['__hoverOut']) {
                            el.removeEventListener('mouseout', el['__hoverOut']);
                            el['__hoverOut'] = null;
                        }
                        return this;
                    };

                } else {

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverIn = function (el) {
                        if (!el['__hoverIn']) {
                            el.attachEvent('mouseover', el['__hoverIn'] = _.bind(hoverMouseOverHandler, el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._unhookCellHoverIn = function (el) {
                        if (el['__hoverIn']) {
                            el.detachEvent('mouseover', el['__hoverIn']);
                            el['__hoverIn'] = null;
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverOut = function (el) {
                        if (!el['__hoverOut']) {
                            el.attachEvent('mouseout', el['__hoverOut'] = _.bind(hoverMouseOutHandler, el['__cell'] || el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el TD or TH
                     * @returns {DGTable} self
                     * */
                    this._unhookCellHoverOut = function (el) {
                        if (el['__hoverOut']) {
                            el.detachEvent('mouseout', el['__hoverOut']);
                            el['__hoverOut'] = null;
                        }
                        return this;
                    };

                }

            },
            
            /**
             * Detect column width mode
             * @private
             * @param {Number|String} width
             * @returns {Object} parsed width
             */
            _parseColumnWidth: function (width) {
                    
                var widthSize = parseFloat(width),
                    widthMode = COLUMN_WIDTH_MODE.AUTO; // Default
                    
                if (widthSize > 0) {
                    // Well, it's sure is not AUTO, as we have a value
                    
                    if (width == widthSize + '%') {
                        // It's a percentage!
                        
                        widthMode = COLUMN_WIDTH_MODE.RELATIVE;
                        widthSize /= 100;
                    } else if (widthSize > 0 && widthSize < 1) {
                        // It's a decimal value, as a relative value!
                        
                        widthMode = COLUMN_WIDTH_MODE.RELATIVE;
                    } else {
                        // It's an absolute size!
                            
                        if (widthSize < this._minColumnWidth) {
                            widthSize = this._minColumnWidth;
                        }
                        widthMode = COLUMN_WIDTH_MODE.ABSOLUTE;
                    }
                }
                
                return {width: widthSize, mode: widthMode};
            },

            /**
             * @private
             * @param {COLUMN_OPTIONS} columnData
             */
            _initColumnFromData: function(columnData) {
                
                var parsedWidth = this._parseColumnWidth(columnData.width);
            
                return {
                    name: columnData.name,
                    label: columnData.label === undefined ? columnData.name : columnData.label,
                    width: parsedWidth.width,
                    widthMode: parsedWidth.mode,
                    resizable: columnData.resizable === undefined ? true : columnData.resizable,
                    sortable: columnData.sortable === undefined ? true : columnData.sortable,
                    movable: columnData.movable === undefined ? true : columnData.movable,
                    visible: columnData.visible === undefined ? true : columnData.visible,
                    cellClasses: columnData.cellClasses === undefined ? this._cellClasses : columnData.cellClasses
                };
                
            },

            /**
             * Destroy, releasing all memory, events and DOM elements
             * @public
             * @expose
             */
            close: function () {
                if (this._$resizer) {
                    this._$resizer.remove();
                    this._$resizer = null;
                }
                if (this._$tbody) {
                    var trs = this._$tbody[0].childNodes;
                    for (var i = 0, len = trs.length; i < len; i++) {
                        this.trigger('rowDestroy', trs[i]);
                    }
                }
                this.remove();
                this._unbindHeaderEvents()._unhookCellEventsForTable();
                this._$table.unbind();
                this._$tbody.unbind();
                this.$el.unbind();
                this.unbind();
                if (this.workerListeners) {
                    for (var j = 0, worker; j < this.workerListeners.length; j++) {
                        worker = this.workerListeners[j];
                        worker.worker.removeEventListener('message', worker.listener, false);
                    }
                    this.workerListeners.length = 0;
                }
                this._rows.length = this._columns.length = 0;
                for (var prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        this[prop] = null;
                    }
                }
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _unhookCellEventsForTable: function() {
                if (this._$thead) {
                    for (var i = 0, rows = this._$thead[0].childNodes, rowCount = rows.length, rowToClean; i < rowCount; i++) {
                        rowToClean = rows[i];
                        for (var j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
                            this._unhookCellHoverIn(cells[j]);
                        }
                    }
                }
                if (this._$tbody) {
                    for (var i = 0, rows = this._$tbody[0].childNodes, rowCount = rows.length, rowToClean; i < rowCount; i++) {
                        rowToClean = rows[i];
                        for (var j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
                            this._unhookCellHoverIn(cells[j]);
                        }
                    }
                }
                return this;
            },

            /**
             * @private
             * @param {HTMLElement} rowToClean
             * @returns {DGTable} self
             */
            _unhookCellEventsForRow: function(rowToClean) {
                for (var i = 0, cells = rowToClean.childNodes, cellCount = cells.length; i < cellCount; i++) {
                    this._unhookCellHoverIn(cells[i]);
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @returns {DGTable} self
             */
            render: function () {
                if (this._tableSkeletonNeedsRendering === true) {
                    this._tableSkeletonNeedsRendering = false;

                    if (this._$tbody) {
                        this._prevScrollTop = this._$tbody[0].scrollTop;
                    }
                    
                    if (this._width == DGTable.Width.AUTO) {
                        // We need to do this to return to the specified widths instead. The arrows added to the column widths...
                        this._clearSortArrows();
                    }
                    
                    this.tableWidthChanged(true, false) // Take this chance to calculate required column widths
                        ._renderSkeleton(); // Actual render

                    var maxScrollTop = this._$tbody[0].scrollHeight - this._$tbody.height();
                    if (this._prevScrollTop > maxScrollTop) {
                        this._prevScrollTop = maxScrollTop;
                    }

                    this._$tbody[0].scrollTop = this._prevScrollTop;

                    if (this._virtualTable) {
                        this._$tbody.on('scroll', _.bind(this._onVirtualTableScrolled, this));
                        this._onVirtualTableScrolled(null, true);
                    }

                    this._updateTableWidth(true);

                    // Show sort arrows
                    for (var i = 0; i < this._rows.sortColumn.length; i++) {
                        this._showSortArrow(this._rows.sortColumn[i].column, this._rows.sortColumn[i].descending);
                    }
                    if (this._adjustColumnWidthForSortArrow && this._rows.sortColumn.length) {
                        this.tableWidthChanged(true);
                    }

                    this._dataAppended = false;

                    this.trigger('renderSkeleton');
                } else if (this._virtualTable) {
                    this._renderVirtualRows(this._prevScrollTop, this._$tbody[0].scrollTop);
                }
                this.trigger('render');
                return this;
            },

            /**
             * Add a column to the table
             * @public
             * @expose
             * @param {COLUMN_OPTIONS} columnData column properties
             * @param {String|Number} [before=-1] column name or order to be inserted before
             * @returns {DGTable} self
             */
            addColumn: function (columnData, before) {
                if (columnData && !this._columns.get(columnData.name)) {
                    var beforeColumn = null;
                    if (before !== undefined) {
                        beforeColumn = this._columns.get(before) || this._columns.getByOrder(before);
                    }

                    var column = this._initColumnFromData(columnData);
                    column.order = beforeColumn ? beforeColumn.order : (this._columns.getMaxOrder() + 1);

                    for (var i = this._columns.getMaxOrder(), to = column.order, col; i >= to ; i--) {
                        col = this._columns.getByOrder(i);
                        if (col) {
                            col.order++;
                        }
                    }

                    this._columns.push(column);
                    this._columns.normalizeOrder();

                    this._tableSkeletonNeedsRendering = true;
                    this._visibleColumns = this._columns.getVisibleColumns();
                    this.render();

                    this.trigger('addColumn', column.name);
                }
                return this;
            },

            /**
             * Remove a column from the table
             * @public
             * @expose
             * @param {String} column column name
             * @returns {DGTable} self
             */
            removeColumn: function (column) {
                var colIdx = this._columns.indexOf(column);
                if (colIdx > -1) {
                    this._columns.splice(colIdx, 1);
                    this._columns.normalizeOrder();

                    this._tableSkeletonNeedsRendering = true;
                    this._visibleColumns = this._columns.getVisibleColumns();
                    this.render();

                    this.trigger('removeColumn', column);
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @param {String} column Name of the column to filter on
             * @param {String} filter Check specified column for existence of this string
             * @param {Boolean} [caseSensitive=false] Use caseSensitive filtering
             * @returns {DGTable} self
             */
            filter: function (column, filter, caseSensitive) {
                var col = this._columns.get(column);
                if (col) {
                    var hasFilter = !!this._filteredRows;
                    if (this._filteredRows) {
                        this._filteredRows = null; // Release array memory
                    }
                    this._filteredRows = this._rows.filteredCollection(column, filter, caseSensitive);
                    if (hasFilter || this._filteredRows) {
                        this._tableSkeletonNeedsRendering = true;
                        this.render();
                        this.trigger('filter', column, filter, caseSensitive);
                    }
                }
                return this;
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _refilter: function() {
                if (this._filteredRows) {
                    this._filteredRows = null; // Release memory
                    this._filteredRows = this._rows.filteredCollection(this._rows.filterColumn, this._rows.filterString, this._rows.filterCaseSensitive);
                }
                return this;
            },

            /**
             * Set a new label to a column
             * @public
             * @expose
             * @param {String} column Name of the column
             * @param {String} label New label for the column
             * @returns {DGTable} self
             */
            setColumnLabel: function (column, label) {
                var col = this._columns.get(column);
                if (col) {
                    col.label = label === undefined ? col.name : label;

                    if (col.element) {
                        for (var i = 0; i < col.element[0].firstChild.childNodes.length; i++) {
                            var node = col.element[0].firstChild.childNodes[i];
                            if(node.nodeType === 3) {
                                node.textContent = col.label;
                                break;
                            }
                        }
                    }
                }
                return this;
            },

            /**
             * Move a column to a new position
             * @public
             * @expose
             * @param {String|Number} src Name or position of the column to be moved
             * @param {String|Number} dest Name of the column currently in the desired position, or the position itself
             * @returns {DGTable} self
             */
            moveColumn: function (src, dest) {
                var col, destCol;
                if (typeof src === 'string') {
                    col = this._columns.get(src);
                } else if (typeof src === 'number') {
                    col = this._visibleColumns[src];
                }
                if (typeof dest === 'string') {
                    destCol = this._columns.get(dest);
                } else if (typeof dest === 'number') {
                    destCol = this._visibleColumns[dest];
                }

                if (col && destCol && src !== dest) {
                    var srcOrder = col.order, destOrder = destCol.order;

                    this._visibleColumns = this._columns.moveColumn(col, destCol).getVisibleColumns();

                    if (this._virtualTable) {
                        this._tableSkeletonNeedsRendering = true;
                        this.render();
                    } else {
                        var th = this._$thead.find('>tr>th');
                        var beforePos = srcOrder < destOrder ? destOrder + 1 : destOrder,
                            fromPos = srcOrder;
                        th[0].parentNode.insertBefore(th[fromPos], th[beforePos]);

                        var srcWidth = this._visibleColumns[srcOrder];
                        srcWidth = (srcWidth.actualWidthConsideringScrollbarWidth || srcWidth.actualWidth) + 'px';
                        var destWidth = this._visibleColumns[destOrder];
                        destWidth = (destWidth.actualWidthConsideringScrollbarWidth || destWidth.actualWidth) + 'px';

                        var tbodyChildren = this._$tbody[0].childNodes;
                        for (var i = 0, count = tbodyChildren.length, tr; i < count; i++) {
                            tr = tbodyChildren[i];
                            if (tr.nodeType !== 1) continue;
                            tr.insertBefore(tr.childNodes[fromPos], tr.childNodes[beforePos]);
                            tr.childNodes[destOrder].firstChild.style.width = destWidth;
                            tr.childNodes[srcOrder].firstChild.style.width = srcWidth;
                        }
                    }

                    this.trigger('moveColumn', col.name, srcOrder, destOrder);
                }
                return this;
            },

            /**
             * Re-sort the table
             * @public
             * @expose
             * @param {String} column Name of the column to sort on
             * @param {Boolean=} descending Sort in descending order
             * @param {Boolean} [add=false] Should this sort be on top of the existing sort? (For multiple column sort)
             * @returns {DGTable} self
             */
            sort: function (column, descending, add) {
                var col = this._columns.get(column), i;
                if (col) {
                    var currentSort = this._rows.sortColumn;

                    if (currentSort.length && currentSort[currentSort.length - 1].column == column) {
                        // Recognize current descending mode, if currently sorting by this column
                        descending = descending === undefined ? !currentSort[currentSort.length - 1].descending : descending;
                    }

                    if (add) { // Add the sort to current sort stack

                        for (i = 0; i < currentSort.length; i++) {
                            if (currentSort[i].column == col.name) {
                                if (i < currentSort.length - 1) {
                                    currentSort.length = 0;
                                } else {
                                    currentSort.splice(currentSort.length - 1, 1);
                                }
                                break;
                            }
                        }
                        if ((this._sortableColumns > 0 /* allow manual sort when disabled */ && currentSort.length >= this._sortableColumns) || currentSort.length >= this._visibleColumns.length) {
                            currentSort.length = 0;
                        }

                    } else { // Sort only by this column
                        currentSort.length = 0;
                    }

                    // Default to ascending
                    descending = descending === undefined ? false : descending;

                    // Set the required column in the front of the stack
                    currentSort.push({ column: col.name, descending: !!descending });

                    this._rows.sortColumn = currentSort;

                    this._clearSortArrows();
                    for (i = 0; i < currentSort.length; i++) {
                        this._showSortArrow(currentSort[i].column, currentSort[i].descending);
                    }
                    if (this._adjustColumnWidthForSortArrow) {
                        this.tableWidthChanged(true);
                    }

                    if (!this._virtualTable) {
                        this._tableSkeletonNeedsRendering = true;
                    }
                    this._rows.sort(!!this._filteredRows);
                    this._refilter();
                    if (this._filteredRows) {
                        this.render();
                    }

                    // Build output for event, with option names that will survive compilers
                    var sorts = [];
                    for (i = 0; i < currentSort.length; i++) {
                        sorts.push({ 'column': currentSort[i].column, 'descending': currentSort[i].descending });
                    }
                    this.trigger('sort', sorts);
                }
                return this;
            },

            /**
             * Show or hide a column
             * @public
             * @expose
             * @param {String} column Unique column name
             * @param {Boolean} visible New visibility mode for the column
             * @returns {DGTable} self
             */
            setColumnVisible: function (column, visible) {
                var col = this._columns.get(column);
                if (col && !!col.visible != !!visible) {
                    col.visible = !!visible;
                    this._tableSkeletonNeedsRendering = true;
                    this._visibleColumns = this._columns.getVisibleColumns();
                    this.render();
                    this.trigger(visible ? 'showColumn' : 'hideColumn', column);
                }
                return this;
            },

            /**
             * Get the visibility mode of a column
             * @public
             * @expose
             * @returns {Boolean} true if visible
             */
            isColumnVisible: function (column) {
                var col = this._columns.get(column);
                if (col) {
                    return col.visible;
                }
                return false;
            },

            /**
             * Globally set the minimum column width
             * @public
             * @expose
             * @param {Number} minColumnWidth Minimum column width
             * @returns {DGTable} self
             */
            setMinColumnWidth: function (minColumnWidth) {
                minColumnWidth = Math.max(minColumnWidth, 0);
                if (this._minColumnWidth != minColumnWidth) {
                    this._minColumnWidth = minColumnWidth;
                    this.tableWidthChanged(true);
                }
                return this;
            },

            /**
             * Get the current minimum column width
             * @public
             * @expose
             * @returns {Number} Minimum column width
             */
            getMinColumnWidth: function () {
                return this._minColumnWidth;
            },

            /**
             * Set the limit on concurrent columns sorted
             * @public
             * @expose
             * @param {Number} sortableColumns How many sortable columns to allow?
             * @returns {DGTable} self
             */
            setSortableColumns: function (sortableColumns) {
                if (this._sortableColumns != sortableColumns) {
                    this._sortableColumns = sortableColumns;
                    if (this._$table) {
                        var th = this._$table.find('thead>tr>th');
                        for (var i = 0; i < th.length; i++) {
                            $(th[0])[(this._sortableColumns > 0 && this._visibleColumns[i].sortable) ? 'addClass' : 'removeClass']('sortable');
                        }
                    }
                }
                return this;
            },

            /**
             * Get the limit on concurrent columns sorted
             * @public
             * @expose
             * @returns {Number} How many sortable columns are allowed?
             */
            getSortableColumns: function () {
                return this._sortableColumns;
            },

            /**
             * @public
             * @expose
             * @param {Boolean} movableColumns are the columns movable?
             * @returns {DGTable} self
             */
            setMovableColumns: function (movableColumns) {
                movableColumns = !!movableColumns;
                if (this._movableColumns != movableColumns) {
                    this._movableColumns = movableColumns;
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @returns {Boolean} are the columns movable?
             */
            getMovableColumns: function () {
                return this._movableColumns;
            },

            /**
             * @public
             * @expose
             * @param {Boolean} resizableColumns are the columns resizable?
             * @returns {DGTable} self
             */
            setResizableColumns: function (resizableColumns) {
                resizableColumns = !!resizableColumns;
                if (this._resizableColumns != resizableColumns) {
                    this._resizableColumns = resizableColumns;
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @returns {Boolean} are the columns resizable?
             */
            getResizableColumns: function () {
                return this._resizableColumns;
            },

            /**
             * @public
             * @expose
             * @param {Function(String,Boolean)Function(a,b)Boolean} comparatorCallback a callback function that returns the comparator for a specific column
             * @returns {DGTable} self
             */
            setComparatorCallback: function (comparatorCallback) {
                if (this._comparatorCallback != comparatorCallback) {
                    this._comparatorCallback = comparatorCallback;
                }
                return this;
            },

            /**
             * Set a new width to a column
             * @public
             * @expose
             * @param {String} column name of the column to resize
             * @param {Number|String} width new column as pixels, or relative size (0.5, 50%)
             * @returns {DGTable} self
             */
            setColumnWidth: function (column, width) {

                var parsedWidth = this._parseColumnWidth(width);

                var col = this._columns.get(column);
                if (col) {
                    var oldWidth = this._serializeColumnWidth(col);

                    col.width = parsedWidth.width;
                    col.widthMode = parsedWidth.mode;

                    var newWidth = this._serializeColumnWidth(col);

                    if (oldWidth != newWidth) {
                        this.tableWidthChanged(true); // Calculate actual sizes
                    }

                    this.trigger('setColumnWidth', col.name, oldWidth, newWidth);
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @param {String} column name of the column
             * @returns {String?} the serialized width of the specified column, or null if column not found
             */
            getColumnWidth: function (column) {
                var col = this._columns.get(column);
                if (col) {
                    return this._serializeColumnWidth(col);
                }
                return null;
            },

            /**
             * @public
             * @expose
             * @returns {SERIALIZED_COLUMN} configuration for all columns
             */
            getColumnConfig: function (column) {
                var col = this._columns.get(column);
                if (col) {
                    return {
                        order: col.order,
                        width: this._serializeColumnWidth(col),
                        visible: col.visible
                    };
                }
                return null;
            },

            /**
             * Returns a config object for the columns, to allow saving configurations for next time...
             * @public
             * @expose
             * @returns {Object} configuration for all columns
             */
            getColumnsConfig: function () {
                var config = {};
                for (var i = 0; i < this._columns.length; i++) {
                    config[this._columns[i].name] = this.getColumnConfig(this._columns[i]);
                }
                return config;
            },

            /**
             * Returns an array of the currently sorted columns
             * @public
             * @expose
             * @returns {Array.<SERIALIZED_COLUMN_SORT>} configuration for all columns
             */
            getSortedColumns: function () {
                var sorted = [];
                for (var i = 0, sort; i < this._rows.sortColumn.length; i++) {
                    sort = this._rows.sortColumn[i];
                    sorted.push({column: sort.column, descending: sort.descending});
                }
                return sorted;
            },

            /**
             * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
             * @public
             * @expose
             * @param {Number} row index of the row
             * @param {String} column name of the column
             * @returns {String} HTML string for the specified cell
             */
            getHtmlForCell: function (row, column) {
                if (row < 0 || row > this._rows.length - 1) return null;
                if (!this._columns.get(column)) return null;

                return this._cellFormatter(this._rows[row][column], column);
            },

            /**
             * Returns the row data for a specific row
             * @public
             * @expose
             * @param {Number} row index of the row
             * @returns {Object} Row data
             */
            getDataForRow: function (row) {
                if (row < 0 || row > this._rows.length - 1) return null;
                return this._rows[row];
            },

            /**
             * Returns the row data for a specific row
             * @public
             * @expose
             * @param {Number} row index of the filtered row
             * @returns {Object} Row data
             */
            getDataForFilteredRow: function (row) {
                if (row < 0 || row > (this._filteredRows || this._rows).length - 1) return null;
                return (this._filteredRows || this._rows)[row];
            },

            /**
             * @private
             * @param {Element} el
             * @returns {Number} width
             */
            _horizontalPadding: function(el) {
                return ((parseFloat($.css(el, 'padding-left')) || 0) +
                    (parseFloat($.css(el, 'padding-right')) || 0));
            },

            /**
             * @private
             * @param {Element} el
             * @returns {Number} width
             */
            _horizontalBorderWidth: function(el) {
                return ((parseFloat($.css(el, 'border-left')) || 0) +
                    (parseFloat($.css(el, 'border-right')) || 0));
            },

            /**
             * @private
             * @returns {Number} width
             */
            _calculateWidthAvailableForColumns: function() {
                // Changing display mode briefly, to prevent taking in account the  parent's scrollbar width when we are the cause for it
                var oldDisplay;
                if (this._$table) {
                    oldDisplay = this._$table[0].style.display;
                    this._$table[0].style.display = 'none';
                }
                var detectedWidth = this.$el.width();
                if (this._$table) {
                    this._$table[0].style.display = oldDisplay;
                }

                var $thisWrapper, $table, $thead;

                if (!this._$table) {

                    $thisWrapper = $('<div></div>').addClass(this.className).css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px' });
                    $table = $('<table></table>').css({'position': 'absolute', top: '-9999px', 'visibility': 'hidden'}).addClass(this._tableClassName);
                    $thead = $('<thead></thead>');
                    var $tr = $('<tr></tr>');
                    for (var i = 0; i < this._visibleColumns.length; i++) {
                        $tr.append($('<th><div></div></th>'));
                    }
                    $table.append($thead.append($tr)).appendTo($thisWrapper.appendTo(document.body));

                } else {
                    $table = this._$table;
                    $thead = this._$thead;
                }

                var isRtl = $table.css('direction') == 'rtl';

                // We need this, because jQuery figures out "CSS" width using offsetWidth, which produces wrong results for TH elements
                var curCss = window.getComputedStyle ? function(el, css) {
                    var computed = window.getComputedStyle(el, null);
                    return computed ? computed.getPropertyValue(css) : null;
                } : function(el, css) {
                    var computed = el.currentStyle;
                    return computed ? computed[css] : null;
                };
                var realCssWidth = function (el) {
                    var value = curCss(el, 'width');
                    if (value === 'auto') { // old browsers like IE8
                        return (parseFloat($(el).css('width')) || 0) + 1;
                    }
                    return parseFloat(value) || 0;
                };

                detectedWidth -= this._horizontalBorderWidth($table[0]);
                var $ths = $thead.find('>tr>th'), leftBorderWidth;
                for (var i = 0, $th, $div, thBorderBox; i < $ths.length; i++) {
                    $div = $($ths[i].firstChild);
                    $th = $($ths[i]);

                    // Borders are collapsed...
                    if (isRtl) {
                        leftBorderWidth = Math.max(parseFloat($th.css('border-right-width')) || 0, i > 0 ? (parseFloat($($ths[i - 1]).css('border-left-width')) || 0) : 0);
                    } else {
                        leftBorderWidth = Math.max(parseFloat($th.css('border-left-width')) || 0, i > 0 ? (parseFloat($($ths[i - 1]).css('border-right-width')) || 0) : 0);
                    }

                    thBorderBox = $th.css('boxSizing') === 'border-box';
                    detectedWidth -= leftBorderWidth + // TH's border-left-width
                                    ($div.outerWidth() - $div.width()) + // TH>DIV's extra size of padding+border
                                    (realCssWidth($th[0]) + (thBorderBox ? 0 : this._horizontalPadding($th[0])) - $div.outerWidth()); // TH>DIV's margins + TH's padding
                }

                if (isRtl) {
                    // Subtract left border of the last TH
                    detectedWidth -= parseFloat($($ths[$ths.length - 1]).css('border-left-width')) || 0;
                } else {
                    // Subtract right border of the last TH
                    detectedWidth -= parseFloat($($ths[$ths.length - 1]).css('border-right-width')) || 0;
                }

                if ($thisWrapper) {
                    $thisWrapper.remove();
                }

                return detectedWidth;
            },

            /**
             * Notify the table that its width has changed
             * @public
             * @expose
             * @returns {DGTable} self
             */
            tableWidthChanged: (function () {
            
                var getTextWidth = function(text) {
                    var table = $('<table><thead><tr><th>' + text + '</th></tr></thead></table>')
                            .css({'position': 'absolute', top: '-9999px', 'visibility': 'hidden'}).addClass(this._tableClassName),
                        th = table.find('>thead>tr>th');
                    th.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden'});
                    table.appendTo(document.body);
                    var width = th.width();
                    table.remove();
                    table = null; // Release memory
                    return width;
                };
                
                var lastDetectedWidth = null;
                
                /**
                 * @public
                 * @param {Boolean} [forceUpdate=false]
                 * @param {Boolean} [renderColumns=true]
                 * @returns {DGTable} self
                 */
                return function(forceUpdate, renderColumns) {

                    var detectedWidth = this._calculateWidthAvailableForColumns(),
                        sizeLeft = detectedWidth,
                        relatives = 0;
                        
                    if (sizeLeft != lastDetectedWidth || forceUpdate) {
                        lastDetectedWidth = detectedWidth;

                        var width, absWidthTotal = 0, changedColumnIndexes = [], i, col, totalRelativePercentage = 0;

                        for (i = 0; i < this._columns.length; i++) {
                            this._columns[i].actualWidthConsideringScrollbarWidth = null;
                        }

                        for (i = 0; i < this._visibleColumns.length; i++) {
                            col = this._visibleColumns[i];
                            if (col.widthMode == COLUMN_WIDTH_MODE.ABSOLUTE) {
                                width = col.width;
                                width += col.arrowProposedWidth || 0; // Sort-arrow width
                                if (width < this._minColumnWidth) {
                                    width = this._minColumnWidth;
                                }
                                sizeLeft -= width;
                                absWidthTotal += width;

                                // Update actualWidth
                                if (width !== col.actualWidth) {
                                    col.actualWidth = width;
                                    changedColumnIndexes.push(i);
                                }
                            } else if (col.widthMode == COLUMN_WIDTH_MODE.AUTO) {
                                width = _.bind(getTextWidth, this)(col.label) + 20;
                                width += col.arrowProposedWidth || 0; // Sort-arrow width
                                if (width < this._minColumnWidth) {
                                    width = this._minColumnWidth;
                                }
                                sizeLeft -= width;
                                absWidthTotal += width;

                                // Update actualWidth
                                if (width !== col.actualWidth) {
                                    col.actualWidth = width;
                                    if (!this._convertColumnWidthsToRelative) {
                                        changedColumnIndexes.push(i);
                                    }
                                }
                            } else if (col.widthMode == COLUMN_WIDTH_MODE.RELATIVE) {
                                totalRelativePercentage += col.width;
                                relatives++;
                            }
                        }

                        // Normalize relative sizes if needed
                        if (this._convertColumnWidthsToRelative) {
                            for (i = 0; i < this._visibleColumns.length; i++) {
                                col = this._visibleColumns[i];
                                if (col.widthMode === COLUMN_WIDTH_MODE.AUTO) {
                                    col.widthMode = COLUMN_WIDTH_MODE.RELATIVE;
                                    sizeLeft += col.actualWidth;
                                    col.width = col.actualWidth / absWidthTotal;
                                    totalRelativePercentage += col.width;
                                    relatives++;
                                }
                            }
                        }

                        // Normalize relative sizes if needed
                        if (relatives && ((totalRelativePercentage < 1 && this._relativeWidthGrowsToFillWidth) ||
                                        (totalRelativePercentage > 1 && this._relativeWidthShrinksToFillWidth))) {
                            for (i = 0; i < this._visibleColumns.length; i++) {
                                col = this._visibleColumns[i];
                                if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                    col.width /= totalRelativePercentage;
                                }
                            }
                        }

                        detectedWidth = sizeLeft; // Use this as the space to take the relative widths out of

                        for (i = 0; i < this._visibleColumns.length; i++) {
                            col = this._visibleColumns[i];
                            if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                width = Math.round(detectedWidth * col.width);
                                if (width < this._minColumnWidth) {
                                    width = this._minColumnWidth;
                                }
                                sizeLeft -= width;
                                relatives--;

                                // Take care of rounding errors
                                if (relatives === 0 && sizeLeft === 1) { // Take care of rounding errors
                                    width++;
                                    sizeLeft--;
                                }
                                if (sizeLeft === -1) {
                                    width--;
                                    sizeLeft++;
                                }

                                // Update actualWidth
                                if (width !== col.actualWidth) {
                                    col.actualWidth = width;
                                    changedColumnIndexes.push(i);
                                }
                            }
                        }

                        this._visibleColumns[this._visibleColumns.length - 1].actualWidthConsideringScrollbarWidth = this._visibleColumns[this._visibleColumns.length - 1].actualWidth - (this._scrollbarWidth || 0);

                        if (renderColumns || renderColumns === undefined) {
                            for (i = 0; i < changedColumnIndexes.length; i++) {
                                this._resizeColumnElements(changedColumnIndexes[i]);
                            }
                        }
                    }
                    
                    return this;
                };
            })(),

            /**
             * Notify the table that its height has changed
             * @public
             * @expose
             * @returns {DGTable} self
             */
            tableHeightChanged: function () {
                var self = this,
                    height = this.$el.innerHeight() - (parseFloat(this._$table.css('border-top-width')) || 0) - (parseFloat(this._$table.css('border-bottom-width')) || 0);
                if (height != self._height) {
                    self._height = height;
                    if (self._$tbody) {
                        self._$tbody[0].style.height = self._height - self._$thead.outerHeight() + 'px';
                    }
                    if (self._virtualTable) {
                        self._tableSkeletonNeedsRendering = true;
                        self.render();
                    }
                }
                return self;
            },

            /**
             * Add rows to the table
             * @public
             * @expose
             * @param {Object[]} data array of rows to add to the table
             * @returns {DGTable} self
             */
            addRows: function (data) {
                if (data) {
                    this.scrollTop = this.$el.find('.table').scrollTop();
                    var oldRowCount = this._rows.length;
                    this._dataAppended = true;
                    this._rows.add(data);
                    if (this._virtualTable) {
                        this._refilter();
                        if (oldRowCount === 0 && (this._filteredRows || this._rows).length) {
                            this._tableSkeletonNeedsRendering = true;
                        }
                        this.render();
                    } else {
                        if (this._filteredRows) {
                            var filteredCount = this._filteredRows.length;
                            this._refilter();
                            if (!this._filteredRows || this._filteredRows.length != filteredCount) {
                                this._tableSkeletonNeedsRendering = true;
                                this.render();
                            }
                        } else if (this._$tbody) {
                            var tr, div, td, bodyFragment,
                                allowCellPreview = this._allowCellPreview,
                                visibleColumns = this._visibleColumns,
                                cellFormatter = this._cellFormatter;
                                
                            bodyFragment = document.createDocumentFragment();

                            var oldTrCount = this._$tbody[0].childNodes.length;

                            for (var i = 0, rowData, colIndex, column, colCount = this._visibleColumns.length, rowCount = data.length;
                                 i < rowCount;
                                 i++) {
                                rowData = data[i];
                                tr = createElement('tr');
                                tr['_rowIndex'] = i;
                                
                                for (colIndex = 0; colIndex < colCount; colIndex++) {
                                    column = visibleColumns[colIndex];
                                    div = createElement('div');
                                    div.style.width = (column.actualWidthConsideringScrollbarWidth || column.actualWidth) + 'px';
                                    div.innerHTML = cellFormatter(rowData[column.name], column.name);
                                    td = createElement('td');
                                    if (column.cellClasses) {
                                        td.className = column.cellClasses;
                                    }
                                    if (allowCellPreview) {
                                        this._hookCellHoverIn(td);
                                    }
                                    td.appendChild(div);
                                    tr.appendChild(td);
                                }

                                this.trigger('rowCreate', oldTrCount + i, oldRowCount + i, tr, rowData);

                                bodyFragment.appendChild(tr);
                            }
                            this._$tbody[0].appendChild(bodyFragment);
                            this._updateLastCellWidthFromScrollbar();
                        }
                    }
                    this.trigger('addRows', data.length, false);
                }
                return this;
            },

            /**
             * Removes a row from the table
             * @public
             * @expose
             * @param {Number} row index
             * @param {Boolean=true} render
             * @returns {DGTable} self
             */
            removeRow: function(row, render) {
                if (row < 0 || row > this._rows.length - 1) return null;
                this._rows.splice(row, 1);
                render = (render === undefined) ? true : !!render;
                if (this._filteredRows) {
                    this._filteredRows = this._refilter();
                    this._tableSkeletonNeedsRendering = true;
                    if (render) {
                        this.render();
                    }
                }
                if (render) {
                    if (this._virtualTable) {
                        this.render();
                    } else {
                        if (this._$tbody) {
                            this._$tbody[0].childNodes.removeChild(this._$tbody[0].childNodes[row]);
                            this._updateLastCellWidthFromScrollbar();
                            this._updateTableWidth(true);
                        }
                        this.trigger('render');
                    }
                }
                return this;
            },

            /**
             * Replace the whole dataset
             * @public
             * @expose
             * @param {Object[]} data array of rows to add to the table
             * @returns {DGTable} self
             */
            setRows: function (data) {
                this.scrollTop = this.$el.find('.table').scrollTop();
                this._rows.reset(data);
                this._refilter();
                this._tableSkeletonNeedsRendering = true;
                this.render().trigger('addRows', data.length, true);
                return this;
            },

            /**
             * Creates a URL representing the data in the specified element.
             * This uses the Blob or BlobBuilder of the modern browsers.
             * The url can be used for a Web Worker.
             * @public
             * @expose
             * @param {string} id Id of the element containing your data
             * @returns {string?} the url, or null if not supported
             */
            getUrlForElementContent: function (id) {
                var blob,
                    el = document.getElementById(id);
                if (el) {
                    var data = el.textContent;
                    if (typeof Blob === 'function') {
                        blob = new Blob([data]);
                    } else {
                        var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MozBlobBuilder || global.MSBlobBuilder;
                        if (!BlobBuilder) {
                            return null;
                        }
                        var builder = new BlobBuilder();
                        builder.append(data);
                        blob = builder.getBlob();
                    }
                    return (global.URL || global.webkitURL).createObjectURL(blob);
                }
                return null;
            },

            /**
             * @public
             * @expose
             * @returns {Boolean} A value indicating whether Web Workers are supported
             */
            isWorkerSupported: function() {
                return global['Worker'] instanceof Function;
            },

            /**
             * Creates a Web Worker for updating the table.
             * @public
             * @expose
             * @param {string} url Url to the script for the Web Worker
             * @returns {Worker?} the Web Worker, or null if not supported
             * @param {Boolean=true} start if true, starts the Worker immediately
             */
            createWebWorker: function (url, start) {
                if (this.isWorkerSupported()) {
                    var self = this;
                    var worker = new Worker(url);
                    var listener = function (evt) {
                        if (evt.data.append) {
                            self.addRows(evt.data.rows);
                        } else {
                            self.setRows(evt.data.rows);
                        }
                    };
                    worker.addEventListener('message', listener, false);
                    if (!this.workerListeners) {
                        this.workerListeners = [];
                    }
                    this.workerListeners.push({worker: worker, listener: listener});
                    if (start || start === undefined) {
                        worker.postMessage(null);
                    }
                    return worker;
                }
                return null;
            },

            /**
             * Unbinds a Web Worker from the table, stopping updates.
             * @public
             * @expose
             * @param {Worker} worker the Web Worker
             * @returns {DGTable} self
             */
            unbindWebWorker: function (worker) {
                if (this.workerListeners) {
                    for (var j = 0; j < this.workerListeners.length; j++) {
                        if (this.workerListeners[j].worker == worker) {
                            worker.removeEventListener('message', this.workerListeners[j].listener, false);
                            this.workerListeners.splice(j, 1);
                            j--;
                        }
                    }
                }
                return this;
            },

            /**
             * Abort cell preview (called from within a cellPreview event)
             * @expose
             * @public
             * @returns {DGTable} self
             */
            abortCellPreview: function() {
                this._abortCellPreview = true;
                return this;
            },

            /**
             * @param {jQuery.Event} evt
             * @param {Boolean?} forceUpdate
             */
            _onVirtualTableScrolled: function (evt, forceUpdate) {
                if (forceUpdate === true || this._prevScrollTop !== this._$tbody[0].scrollTop) {
                    var firstVisibleRow = parseInt(this._$tbody[0].scrollTop / this._virtualRowHeight, 10);
                    var firstRenderedRow = firstVisibleRow - this._rowsBufferSize;
                    if (firstRenderedRow < 0) {
                        firstRenderedRow = 0;
                    }
                    this._virtualRowRange.prevFirst = this._virtualRowRange.first;
                    this._virtualRowRange.prevLast = this._virtualRowRange.last;
                    this._virtualRowRange.first = firstRenderedRow;
                    this._virtualRowRange.last = firstVisibleRow + this._virtualVisibleRows + this._rowsBufferSize;
                    var rows = this._filteredRows || this._rows;
                    if (this._virtualRowRange.last > rows.length) {
                        this._virtualRowRange.last = rows.length;
                        this._virtualRowRange.first = Math.max(0, this._virtualRowRange.last - this._virtualVisibleRows - this._rowsBufferSize * 2);
                    }
                    this._renderVirtualRows(this._prevScrollTop, this._$tbody[0].scrollTop);
                }
            },

            /**
             * @param {jQuery.Event} evt
             */
            _onTableScrolledHorizontally: function (evt) {
                this._$thead[0].scrollLeft = this._$tbody[0].scrollLeft;
            },

            /**previousElementSibling
             * Reverse-calculate the column to resize from mouse position
             * @private
             * @param {jQuery.Event} e jQuery mouse event
             * @returns {String} name of the column which the mouse is over, or null if the mouse is not in resize position
             */
            _getColumnByResizePosition: function (e) {

                var rtl = this._isTableRtl();

                var $th = $(e.target).closest('th,div.' + this._cellPreviewClassName), th = $th[0];
                if (th['__cell']) {
                    th = th['__cell'];
                    $th = $(th);
                }

                var previousElementSibling = $th[0].previousSibling;
                while (previousElementSibling && previousElementSibling.nodeType != 1) {
                    previousElementSibling = previousElementSibling.previousSibling;
                }

                var firstCol = !previousElementSibling;

                var mouseX = (e.originalEvent.pageX || e.originalEvent.clientX) - $th.offset().left;

                if (rtl) {
                    if (!firstCol && $th.outerWidth() - mouseX <= this._resizeAreaWidth / 2) {
                        return previousElementSibling.columnName;
                    } else if (mouseX <= this._resizeAreaWidth / 2) {
                        return th.columnName;
                    }
                } else {
                    if (!firstCol && mouseX <= this._resizeAreaWidth / 2) {
                        return previousElementSibling.columnName;
                    } else if ($th.outerWidth() - mouseX <= this._resizeAreaWidth / 2) {
                        return th.columnName;
                    }
                }

                return null;
            },

            /**
             * @param {jQuery.Event} e event
             */
            _onMouseMoveColumnHeader: function (e) {
                if (this._resizableColumns) {
                    var col = this._getColumnByResizePosition(e);
                    var th = $(e.target).closest('th,div.' + this._cellPreviewClassName)[0];
                    if (!col || !this._columns.get(col).resizable) {
                        th.style.cursor = '';
                    } else {
                        th.style.cursor = 'e-resize';
                    }
                }
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onMouseLeaveColumnHeader: function (e) {
                var th = $(e.target).closest('th,div.' + this._cellPreviewClassName)[0];
                th.style.cursor = '';
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onClickColumnHeader: function (e) {
                if (!this._getColumnByResizePosition(e)) {
                    var th = $(e.target).closest('th,div.' + this._cellPreviewClassName)[0];
                    if (this._sortableColumns) {
                        var column = this._columns.get(th.columnName);
                        if (column && column.sortable) {
                            this.sort(th.columnName, undefined, true);
                        }
                    }
                }
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onStartDragColumnHeader: function (e) {
                var col = this._getColumnByResizePosition(e), column;
                if (col) {
                    column = this._columns.get(col);
                    if (!this._resizableColumns || !column || !column.resizable) {
                        return false;
                    }

                    var rtl = this._isTableRtl();

                    if (this._$resizer) {
                        $(this._$resizer).remove();
                    }
                    this._$resizer = $('<div></div>')
                        .addClass(this._resizerClassName)
                        .css({
                            'position': 'absolute',
                            'display': 'block',
                            'z-index': -1,
                            'visibility': 'hidden',
                            'width': '2px',
                            'background': '#000',
                            'opacity': 0.7
                        })
                        .appendTo(this.$el);

                    var selectedTh = column.element,
                        commonAncestor = this._$resizer.parent();

                    var posCol = selectedTh.offset(), posRelative = commonAncestor.offset();
                    if (ieVersion == 8) {
                        posCol = selectedTh.offset(); // IE8 bug, first time it receives zeros...
                    }
                    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
                    posRelative.top += parseFloat(commonAncestor.css('border-top-width')) || 0;
                    posCol.left -= posRelative.left;
                    posCol.top -= posRelative.top;
                    posCol.top -= parseFloat(selectedTh.css('border-top-width')) || 0;
                    var resizerWidth = this._$resizer.outerWidth();
                    if (rtl) {
                        posCol.left -= Math.ceil((parseFloat(selectedTh.css('border-left-width')) || 0) / 2);
                        posCol.left -= Math.ceil(resizerWidth / 2);
                    } else {
                        posCol.left += selectedTh.outerWidth();
                        posCol.left += Math.ceil((parseFloat(selectedTh.css('border-right-width')) || 0) / 2);
                        posCol.left -= Math.ceil(resizerWidth / 2);
                    }
                    var height = this._$table.height() - (this._$table.offset().top - selectedTh.offset().top);

                    this._$resizer
                        .css({
                            'z-index': '10',
                            'visibility': 'visible',
                            'left': posCol.left,
                            'top': posCol.top,
                            'height': height
                        })
                        [0].columnName = selectedTh[0].columnName;
                    try { this._$resizer[0].style.zIndex = ''; } catch (err) { }

                    $(document).on('mousemove', this._onMouseMoveResizeAreaBound);
                    $(document).on('mouseup', this._onEndDragColumnHeaderBound);

                    e.preventDefault();

                } else if (this._movableColumns) {

                    var th = $(e.target).closest('th,div.' + this._cellPreviewClassName);
                    column = this._columns.get(th[0].columnName);
                    if (column && column.movable) {
                        th[0].style.opacity = 0.35;
                        this._dragId = Math.random() * 0x9999999; // Recognize this ID on drop
                        e.originalEvent.dataTransfer.setData('text', JSON.stringify({dragId: this._dragId, column: column.name}));
                    } else {
                        e.preventDefault();
                    }

                } else {

                    e.preventDefault();

                }

                return undefined;
            },

            /**
             * @private
             * @param {MouseEvent} e event
             */
            _onMouseMoveResizeArea: function (e) {
                var column = this._columns.get(this._$resizer[0].columnName);
                var rtl = this._isTableRtl();

                var selectedTh = column.element,
                    commonAncestor = this._$resizer.parent();
                var posCol = selectedTh.offset(), posRelative = commonAncestor.offset();
                posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
                posCol.left -= posRelative.left;
                var resizerWidth = this._$resizer.outerWidth();

                var actualX = e.pageX - posRelative.left;
                var minX = posCol.left;
                if (rtl) {
                    minX += selectedTh.outerWidth();
                    minX -= Math.ceil((parseFloat(selectedTh.css('border-right-width')) || 0) / 2);
                    minX -= Math.ceil(resizerWidth / 2);
                    minX -= this._minColumnWidth;
                    minX -= this._horizontalPadding(selectedTh[0]);
                    if (actualX > minX) {
                        actualX = minX;
                    }
                } else {
                    minX += Math.ceil((parseFloat(selectedTh.css('border-right-width')) || 0) / 2);
                    minX -= Math.ceil(resizerWidth / 2);
                    minX += this._minColumnWidth;
                    minX += this._horizontalPadding(selectedTh[0]);
                    if (actualX < minX) {
                        actualX = minX;
                    }
                }

                this._$resizer.css('left', actualX + 'px');
            },

            /**
             * @private
             * @param {Event} e event
             */
            _onEndDragColumnHeader: function (e) {
                if (!this._$resizer) {
                    e.target.style.opacity = null;
                } else {
                    $(document).off('mousemove', this._onMouseMoveResizeAreaBound);
                    $(document).off('mouseup', this._onEndDragColumnHeaderBound);

                    var column = this._columns.get(this._$resizer[0].columnName);
                    var rtl = this._isTableRtl();

                    var selectedTh = column.element,
                        commonAncestor = this._$resizer.parent();
                    var posCol = selectedTh.offset(), posRelative = commonAncestor.offset();
                    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
                    posCol.left -= posRelative.left;
                    var resizerWidth = this._$resizer.outerWidth();

                    var actualX = e.pageX - posRelative.left;
                    var baseX = posCol.left, minX = posCol.left;
                    var width = 0;
                    if (rtl) {
                        actualX += this._horizontalPadding(selectedTh[0]);
                        baseX += selectedTh.outerWidth();
                        baseX -= Math.ceil((parseFloat(selectedTh.css('border-right-width')) || 0) / 2);
                        baseX -= Math.ceil(resizerWidth / 2);
                        minX = baseX;
                        minX -= this._minColumnWidth;
                        if (actualX > minX) {
                            actualX = minX;
                        }
                        width = baseX - actualX;
                    } else {
                        actualX -= this._horizontalPadding(selectedTh[0]);
                        baseX += Math.ceil((parseFloat(selectedTh.css('border-right-width')) || 0) / 2);
                        baseX -= Math.ceil(resizerWidth / 2);
                        minX = baseX;
                        minX += this._minColumnWidth;
                        if (actualX < minX) {
                            actualX = minX;
                        }
                        width = actualX - baseX;
                    }

                    this._$resizer.remove();
                    this._$resizer = null;

                    var sizeToSet = width;

                    if (column.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                        var detectedWidth = this._calculateWidthAvailableForColumns(),
                            sizeLeft = detectedWidth;

                        for (var i = 0, col; i < this._visibleColumns.length; i++) {
                            col = this._visibleColumns[i];
                            if (col.widthMode != COLUMN_WIDTH_MODE.RELATIVE) {
                                sizeLeft -= col.actualWidth;
                            }
                        }

                        sizeToSet = width / sizeLeft;
                        sizeToSet *= 100;
                        sizeToSet += '%';
                    }

                    this.setColumnWidth(column.name, sizeToSet);
                }
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onDragEnterColumnHeader: function (e) {
                if (this._movableColumns) {
                    var dataTransferred = e.originalEvent.dataTransfer.getData('text');
                    if (dataTransferred) {
                        dataTransferred = JSON.parse(dataTransferred);
                    }
                    else {
                        dataTransferred = null; // WebKit does not provide the dataTransfer on dragenter?..
                    }

                    var th = $(e.target).closest('th,div.' + this._cellPreviewClassName);
                    if (!dataTransferred ||
                        (this._dragId == dataTransferred.dragId && th.columnName !== dataTransferred.column)) {

                        var column = this._columns.get(th[0].columnName);
                        if (column && (column.movable || column != this._visibleColumns[0])) {
                            $(th).addClass('drag-over');
                        }
                    }
                }
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onDragOverColumnHeader: function (e) {
                e.preventDefault();
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onDragLeaveColumnHeader: function (e) {
                var th = $(e.target).closest('th,div.' + this._cellPreviewClassName);
                if ( ! $(th[0].firstChild)
                       .has(e.originalEvent.relatedTarget).length ) {
                    th.removeClass('drag-over');
                }
            },

            /**
             * @private
             * @param {jQuery.Event} e event
             */
            _onDropColumnHeader: function (e) {
                e.preventDefault();
                var dataTransferred = JSON.parse(e.originalEvent.dataTransfer.getData('text'));
                var th = $(e.target).closest('th,div.' + this._cellPreviewClassName);
                if (this._movableColumns && dataTransferred.dragId == this._dragId) {
                    var srcColName = dataTransferred.column,
                        destColName = th[0].columnName,
                        srcCol = this._columns.get(srcColName),
                        destCol = this._columns.get(destColName);
                    if (srcCol && destCol && srcCol.movable && (destCol.movable || destCol != this._visibleColumns[0])) {
                        this.moveColumn(srcColName, destColName);
                    }
                }
                $(th).removeClass('drag-over');
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _clearSortArrows: function () {
                if (this._$table) {
                    var sortedColumns = this._$table.find('>thead>tr>th.sorted');
                    var arrows = sortedColumns.find('>div>.sort-arrow');
                    _.forEach(arrows, _.bind(function(arrow){
                        var col = this._columns.get(arrow.parentNode.parentNode.columnName);
                        if (col) {
                            col.arrowProposedWidth = 0;
                        }
                    }, this));
                    arrows.remove();
                    sortedColumns.removeClass('sorted').removeClass('desc');
                }
                return this;
            },

            /**
             * @private
             * @param {String} column the name of the sort column
             * @param {Boolean} descending table is sorted descending
             * @returns {DGTable} self
             */
            _showSortArrow: function (column, descending) {

                var col = this._columns.get(column);
                var arrow = createElement('span');
                arrow.className = 'sort-arrow';

                col.element.addClass(descending ? 'sorted desc' : 'sorted');
                col.element[0].firstChild.insertBefore(arrow, col.element[0].firstChild.firstChild);

                if (col.widthMode != COLUMN_WIDTH_MODE.RELATIVE && this._adjustColumnWidthForSortArrow) {
                    col.arrowProposedWidth = arrow.scrollWidth + (parseFloat($(arrow).css('margin-right')) || 0) + (parseFloat($(arrow).css('margin-left')) || 0);
                }

                return this;
            },

            /**
             * @private
             * @param {Number} cellIndex index of the column in the DOM
             * @returns {DGTable} self
             */
            _resizeColumnElements: function (cellIndex) {
                var headers = this._$table.find('>thead>tr>th');
                var col = this._columns.get(headers[cellIndex].columnName);

                if (col) {
                    headers[cellIndex].firstChild.style.width = col.actualWidth + 'px';

                    var width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';
                    var tbodyChildren = this._$tbody[0].childNodes;
                    for (var i = this._virtualTable ? 1 : 0, count = tbodyChildren.length - (this._virtualTable ? 1 : 0), tr; i < count; i++) {
                        tr = tbodyChildren[i];
                        if (tr.nodeType !== 1) continue;
                        tr.childNodes[cellIndex].firstChild.style.width = width;
                    }

                    this._updateTableWidth(true);
                }

                return this;
            },

            /**
             * @returns {DGTable} self
             * */
            _unbindHeaderEvents: function() {
                if (this._$table) {
                    this._$table.find('>thead>tr>th')
                        .off('mousemove')
                        .off('mouseleave')
                        .off('dragstart')
                        .off('selectstart')
                        .off('click')
                        .find('>div')
                        .off('dragenter')
                        .off('dragover')
                        .off('dragleave')
                        .off('drop');
                }
                return this;
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _renderSkeleton: function () {
                var self = this;
                var topRowHeight = 0;

                if (self._virtualScrollTopRow) {
                    topRowHeight = parseFloat(self._virtualScrollTopRow.style.height);
                }

                self._unbindHeaderEvents()._unhookCellEventsForTable();

                var i, len, rowData, colIndex, column, colCount, rowCount, div, tr, th, td, allowCellPreview = this._allowCellPreview, allowHeaderCellPreview = this._allowHeaderCellPreview;

                var headerRow = createElement('tr'), ieDragDropHandler;
                if (hasIeDragAndDropBug) {
                    ieDragDropHandler = function(evt) {
                        evt.preventDefault();
                        this.dragDrop();
                        return false;
                    };
                }
                for (i = 0; i < self._visibleColumns.length; i++) {
                    column = self._visibleColumns[i];
                    if (column.visible) {
                        div = createElement('div');
                        div.style.width = column.actualWidth + 'px';
                        div.innerHTML = this._headerCellFormatter(column.label, column.name);
                        th = createElement('th');
                        th.draggable = true;
                        if (self._sortableColumns && column.sortable) th.className = 'sortable';
                        th.columnName = column.name;
                        if (allowCellPreview && allowHeaderCellPreview) {
                            this._hookCellHoverIn(th);
                        }
                        th.appendChild(div);
                        headerRow.appendChild(th);

                        self._visibleColumns[i].element = $(th);

                        $(th).on('mousemove', _.bind(self._onMouseMoveColumnHeader, self))
                            .on('mouseleave', _.bind(self._onMouseLeaveColumnHeader, self))
                            .on('dragstart', _.bind(self._onStartDragColumnHeader, self))
                            .on('click', _.bind(self._onClickColumnHeader, self));
                        $(div).on('dragenter', _.bind(self._onDragEnterColumnHeader, self))
                            .on('dragover', _.bind(self._onDragOverColumnHeader, self))
                            .on('dragleave', _.bind(self._onDragLeaveColumnHeader, self))
                            .on('drop', _.bind(self._onDropColumnHeader, self));

                        if (hasIeDragAndDropBug) {
                            $(th).on('selectstart', _.bind(ieDragDropHandler, th));
                        }
                    }
                }

                if (self._$table && self._virtualTable) {
                    self._$tbody.off('scroll');
                    self._$table.remove();
                    if (self._$tbody) {
                        var trs = self._$tbody[0].childNodes;
                        for (i = 0, len = trs.length; i < len; i++) {
                            this.trigger('rowDestroy', trs[i]);
                        }
                    }
                }

                if (self.$el.css('position') === 'static') {
                    self.$el.css('position', 'relative');
                }

                var table, thead, tbody;

                if (self._virtualTable || !self._$table) {

                    var fragment = document.createDocumentFragment();
                    table = createElement('table');
                    table.className = self._tableClassName;
                    fragment.appendChild(table);

                    thead = createElement('thead');
                    thead.style.display = 'block';
                    if (hasIeTableDisplayBlockBug) {
                        $(thead).css({
                            'float': self.$el.css('direction') === 'rtl' ? 'right' : 'left',
                            'clear': 'both'
                        });
                    }
                    table.appendChild(thead);

                    if (!this._height) {
                        this._height = this.$el.innerHeight() - (parseFloat($(table).css('border-top-width')) || 0) - (parseFloat($(table).css('border-bottom-width')) || 0);
                    }

                    tbody = createElement('tbody');
                    tbody.style.height = self._height - $(thead).outerHeight() + 'px';
                    tbody.style.display = 'block';
                    tbody.style.overflowY = 'auto';
                    tbody.style.overflowX = 'hidden';
                    if (hasIeTableDisplayBlockBug) {
                        $(tbody).css({
                            'float': self.$el.css('direction') === 'rtl' ? 'right' : 'left',
                            'clear': 'both'
                        });
                    }
                    if (self._width == DGTable.Width.SCROLL) {
                        thead.style.overflowX = 'hidden';
                        tbody.style.overflowX = 'auto';
                    }
                    table.appendChild(tbody);

                    self.el.appendChild(fragment);

                    self._$table = $(table);
                    self._$tbody = $(tbody);
                    self._$thead = $(thead);
                } else {
                    table = self._$table[0];
                    tbody = self._$tbody[0];
                    thead = self._$thead[0];
                }

                if (self._virtualTable && !self._virtualRowHeight) {
                    var createDummyRow = function() {
                        var tr = createElement('tr'),
                            td = tr.appendChild(createElement('td')),
                            div = td.appendChild(createElement('div'));
                        div.innerHTML = '0';
                        tr.style.visibility = 'hidden';
                        tr.style.position = 'absolute';
                        return tr;
                    };

                    var tr1 = tbody.appendChild(createDummyRow()),
                        tr2 = tbody.appendChild(createDummyRow()),
                        tr3 = tbody.appendChild(createDummyRow());

                    self._virtualRowHeight = $(tr2).outerHeight();
                    tbody.removeChild(tr1);
                    tbody.removeChild(tr2);
                    tbody.removeChild(tr3);
                    self._virtualVisibleRows = parseInt((self._height - $(thead).outerHeight()) / self._virtualRowHeight, 10);
                }

                var rows = self._filteredRows || self._rows, isDataFiltered = !!self._filteredRows;

                if (self._virtualTable) {
                    if (self._virtualRowRange && self._virtualRowRange.last - self._virtualRowRange.first >= self._virtualVisibleRows) {
                        self._virtualRowRange.prevFirst = self._virtualRowRange.prevFirst != self._virtualRowRange.first ? self._virtualRowRange.prevFirst : self._virtualRowRange.first;
                        self._virtualRowRange.prevLast = self._virtualRowRange.prevLast != self._virtualRowRange.last ? self._virtualRowRange.prevLast : self._virtualRowRange.last;
                        if (self._virtualRowRange.last > rows.length) {
                            self._virtualRowRange.last = rows.length;
                            self._virtualRowRange.first = Math.max(0, self._virtualRowRange.last - self._virtualVisibleRows - self._rowsBufferSize * 2);
                        }
                    } else {
                        var last = self._virtualVisibleRows + self._rowsBufferSize;
                        if (last > rows.length) {
                            last = rows.length;
                        }
                        self._virtualRowRange = {
                            first: 0,
                            last: last,
                            prevFirst: 0,
                            prevLast: last
                        };
                    }
                }

                var bodyFragment = document.createDocumentFragment();

                if (self._virtualTable) {
                    // Build first row (for virtual table top scroll offset)
                    tr = self._virtualScrollTopRow = document.createElement('tr');
                    tr.style.height = topRowHeight + 'px';
                    bodyFragment.appendChild(tr);
                }

                // Build visible rows
                var firstDisplayedRow,
                    lastDisplayedRow;

                if (self._virtualTable) {
                    firstDisplayedRow = self._virtualRowRange.first;
                    lastDisplayedRow = self._virtualRowRange.last;
                } else {
                    firstDisplayedRow = 0;
                    lastDisplayedRow = rows.length;
                }

                var visibleColumns = self._visibleColumns,
                    cellFormatter = self._cellFormatter;
                
                for (i = firstDisplayedRow, colCount = visibleColumns.length, rowCount = rows.length;
                     i < rowCount && i < lastDisplayedRow;
                     i++) {
                    rowData = rows[i];
                    tr = document.createElement('tr');
                    tr['_rowIndex'] = i;
                    for (colIndex = 0; colIndex < colCount; colIndex++) {
                        column = visibleColumns[colIndex];
                        div = document.createElement('div');
                        div.style.width = column.actualWidth + 'px';
                        div.innerHTML = cellFormatter(rowData[column.name], column.name);
                        td = document.createElement('td');
                        if (column.cellClasses) td.className = column.cellClasses;
                        if (allowCellPreview) {
                            this._hookCellHoverIn(td);
                        }
                        td.appendChild(div);
                        tr.appendChild(td);
                    }

                    bodyFragment.appendChild(tr);

                    this.trigger('rowCreate', i, isDataFiltered ? rowData['__i'] : i, tr, rowData);
                }

                if (self._virtualTable) {
                    // Build last row (for virtual table bottom scroll offset)
                    tr = self._virtualScrollBottomRow = document.createElement('tr');
                    tr.style.height = (self._virtualRowHeight * Math.max(0, rows.length - self._virtualVisibleRows - self._rowsBufferSize) - topRowHeight) + 'px';
                    bodyFragment.appendChild(tr);
                }

                // Populate THEAD
                try { thead.innerHTML = ''; } catch (e) { /* IE8 */ thead.textContent = ''; }
                thead.appendChild(headerRow);

                if (self._virtualTable) {
                    tbody.style.height = self._height - $(thead).outerHeight() + 'px';
                }

                // Populate TBODY
                try { tbody.innerHTML = ''; } catch (e) { /* IE8 */ tbody.textContent = ''; }
                tbody.appendChild(bodyFragment);

                self._updateLastCellWidthFromScrollbar(true);

                if (self._virtualTable) {
                    self._adjustVirtualTableScrollHeight();
                }

                return self;
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _updateLastCellWidthFromScrollbar: function(force) {
                // Calculate scrollbar's width and reduce from lat column's width
                var scrollbarWidth = this._$tbody[0].offsetWidth - this._$tbody[0].clientWidth;
                if (scrollbarWidth != this._scrollbarWidth || force) {
                    this._scrollbarWidth = scrollbarWidth;
                    for (var i = 0; i < this._columns.length; i++) {
                        this._columns[i].actualWidthConsideringScrollbarWidth = null;
                    }

                    if (this._scrollbarWidth > 0) {
                        var lastColIndex = this._visibleColumns.length - 1;
                        this._visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth = this._visibleColumns[lastColIndex].actualWidth - this._scrollbarWidth;
                        var lastColWidth = this._visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth + 'px';
                        var tbodyChildren = this._$tbody[0].childNodes;
                        for (var i = this._virtualTable ? 1 : 0, count = tbodyChildren.length - (this._virtualTable ? 1 : 0), tr; i < count; i++) {
                            tr = tbodyChildren[i];
                            if (tr.nodeType !== 1) continue;
                            tr.childNodes[lastColIndex].firstChild.style.width = lastColWidth;
                        }
                    }
                }
                return this;
            },

            /**
             * Add/remove rows from the DOM, or replace data in the current rows
             * @private
             * @param {Number} prevScrollTop previous scrollTop value in pixels
             * @param {Number} scrollTop current scrollTop value in pixels
             */
            _renderVirtualRows: function (prevScrollTop, scrollTop) {
                var self = this, first, last, added, removed;
                var addedRows = (self._virtualRowRange.last - self._virtualRowRange.first) - (self._virtualRowRange.prevLast - self._virtualRowRange.prevFirst);
                var max = self._virtualVisibleRows + self._rowsBufferSize;
                if (scrollTop < prevScrollTop) {
                    first = self._virtualRowRange.first;
                    last = self._virtualRowRange.prevFirst;
                    if (self._virtualRowRange.last <= self._virtualRowRange.prevFirst) {
                        first = self._virtualRowRange.first;
                        last = self._virtualRowRange.last;
                    }
                    self._virtualRowRange.prevFirst = self._virtualRowRange.first;
                    self._virtualRowRange.prevLast = self._virtualRowRange.last;
                    removed = self._removeVirtualRows(last - first - addedRows, false);
                    added = self._addVirtualRows(first, last, true);
                    self._adjustVirtualTableScrollHeight();
                } else if (scrollTop > prevScrollTop) {
                    first = self._virtualRowRange.prevLast;
                    last = self._virtualRowRange.last;

                    if (self._virtualRowRange.first >= self._virtualRowRange.prevLast) {
                        first = self._virtualRowRange.first;
                        last = self._virtualRowRange.last;
                    }
                    self._virtualRowRange.prevFirst = self._virtualRowRange.first;
                    self._virtualRowRange.prevLast = self._virtualRowRange.last;
                    removed = self._removeVirtualRows(last - first - addedRows, true);
                    added = self._addVirtualRows(first, last, false);
                    self._adjustVirtualTableScrollHeight();
                } else if (self._dataAppended) {
                    self._dataAppended = false;
                    var rows = self._filteredRows || self._rows;
                    if (self._virtualRowRange.last < rows.length && self._virtualRowRange.last < max) {
                        first = self._virtualRowRange.last;
                        last = rows.length;
                        if (last > max) last = max;
                        added = self._addVirtualRows(first, last, false);
                        self._virtualRowRange.last = last;
                    }
                    self._adjustVirtualTableScrollHeight();
                } else {
                    self._adjustVirtualTableScrollHeight();
                    self._refreshVirtualRows(self._virtualRowRange.first);
                    return;
                }
                if (added - removed) {
                    self._updateLastCellWidthFromScrollbar();
                    self._updateTableWidth(false);
                }
                self._prevScrollTop = self._$tbody[0].scrollTop;
            },

            /**
             * Adjusts the virtual table's scroll height
             * @private
             */
            _adjustVirtualTableScrollHeight: function () {
                var domRowCount = this._$tbody[0].childNodes.length - 2;
                var rows = this._filteredRows || this._rows;
                var bufferHeight = (rows.length - domRowCount) * this._virtualRowHeight;
                if (bufferHeight < 0) {
                    this._virtualScrollTopRow.style.height = 0;
                    this._virtualScrollBottomRow.style.height = 0;
                } else {
                    var topHeight = this._virtualRowRange.first * this._virtualRowHeight;
                    var bottomHeight = bufferHeight - topHeight;
                    this._virtualScrollTopRow.style.height = topHeight + 'px';
                    this._virtualScrollBottomRow.style.height = bottomHeight + 'px';
                }
            },

            /**
             * Append or prepend table rows to the DOM
             * @private
             * @param {Number} start index in the row data collection of the first row to add
             * @param {Number} end index in the row data collection of the last row to add
             * @param {Boolean} prepend add rows to the beginning of the table
             */
            _addVirtualRows: function (start, end, prepend) {
                var rowToInsertBefore, added = 0;
                if (prepend) {
                    var nextElementSibling = this._virtualScrollTopRow.nextSibling;
                    while (nextElementSibling && nextElementSibling.nodeType != 1) {
                        nextElementSibling = nextElementSibling.nextSibling;
                    }
                    rowToInsertBefore = nextElementSibling;
                } else {
                    rowToInsertBefore = this._virtualScrollBottomRow;
                }
                for (var i = start; i < end; i++) {
                    this._addVirtualRow(i, rowToInsertBefore);
                    added ++;
                }
                return added;
            },

            /**
             * Add a new row to the DOM
             * @private
             * @param {Number} index which row in the RowCollection to add to the DOM
             * @param {HTMLElement} rowToInsertBefore DOM row that the new row will precede
             */
            _addVirtualRow: function (index, rowToInsertBefore) {
                var tr = document.createElement('tr');
                tr['_rowIndex'] = index;
                var rowData = (this._filteredRows || this._rows)[index],
                    isDataFiltered = !!this._filteredRows,
                    allowCellPreview = this._allowCellPreview,
                    visibleColumns = this._visibleColumns,
                    cellFormatter = this._cellFormatter;
                    
                for (var i = 0, col, div, td, length = visibleColumns.length; i < length; i++) {
                    col = visibleColumns[i];
                    div = document.createElement('div');
                    div.style.width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';
                    div.innerHTML = cellFormatter(rowData[col.name], col.name);
                    td = document.createElement('td');
                    if (col.cellClasses) td.className = col.cellClasses;
                    if (allowCellPreview) {
                        this._hookCellHoverIn(td);
                    }
                    td.appendChild(div);
                    tr.appendChild(td);
                }
                
                this._$tbody[0].insertBefore(tr, rowToInsertBefore);

                this.trigger('rowCreate', index, isDataFiltered ? rowData['__i'] : index, tr, rowData);
            },

            /**
             * Remove table rows from the DOM
             * @private
             * @param {Number} numRows number of rows to remove
             * @param {Boolean} removeFromBeginning remove rows from the beginning of the table
             */
            _removeVirtualRows: function (numRows, removeFromBeginning) {
                var start, end, removed = 0;
                if (numRows > this._virtualVisibleRows + this._rowsBufferSize * 2) {
                    numRows = this._virtualVisibleRows + this._rowsBufferSize * 2;
                }

                var tbody = this._$tbody[0],
                    trs = tbody.childNodes,
                    count = this._$tbody[0].childNodes.length - 2;

                if (removeFromBeginning) {
                    start = 1;
                    end = Math.min(numRows + 1, count + 1);
                } else {
                    start = count + 1 - numRows;
                    end = count + 1;
                }
                for (var i = start; i < end; end--) {
                    this._unhookCellEventsForRow(trs[start]);
                    this.trigger('rowDestroy', trs[start]);
                    tbody.removeChild(trs[start]);
                    removed ++;
                }
                return removed;
            },

            /**
             * Refresh the data in the rendered table rows with what is currently in the row data collection
             * @private
             * @param {Number} firstRow index of the first row rendered
             */
            _refreshVirtualRows: function (firstRow) {
                var trs = this._$tbody[0].getElementsByTagName('tr'),
                    rows = this._filteredRows || this._rows,
                    isDataFiltered = !!this._filteredRows,
                    rowIndex,
                    rowData,
                    visibleColumns = this._visibleColumns,
                    cellFormatter = this._cellFormatter;
                    
                for (var i = 1, tr, tdList, j, div, col, colName, max = trs.length - 1;
                     i < max;
                     i++) {
                    tr = trs[i];

                    this.trigger('rowDestroy', tr);

                    tr['_rowIndex'] = rowIndex = firstRow + i - 1;
                    rowData = rows[rowIndex];

                    tdList = $('td>div', tr);
                    for (j = 0; j < tdList.length; j++) {
                        div = tdList[j];
                        col = visibleColumns[j];
                        colName = col.name;
                        div.innerHTML = cellFormatter(rowData[colName], colName);
                    }

                    this.trigger('rowCreate', i, isDataFiltered ? rowData['__i'] : i, tr, rowData);
                }
            },

            /**
             * Explicitly set the width of the table based on the sum of the column widths
             * @private
             * @param {boolean} parentSizeMayHaveChanged Parent size may have changed, treat rendering accordingly
             * @returns {DGTable} self
             */
            _updateTableWidth: function (parentSizeMayHaveChanged) {
                if (this._width == DGTable.Width.AUTO) {
                    var cols = this._$table.find('>thead>tr>th');
                    var newWidth = 0;
                    for (var i = 0; i < cols.length; i++) {
                        newWidth += $(cols[i])[0].offsetWidth;
                    }
                    this._$table.width(newWidth);
                    this.$el.width(newWidth);
                } else if (this._width == DGTable.Width.SCROLL) {

                    if (parentSizeMayHaveChanged) {
                        // BUGFIX: WebKit has a bug where it does not relayout so scrollbars are still calculated even though they are not there yet. This is the last resort.
                        var oldDisplay = this.el.style.display;
                        this.el.style.display = 'none';
                        this.el.offsetHeight; // No need to store this anywhere, the reference is enough
                        this.el.style.display = oldDisplay;
                    }

                    var elWidth = this.$el.innerWidth(),
                        tableWidth = this._$table.width(),
                        theadWidth = this._$thead[0].scrollWidth;

                    this._$tbody.off('scroll', this._onTableScrolledHorizontallyBound);

                    if (theadWidth > tableWidth || theadWidth > elWidth) {
                        this._$thead.width(elWidth);
                        this._$tbody.width(elWidth);
                        this._$tbody.on('scroll', this._onTableScrolledHorizontallyBound);
                    } else {
                        try { this._$thead[0].style.width = ''; }
                        catch (err) { }
                        try { this._$tbody[0].style.width = ''; }
                        catch (err) { }
                    }
                }
                return this;
            },

            /**
             * @private
             * @returns {Boolean}
             */
            _isTableRtl: function() {
                return this._$table.css('direction') === 'rtl';
            },

            /**
             * @private
             * @param {Object} column column object
             * @returns {String}
             */
            _serializeColumnWidth: function(column) {
                return column.widthMode === COLUMN_WIDTH_MODE.AUTO ? 'auto' :
                        column.widthMode === COLUMN_WIDTH_MODE.RELATIVE ? column.width * 100 + '%' :
                        column.width;
            },

            /**
             * @private
             * @param {HTMLElement} el
             */
            _cellMouseOverEvent: function(el) {
                var self = this;

                self._abortCellPreview = false;
                if (el.firstChild.scrollWidth > el.firstChild.clientWidth) {

                    self._hideCellPreview();

                    var $el = $(el), $elInner = $(el.firstChild);
                    var div = createElement('div'), $div = $(div);
                    div.innerHTML = el.innerHTML;
                    div.className = self._cellPreviewClassName;

                    if (el.tagName === 'TH') {
                        div.className += ' header';
                        if ($el.hasClass('sortable')) {
                            div.className += ' sortable';
                        }

                        div.draggable = true;
                        div.columnName = el.columnName;

                        $(div).on('mousemove', _.bind(self._onMouseMoveColumnHeader, self))
                            .on('mouseleave', _.bind(self._onMouseLeaveColumnHeader, self))
                            .on('dragstart', _.bind(self._onStartDragColumnHeader, self))
                            .on('click', _.bind(self._onClickColumnHeader, self));
                        $(div.firstChild).on('dragenter', _.bind(self._onDragEnterColumnHeader, self))
                            .on('dragover', _.bind(self._onDragOverColumnHeader, self))
                            .on('dragleave', _.bind(self._onDragLeaveColumnHeader, self))
                            .on('drop', _.bind(self._onDropColumnHeader, self));

                        if (hasIeDragAndDropBug) {
                            $(div).on('selectstart', _.bind(function(evt) {
                                evt.preventDefault();
                                this.dragDrop();
                                return false;
                            }, div));
                        }
                    }

                    var paddingL = parseFloat($el.css('padding-left')) || 0,
                        paddingR = parseFloat($el.css('padding-right')) || 0,
                        paddingT = parseFloat($el.css('padding-top')) || 0,
                        paddingB = parseFloat($el.css('padding-bottom')) || 0;
                    var requiredWidth = el.firstChild.scrollWidth + el.clientWidth - el.firstChild.offsetWidth,
                        requiredHeight = el.firstChild.scrollHeight + el.clientHeight - el.firstChild.offsetHeight;

                    var borderBox = $el.css('boxSizing') === 'border-box';
                    if (borderBox) {
                        requiredWidth -= parseFloat($(el).css('border-left-width')) || 0;
                        requiredWidth -= parseFloat($(el).css('border-right-width')) || 0;
                        requiredHeight -= parseFloat($(el).css('border-top-width')) || 0;
                        requiredHeight -= parseFloat($(el).css('border-bottom-width')) || 0;
                        $div.css('box-sizing', 'border-box');
                    } else {
                        requiredWidth -= paddingL + paddingR;
                        requiredHeight -= paddingT + paddingB;
                        $div.css({ 'margin-top': parseFloat($(el).css('border-top-width')) || 0 });
                    }

                    if (!self._transparentBgColor1) {
                        // Detect browser's transparent spec
                        var tempDiv = document.createElement('div');
                        tempDiv.style.backgroundColor = 'transparent';
                        self._transparentBgColor1 = $(tempDiv).css('background-color');
                        tempDiv.style.backgroundColor = 'rgba(0,0,0,0)';
                        self._transparentBgColor2 = $(tempDiv).css('background-color');
                    }

                    var bgColor = $(el).css('background-color');
                    if (bgColor === self._transparentBgColor1 || bgColor === self._transparentBgColor2) {
                        bgColor = $(el.parentNode).css('background-color');
                    }
                    if (bgColor === self._transparentBgColor1 || bgColor === self._transparentBgColor2) {
                        bgColor = '#fff';
                    }

                    $div.css({
                        'box-sizing': 'content-box',
                        width: requiredWidth + 'px',
                        height: requiredHeight + 'px',
                        'padding-left': paddingL,
                        'padding-right': paddingR,
                        'padding-top': paddingT,
                        'padding-bottom': paddingB,
                        overflow: 'hidden',
                        position: 'absolute',
                        zIndex: '-1',
                        left: '0',
                        top: '0',
                        'background-color': bgColor,
                        cursor: 'default'
                    });

                    document.body.appendChild(div);

                    $(div.firstChild).css({
                        'width': (div.clientWidth - el.clientWidth + parseFloat(el.firstChild.style.width)) + 'px',
                        'direction': $elInner.css('direction'),
                        'white-space': $elInner.css('white-space'),

                        // self is for vertical-centering, same way as TH/TD do.
                        // But we do it on the inner wrapper,
                        // because the outer is absolute positioned and cannot really be a table-cell
                        'height': requiredHeight, // Sorry, but 100% does not work on a table-cell
                        'display': 'table-cell',
                        'vertical-align': $(el).css('vertical-align')
                    });

                    var rowIndex = div['__row'] = el.parentNode['_rowIndex'];
                    div['__column'] = self._visibleColumns[_.indexOf(el.parentNode.childNodes, el)].name;

                    self.trigger('cellPreview', div.firstChild, rowIndex == null ? null : rowIndex, div['__column'], rowIndex == null ? null : (self._filteredRows || self._rows)[rowIndex]);
                    if (self._abortCellPreview) return;

                    var offset = $el.offset();

                    if (self._isTableRtl()) {
                        var w = $div.outerWidth();
                        var elW = $el.outerWidth();
                        offset.left -= w - elW;
                    } else {
                        offset.left += parseFloat($(el).css('border-left-width')) || 0;
                    }
                    offset.top += parseFloat($(el).css('border-top-width')) || parseFloat($(el).css('border-bottom-width')) || 0;

                    var minLeft = 0, maxLeft = $(window).width() - $div.outerWidth();
                    offset.left = offset.left < minLeft ? minLeft : offset.left > maxLeft ? maxLeft : offset.left;

                    $div.css({
                        left: offset.left,
                        top: offset.top,
                        'z-index': 9999
                    });

                    div['__cell'] = el;
                    self._$cellPreviewEl = $div;
                    el['__previewEl'] = div;

                    self._hookCellHoverOut(el);
                    self._hookCellHoverOut(div);
                }
            },

            /**
             * @private
             * @param {HTMLElement} el
             */
            _cellMouseOutEvent: function(el) {
                this._hideCellPreview();
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _hideCellPreview: function() {
                if (this._$cellPreviewEl) {
                    var div = this._$cellPreviewEl[0];
                    this._$cellPreviewEl.remove()
                        .off('mousemove')
                        .off('mouseleave')
                        .off('dragstart')
                        .off('selectstart')
                        .off('click')
                        .find('>div')
                        .off('dragenter')
                        .off('dragover')
                        .off('dragleave')
                        .off('drop');
                    this._unhookCellHoverOut(div['__cell']);
                    this._unhookCellHoverOut(div);

                    div['__cell']['__previewEl'] = null;
                    div['__cell'] = null;

                    this.trigger('cellPreviewDestroy', div.firstChild, div['__row'], div['__column']);

                    this._$cellPreviewEl = null;
                }
                return this;
            }
        }
    );

    // It's a shame the Google Closure Compiler does not support exposing a nested @param

    /**
     * @typedef SERIALIZED_COLUMN
     * */
    var SERIALIZED_COLUMN = {
        /**
         * @expose
         * @const
         * @type {Number}
         * */
        order: 0,

        /**
         * @expose
         * @const
         * @type {String}
         * */
        width: 'auto',

        /**
         * @expose
         * @const
         * @type {Boolean}
         * */
        visible: true
    };

    /**
     * @typedef SERIALIZED_COLUMN_SORT
     * */
    var SERIALIZED_COLUMN_SORT = {
        /**
         * @expose
         * @const
         * @type {String}
         * */
        column: '',

        /**
         * @expose
         * @const
         * @type {Boolean}
         * */
        descending: false
    };

    /**
     * @typedef COLUMN_WIDTH_MODE
     * */
    var COLUMN_WIDTH_MODE = {
        /** 
         * @expose
         * @const
         * @type {Number}
         * */
        AUTO: 0,
        
        /** 
         * @expose
         * @const
         * @type {Number}
         * */
        ABSOLUTE: 1,
        
        /** 
         * @expose
         * @const
         * @type {Number}
         * */
        RELATIVE: 2
    };

    /**
     * @typedef DGTable.Width
     * @expose
     * */
    DGTable.Width = {
        /**
         * @expose
         * @const
         * @type {String}
         * */
        NONE: 'none',

        /**
         * @expose
         * @const
         * @type {String}
         * */
        AUTO: 'auto',

        /**
         * @expose
         * @const
         * @type {String}
         * */
        SCROLL: 'SCROLL'
    };

    /**
     * @typedef COLUMN_SORT_OPTIONS
     * */
    var COLUMN_SORT_OPTIONS = {
        /**
         * @expose
         * @type {String}
         * */
        column: null,
        
        /**
         * @expose
         * @type {Boolean=false}
         * */
        descending: null
    };

    /**
     * @typedef COLUMN_OPTIONS
     * */
    var COLUMN_OPTIONS = {
        /**
         * @expose
         * @type {String}
         * */
        name: null,
        
        /**
         * @expose
         * @type {String=name}
         * */
        label: null,
        
        /**
         * @expose
         * @type {Number|String}
         * */
        width: null,
        
        /**
         * @expose
         * @type {Boolean=true}
         * */
        resizable: null,
        
        /**
         * @expose
         * @type {Boolean=true}
         * */
        sortable: null,
        
        /**
         * @expose
         * @type {Boolean=true}
         * */
        visible: null,
        
        /**
         * @expose
         * @type {String}
         * */
        cellClasses: null
    };

    /**
     * @typedef INIT_OPTIONS
     * @param {COLUMN_OPTIONS[]} columns
     * @param {Number} height
     * @param {DGTable.Width} width
     * @param {Boolean=true} virtualTable
     * @param {Boolean=true} resizableColumns
     * @param {Boolean=true} movableColumns
     * @param {Number=1} sortableColumns
     * @param {Boolean=true} adjustColumnWidthForSortArrow
     * @param {Boolean=true} relativeWidthGrowsToFillWidth
     * @param {Boolean=false} relativeWidthShrinksToFillWidth
     * @param {Boolean=false} convertColumnWidthsToRelative
     * @param {String} cellClasses
     * @param {String|String[]|COLUMN_SORT_OPTIONS|COLUMN_SORT_OPTIONS[]} sortColumn
     * @param {Function?} cellFormatter
     * @param {Function?} headerCellFormatter
     * @param {Number=10} rowsBufferSize
     * @param {Number=35} minColumnWidth
     * @param {Number=8} resizeAreaWidth
     * @param {Function(String,Boolean)Function(a,b)Boolean} comparatorCallback
     * @param {String?} resizerClassName
     * @param {String?} tableClassName
     * @param {Boolean=true} allowCellPreview
     * @param {String?} cellPreviewClassName
     * @param {String?} className
     * @param {String?} tagName
     * */
    var INIT_OPTIONS = {
        /**
         * @expose
         * @type {COLUMN_OPTIONS[]}
         * */
        columns: null,

        /** @expose */
        height: null,

        /**
         * @expose
         * @type {DGTable.Width}
         * */
        width: null,

        /** @expose */
        virtualTable: null,

        /** @expose */
        resizableColumns: null,

        /** @expose */
        movableColumns: null,

        /** @expose */
        sortableColumns: null,

        /**
         * @expose
         * @type {Boolean=true}
         * */
        adjustColumnWidthForSortArrow: null,

        /** @expose */
        cellClasses: null,

        /** @expose */
        sortColumn: null,

        /** @expose */
        cellFormatter: null,

        /** @expose */
        headerCellFormatter: null,

        /** @expose */
        rowsBufferSize: null,

        /** @expose */
        minColumnWidth: null,

        /** @expose */
        resizeAreaWidth: null,

        /** @expose */
        comparatorCallback: null,

        /**
         * @expose
         * @type {Boolean=true}
         * */
        relativeWidthGrowsToFillWidth: null,

        /**
         * @expose
         * @type {Boolean=false}
         * */
        relativeWidthShrinksToFillWidth: null,

        /**
         * @expose
         * @type {Boolean=false}
         * */
        convertColumnWidthsToRelative: null,

        /**
         * @expose
         * @type {String}
         * */
        resizerClassName: null,

        /**
         * @expose
         * @type {String}
         * */
        tableClassName: null,

        /**
         * @expose
         * @type {Boolean}
         * */
        allowCellPreview: null,

        /**
         * @expose
         * @type {Boolean}
         * */
        allowHeaderCellPreview: null,

        /**
         * @expose
         * @type {String}
         * */
        cellPreviewClassName: null,

        /** @expose */
        className: null,

        /** @expose */
        tagName: null
    };

    /**
     * @typedef {{
     *  currentTarget: Element,
     *  data: Object.<string, *>,
     *  delegateTarget: Element,
     *  isDefaultPrevented: Boolean,
     *  isImmediatePropagationStopped: Boolean,
     *  isPropagationStopped: Boolean,
     *  namespace: string,
     *  originalEvent: Event,
     *  pageX: Number,
     *  pageY: Number,
     *  preventDefault: Function,
     *  props: Object.<string, *>,
     *  relatedTarget: Element,
     *  result: *,
     *  stopImmediatePropagation: Function,
     *  stopPropagation: Function,
     *  target: Element,
     *  timeStamp: Number,
     *  type: string,
     *  which: Number
     * }} jQuery.Event
     * */

    /** @expose */
    global.DGTable = DGTable;

})(this, jQuery);
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
/* global DGTable, _ */
DGTable.ColumnCollection = (function () {
    'use strict';

    // Define class RowCollection
    var ColumnCollection = function() {

        // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
        // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
        var collection = [];

        // Synthetically set the 'prototype'
        _.extend(collection, ColumnCollection.prototype);

        // Call initializer
        collection.initialize.apply(collection, arguments);

        return collection;
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
            var originalRowIndex = 0;
            for (var i = 0, len = this.length, row; i < len; i++) {
                row = this[i];
                if (this.shouldBeVisible(row)) {
                    row['__i'] = originalRowIndex++;
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