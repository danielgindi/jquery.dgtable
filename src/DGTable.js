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
    var hasIeDragAndDropBug = ieVersion && ieVersion < 10;
    var createElement = _.bind(document.createElement, document);

    function webkitRenderBugfix(el) {
        // BUGFIX: WebKit has a bug where it does not relayout, and this affects us because scrollbars 
        //   are still calculated even though they are not there yet. This is the last resort.
        var oldDisplay = el.style.display;
        el.style.display = 'none';
        el.offsetHeight; // No need to store this anywhere, the reference is enough
        el.style.display = oldDisplay;
        return el;
    }

    function relativizeElement($el) {
        if (!_.contains(['relative', 'absolute', 'fixed'], $el.css('position'))) {
            $el.css('position', 'relative');
        }
    }

    
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
            VERSION: '@VERSION',

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

                var settings = this.settings = {};

                /**
                 * @private
                 * @field {Boolean} virtualTable */
                settings.virtualTable = options.virtualTable === undefined ? true : !!options.virtualTable;

                /**
                 * @private
                 * @field {Number} rowsBufferSize */
                settings.rowsBufferSize = options.rowsBufferSize || 3;

                /**
                 * @private
                 * @field {Number} minColumnWidth */
                settings.minColumnWidth = Math.max(options.minColumnWidth || 35, 0);

                /**
                 * @private
                 * @field {Number} resizeAreaWidth */
                settings.resizeAreaWidth = options.resizeAreaWidth || 8;

                /**
                 * @private
                 * @field {Boolean} resizableColumns */
                settings.resizableColumns = options.resizableColumns === undefined ? true : !!options.resizableColumns;

                /**
                 * @private
                 * @field {Boolean} movableColumns */
                settings.movableColumns = options.movableColumns === undefined ? true : !!options.movableColumns;

                /**
                 * @private
                 * @field {Number} sortableColumns */
                settings.sortableColumns = options.sortableColumns === undefined ? 1 : (parseInt(options.sortableColumns, 10) || 1);

                /**
                 * @private
                 * @field {Boolean} adjustColumnWidthForSortArrow */
                settings.adjustColumnWidthForSortArrow = options.adjustColumnWidthForSortArrow === undefined ? true : !!options.adjustColumnWidthForSortArrow;

                /**
                 * @private
                 * @field {Boolean} convertColumnWidthsToRelative */
                settings.convertColumnWidthsToRelative = options.convertColumnWidthsToRelative === undefined ? false : !!options.convertColumnWidthsToRelative;

                /**
                 * @private
                 * @field {String} cellClasses */
                settings.cellClasses = options.cellClasses === undefined ? '' : options.cellClasses;

                /**
                 * @private
                 * @field {String} resizerClassName */
                settings.resizerClassName = options.resizerClassName === undefined ? 'dgtable-resize' : options.resizerClassName;

                /**
                 * @private
                 * @field {String} tableClassName */
                settings.tableClassName = options.tableClassName === undefined ? 'dgtable' : options.tableClassName;

                /**
                 * @private
                 * @field {Boolean} allowCellPreview */
                settings.allowCellPreview = options.allowCellPreview === undefined ? true : options.allowCellPreview;

                /**
                 * @private
                 * @field {Boolean} allowHeaderCellPreview */
                settings.allowHeaderCellPreview = options.allowHeaderCellPreview === undefined ? true : options.allowHeaderCellPreview;

                /**
                 * @private
                 * @field {String} cellPreviewClassName */
                settings.cellPreviewClassName = options.cellPreviewClassName === undefined ? 'dgtable-cell-preview' : options.cellPreviewClassName;

                /**
                 * @private
                 * @field {Function(String,Boolean)Function(a,b)Boolean} comparatorCallback */
                settings.comparatorCallback = options.comparatorCallback === undefined ? null : options.comparatorCallback;

                /**
                 * @private
                 * @field {Boolean} width */
                settings.width = options.width === undefined ? DGTable.Width.NONE : options.width;

                /**
                 * @private
                 * @field {Boolean} relativeWidthGrowsToFillWidth */
                settings.relativeWidthGrowsToFillWidth = options.relativeWidthGrowsToFillWidth === undefined ? true : !!options.relativeWidthGrowsToFillWidth;

                /**
                 * @private
                 * @field {Boolean} relativeWidthShrinksToFillWidth */
                settings.relativeWidthShrinksToFillWidth = options.relativeWidthShrinksToFillWidth === undefined ? false : !!options.relativeWidthShrinksToFillWidth;

                /**
                 * @private
                 * @field {Function} cellFormatter */
                settings.cellFormatter = options.cellFormatter || function (val) {
                    return val;
                };
                
                /**
                 * @private
                 * @field {Function} headerCellFormatter */
                settings.headerCellFormatter = options.headerCellFormatter || function (val) {
                    return val;
                };

                /** @private
                 * @field {Number} height */
                settings.height = options.height;

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
                this._ensureVisibleColumns();

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
                            if (cols.length === settings.sortableColumns || cols.length == this._visibleColumns.length) {
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
                        if (settings.comparatorCallback) {
                            returnVal.comparator = settings.comparatorCallback(column, descending);
                        }
                    }, this));

                /** @private
                 * @field {DGTable.RowCollection} _filteredRows */
                this._filteredRows = null;

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
                     * @param {HTMLElement} el cell or header-cell
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverIn = function (el) {
                        if (!el['__hoverIn']) {
                            el.addEventListener('mouseover', el['__hoverIn'] = _.bind(hoverMouseOverHandler, el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el cell or header-cell
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
                     * @param {HTMLElement} el cell or header-cell
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverOut = function (el) {
                        if (!el['__hoverOut']) {
                            el.addEventListener('mouseout', el['__hoverOut'] = _.bind(hoverMouseOutHandler, el['__cell'] || el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el cell or header-cell
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
                     * @param {HTMLElement} el cell or header-cell
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverIn = function (el) {
                        if (!el['__hoverIn']) {
                            el.attachEvent('mouseover', el['__hoverIn'] = _.bind(hoverMouseOverHandler, el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el cell or header-cell
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
                     * @param {HTMLElement} el cell or header-cell
                     * @returns {DGTable} self
                     * */
                    this._hookCellHoverOut = function (el) {
                        if (!el['__hoverOut']) {
                            el.attachEvent('mouseout', el['__hoverOut'] = _.bind(hoverMouseOutHandler, el['__cell'] || el));
                        }
                        return this;
                    };

                    /**
                     * @param {HTMLElement} el cell or header-cell
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
                            
                        if (widthSize < this.settings.minColumnWidth) {
                            widthSize = this.settings.minColumnWidth;
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
                    cellClasses: columnData.cellClasses === undefined ? this.settings.cellClasses : columnData.cellClasses
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
                        this.trigger('rowdestroy', trs[i]);
                    }
                }
                this.remove();
                this._unbindHeaderEvents()._unhookCellEventsForTable();
                this._$table.unbind();
                this._$tbody.unbind();
                this.$el.unbind();
                this.unbind();
                if (this._workerListeners) {
                    for (var j = 0, worker; j < this._workerListeners.length; j++) {
                        worker = this._workerListeners[j];
                        worker.worker.removeEventListener('message', worker.listener, false);
                    }
                    this._workerListeners.length = 0;
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
                var i, rows, rowCount, rowToClean, j, cells, cellCount;
                if (this._headerRow) {
                    for (i = 0, rows = this._headerRow.childNodes, rowCount = rows.length; i < rowCount; i++) {
                        rowToClean = rows[i];
                        for (j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
                            this._unhookCellHoverIn(cells[j]);
                        }
                    }
                }
                if (this._tbody) {
                    for (i = 0, rows = this._tbody.childNodes, rowCount = rows.length; i < rowCount; i++) {
                        rowToClean = rows[i];
                        for (j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
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
                var self = this,
                    settings = this.settings;

                if (this._tableSkeletonNeedsRendering === true) {
                    this._tableSkeletonNeedsRendering = false;

                    if (settings.width == DGTable.Width.AUTO) {
                        // We need to do this to return to the specified widths instead. The arrows added to the column widths...
                        self._clearSortArrows();
                    }

                    var lastScrollTop = self._table ? self._table.scrollTop : 0,
                        lastScrollLeft = self._table ? self._table.scrollLeft : 0;

                    self.tableWidthChanged(true, false) // Take this chance to calculate required column widths
                        ._renderSkeleton(); // Actual render

                    if (!settings.virtualTable) {
                        var rows = self._filteredRows || self._rows, rowCount = rows.length;
                        var renderedRows = self.renderRows(0, rowCount - 1);
                        self._$tbody.html('').append(renderedRows);
                        self._updateLastCellWidthFromScrollbar(true);
                    } else {
                        self._updateLastCellWidthFromScrollbar(); // Detect vertical scrollbar height
                    }

                    self._table.scrollTop = lastScrollTop;
                    self._table.scrollLeft = lastScrollLeft;
                    self._header.scrollLeft = lastScrollLeft;

                    this._updateTableWidth(true);

                    // Show sort arrows
                    for (var i = 0; i < this._rows.sortColumn.length; i++) {
                        this._showSortArrow(this._rows.sortColumn[i].column, this._rows.sortColumn[i].descending);
                    }
                    if (settings.adjustColumnWidthForSortArrow && this._rows.sortColumn.length) {
                        this.tableWidthChanged(true);
                    }

                    this.trigger('renderskeleton');

                    if (settings.virtualTable) {
                        this._$table.on('scroll', _.bind(this._onVirtualTableScrolled, this));
                        this.render();
                    }

                } else if (settings.virtualTable) {
                    var rowCount = (self._filteredRows || self._rows).length;
                    var scrollTop = this._table.scrollTop;
                    var firstVisible = Math.floor((scrollTop - this._virtualRowHeightFirst) / this._virtualRowHeight) + 1 - settings.rowsBufferSize;
                    var lastVisible = Math.ceil(((scrollTop - this._virtualRowHeightFirst + this._visibleHeight) / this._virtualRowHeight)) + settings.rowsBufferSize;
                    if (firstVisible < 0) firstVisible = 0;
                    if (lastVisible >= rowCount) {
                        lastVisible = rowCount - 1;
                    }

                    var oldFirstVisible = -1, oldLastVisible = -1;
                    var tbodyChildNodes = self._tbody.childNodes;
                    if (tbodyChildNodes.length) {
                        oldFirstVisible = tbodyChildNodes[0]['rowIndex'];
                        oldLastVisible = tbodyChildNodes[tbodyChildNodes.length - 1]['rowIndex'];
                    }

                    if (oldFirstVisible !== -1 && oldFirstVisible < firstVisible) {
                        var countToRemove = Math.min(oldLastVisible + 1, firstVisible) - oldFirstVisible;
                        for (var i = 0; i < countToRemove; i++) {
                            self.trigger('rowdestroy', tbodyChildNodes[0]);
                            self._unhookCellEventsForRow(tbodyChildNodes[0]);
                            self._tbody.removeChild(tbodyChildNodes[0]);
                        }
                        oldFirstVisible += countToRemove;
                        if (oldFirstVisible > oldLastVisible) {
                            oldFirstVisible = oldLastVisible = -1;
                        }
                    } else if (oldLastVisible !== -1 && oldLastVisible > lastVisible) {
                        var countToRemove = oldLastVisible - Math.max(oldFirstVisible - 1, lastVisible);
                        for (var i = 0; i < countToRemove; i++) {
                            self.trigger('rowdestroy', tbodyChildNodes[tbodyChildNodes.length - 1]);
                            self._unhookCellEventsForRow(tbodyChildNodes[tbodyChildNodes.length - 1]);
                            self._tbody.removeChild(tbodyChildNodes[tbodyChildNodes.length - 1]);
                        }
                        if (oldLastVisible < oldFirstVisible) {
                            oldFirstVisible = oldLastVisible = -1;
                        }
                    }

                    if (firstVisible < oldFirstVisible) {
                        var renderedRows = self.renderRows(firstVisible, Math.min(lastVisible, oldFirstVisible - 1));
                        self._$tbody.prepend(renderedRows);
                    }
                    if (lastVisible > oldLastVisible || oldLastVisible === -1) {
                        var renderedRows = self.renderRows(oldLastVisible === -1 ? firstVisible : oldLastVisible + 1, lastVisible);
                        self._$tbody.append(renderedRows);
                    }
                }
                this.trigger('render');
                return this;
            },

            /**
             * Forces a full render of the table
             * @public
             * @expose
             * @returns {DGTable} self
             */
            clearAndRender: function () {
                this._tableSkeletonNeedsRendering = true;
                return this.render();
            },

            /**
             * Render rows
             * @private
             * @param {Number} first first row to render
             * @param {Number} last last row to render
             * @returns {DocumentFragment} fragment containing all rendered rows
             */
            renderRows: function (first, last) {

                var self = this,
                    settings = self.settings,
                    tableClassName = settings.tableClassName,
                    rowClassName = tableClassName + '-row',
                    cellClassName = tableClassName + '-cell',
                    rows = self._filteredRows || self._rows,
                    isDataFiltered = !!self._filteredRows,
                    allowCellPreview = settings.allowCellPreview,
                    visibleColumns = self._visibleColumns,
                    cellFormatter = settings.cellFormatter,
                    isVirtual = settings.virtualTable,
                    virtualRowHeightFirst = self._virtualRowHeightFirst,
                    virtualRowHeight = self._virtualRowHeight,
                    top,
                    physicalRowIndex;

                var colCount = visibleColumns.length;
                for (var colIndex = 0, column; colIndex < colCount; colIndex++) {
                    column = visibleColumns[colIndex];
                    column._finalWidth = (column.actualWidthConsideringScrollbarWidth || column.actualWidth);
                }

                var bodyFragment = document.createDocumentFragment();

                var isRtl = this._isTableRtl(),
                    virtualRowXAttr = isRtl ? 'right' : 'left';

                for (var i = first, rowCount = rows.length, rowData, row, cell, cellInner, content;
                     i < rowCount && i <= last;
                     i++) {

                    rowData = rows[i];
                    physicalRowIndex = isDataFiltered ? rowData['__i'] : i;

                    row = createElement('div');
                    row.className = rowClassName;
                    row['rowIndex'] = i;
                    row['physicalRowIndex'] = physicalRowIndex;

                    for (colIndex = 0; colIndex < colCount; colIndex++) {
                        column = visibleColumns[colIndex];
                        cell = createElement('div');
                        cell['columnName'] = column.name;
                        cell.className = cellClassName;
                        cell.style.width = column._finalWidth + 'px';
                        if (column.cellClasses) cell.className += ' ' + column.cellClasses;
                        if (allowCellPreview) {
                            this._hookCellHoverIn(cell);
                        }
                        cellInner = cell.appendChild(createElement('div'));
						content = cellFormatter(rowData[column.name], column.name, rowData);
						if (content === undefined) {
							content = '';
						}
                        cellInner.innerHTML = content;
                        row.appendChild(cell);
                    }

                    if (isVirtual) {
                        top = i > 0 ? virtualRowHeightFirst + (i - 1) * virtualRowHeight : 0;
                        row.style.position = 'absolute';
                        row.style[virtualRowXAttr] = 0;
                        row.style.top = top + 'px';
                    }

                    bodyFragment.appendChild(row);

                    self.trigger('rowcreate', i, physicalRowIndex, row, rowData);
                }

                return bodyFragment;
            },

            /**
             * Calculate virtual table height for scrollbar
             * @private
             * @returns {DGTable} self
             */
            _calculateVirtualHeight: function () {
                if (this._tbody) {
                    var rowCount = (this._filteredRows || this._rows).length;
                    var height = this._virtualRowHeight * rowCount;
                    if (rowCount) {
                        height += (this._virtualRowHeightFirst - this._virtualRowHeight);
                        height += (this._virtualRowHeightLast - this._virtualRowHeight);
                    }
                    // At least 1 pixel - to show scrollers correctly.
                    if (height < 1) {
                        height = 1;
                    }
                    this._tbody.style.height = height + 'px';
                }
                return this;
            },

            /**
             * Calculate the size required for the table body width (which is the row's width)
             * @private
             * @returns {Number} calculated width
             */
            _calculateTbodyWidth: function () {
                var self = this,
                    tableClassName = self.settings.tableClassName,
                    rowClassName = tableClassName + '-row',
                    cellClassName = tableClassName + '-cell',
                    visibleColumns = self._visibleColumns,
                    colCount = visibleColumns.length,
                    cell,
                    cellInner,
                    colIndex,
                    column;

                var $row = $('<div>').addClass(rowClassName).css('float', 'left');

                for (colIndex = 0; colIndex < colCount; colIndex++) {
                    column = visibleColumns[colIndex];
                    cell = createElement('div');
                    cell.className = cellClassName;
                    cell.style.width = column.actualWidth + 'px';
                    if (column.cellClasses) cell.className += ' ' + column.cellClasses;
                    cellInner = cell.appendChild(createElement('div'));
                    $row.append(cell);
                }

                var $thisWrapper = $('<div>')
                    .addClass(this.className)
                    .css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px', 'float': 'left', width: '1px', overflow: 'hidden' })
                    .append(
                        $('<div>').addClass(tableClassName).append(
                            $('<div>').addClass(tableClassName + '-body').css('width', 99999).append(
                                $row
                            )
                        )
                    );

                $thisWrapper.appendTo(document.body);

                var width = $row.outerWidth();
                width -= this._scrollbarWidth || 0;

                $thisWrapper.remove();
                return width;
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
                var columns = this._columns;

                if (columnData && !columns.get(columnData.name)) {
                    var beforeColumn = null;
                    if (before !== undefined) {
                        beforeColumn = columns.get(before) || columns.getByOrder(before);
                    }

                    var column = this._initColumnFromData(columnData);
                    column.order = beforeColumn ? beforeColumn.order : (columns.getMaxOrder() + 1);

                    for (var i = columns.getMaxOrder(), to = column.order, col; i >= to ; i--) {
                        col = columns.getByOrder(i);
                        if (col) {
                            col.order++;
                        }
                    }

                    columns.push(column);
                    columns.normalizeOrder();

                    this._tableSkeletonNeedsRendering = true;
                    this._visibleColumns = columns.getVisibleColumns();
                    this._ensureVisibleColumns();
                    this.render();

                    this.trigger('addcolumn', column.name);
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
                var settings = this.settings, columns = this._columns;

                var colIdx = columns.indexOf(column);
                if (colIdx > -1) {
                    columns.splice(colIdx, 1);
                    columns.normalizeOrder();

                    this._visibleColumns = columns.getVisibleColumns();
                    this._ensureVisibleColumns().clearAndRender();

                    this.trigger('removecolumn', column);
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
                        this.clearAndRender();
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
                var settings = this.settings,
                    columns = this._columns,
                    col, destCol;
                if (typeof src === 'string') {
                    col = columns.get(src);
                } else if (typeof src === 'number') {
                    col = this._visibleColumns[src];
                }
                if (typeof dest === 'string') {
                    destCol = columns.get(dest);
                } else if (typeof dest === 'number') {
                    destCol = this._visibleColumns[dest];
                }

                if (col && destCol && src !== dest) {
                    var srcOrder = col.order, destOrder = destCol.order;

                    this._visibleColumns = columns.moveColumn(col, destCol).getVisibleColumns();
                    this._ensureVisibleColumns();

                    if (settings.virtualTable) {
                        this.clearAndRender()
                            ._updateLastCellWidthFromScrollbar(true);
                    } else {
                        var headerCell = this._$headerRow.find('>div.' + settings.tableClassName + '-header-cell');
                        var beforePos = srcOrder < destOrder ? destOrder + 1 : destOrder,
                            fromPos = srcOrder;
                        headerCell[0].parentNode.insertBefore(headerCell[fromPos], headerCell[beforePos]);

                        var srcWidth = this._visibleColumns[srcOrder];
                        srcWidth = (srcWidth.actualWidthConsideringScrollbarWidth || srcWidth.actualWidth) + 'px';
                        var destWidth = this._visibleColumns[destOrder];
                        destWidth = (destWidth.actualWidthConsideringScrollbarWidth || destWidth.actualWidth) + 'px';

                        var tbodyChildren = this._$tbody[0].childNodes;
                        for (var i = 0, count = tbodyChildren.length, row; i < count; i++) {
                            row = tbodyChildren[i];
                            if (row.nodeType !== 1) continue;
                            row.insertBefore(row.childNodes[fromPos], row.childNodes[beforePos]);
                            row.childNodes[destOrder].firstChild.style.width = destWidth;
                            row.childNodes[srcOrder].firstChild.style.width = srcWidth;
                        }
                    }

                    this.trigger('movecolumn', col.name, srcOrder, destOrder);
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
                var settings = this.settings,
                    columns = this._columns,
                    col = columns.get(column), i;
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
                        if ((settings.sortableColumns > 0 /* allow manual sort when disabled */ && currentSort.length >= settings.sortableColumns) || currentSort.length >= this._visibleColumns.length) {
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
                    if (settings.adjustColumnWidthForSortArrow) {
                        this.tableWidthChanged(true);
                    }

                    if (settings.virtualTable) {
                        while (this._tbody.firstChild) {
                            this.trigger('rowdestroy', this._tbody.firstChild);
                            this._unhookCellEventsForRow(this._tbody.firstChild);
                            this._tbody.removeChild(this._tbody.firstChild);
                        }
                    } else {
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
             * Make sure there's at least one column visible
             * @private
             * @expose
             * @returns {DGTable} self
             */
            _ensureVisibleColumns: function () {
                if (this._visibleColumns.length === 0 && this._columns.length) {
                    this._columns[0].visible = true;
                    this._visibleColumns.push(this._columns[0]);
                    this.trigger('showcolumn', this._columns[0].name);
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
                    this._visibleColumns = this._columns.getVisibleColumns();
                    this.trigger(visible ? 'showcolumn' : 'hidecolumn', column);
                    this._ensureVisibleColumns();
                    this.clearAndRender();
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
                var settings = this.settings;
                minColumnWidth = Math.max(minColumnWidth, 0);
                if (settings.minColumnWidth != minColumnWidth) {
                    settings.minColumnWidth = minColumnWidth;
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
                return this.settings.minColumnWidth;
            },

            /**
             * Set the limit on concurrent columns sorted
             * @public
             * @expose
             * @param {Number} sortableColumns How many sortable columns to allow?
             * @returns {DGTable} self
             */
            setSortableColumns: function (sortableColumns) {
                var settings = this.settings;
                if (settings.sortableColumns != sortableColumns) {
                    settings.sortableColumns = sortableColumns;
                    if (this._$table) {
                        var headerCell = this._$headerRow.find('>div.' + settings.tableClassName + '-header-cell');
                        for (var i = 0; i < headerCell.length; i++) {
                            $(headerCell[0])[(settings.sortableColumns > 0 && this._visibleColumns[i].sortable) ? 'addClass' : 'removeClass']('sortable');
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
                return this.settings.sortableColumns;
            },

            /**
             * @public
             * @expose
             * @param {Boolean} movableColumns are the columns movable?
             * @returns {DGTable} self
             */
            setMovableColumns: function (movableColumns) {
                var settings = this.settings;
                movableColumns = !!movableColumns;
                if (settings.movableColumns != movableColumns) {
                    settings.movableColumns = movableColumns;
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @returns {Boolean} are the columns movable?
             */
            getMovableColumns: function () {
                return this.settings.movableColumns;
            },

            /**
             * @public
             * @expose
             * @param {Boolean} resizableColumns are the columns resizable?
             * @returns {DGTable} self
             */
            setResizableColumns: function (resizableColumns) {
                var settings = this.settings;
                resizableColumns = !!resizableColumns;
                if (settings.resizableColumns != resizableColumns) {
                    settings.resizableColumns = resizableColumns;
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @returns {Boolean} are the columns resizable?
             */
            getResizableColumns: function () {
                return this.settings.resizableColumns;
            },

            /**
             * @public
             * @expose
             * @param {Function(String,Boolean)Function(a,b)Boolean} comparatorCallback a callback function that returns the comparator for a specific column
             * @returns {DGTable} self
             */
            setComparatorCallback: function (comparatorCallback) {
                var settings = this.settings;
                if (settings.comparatorCallback != comparatorCallback) {
                    settings.comparatorCallback = comparatorCallback;
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

                    this.trigger('columnwidth', col.name, oldWidth, newWidth);
                }
                return this;
            },

            /**
             * @public
             * @expose
             * @param {String} column name of the column
             * @returns {String|null} the serialized width of the specified column, or null if column not found
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
                        'order': col.order,
                        'width': this._serializeColumnWidth(col),
                        'visible': col.visible,
                        'label': col.label
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
                    config[this._columns[i].name] = this.getColumnConfig(this._columns[i].name);
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
                var rowData = this._rows[row];
                var content = this.settings.cellFormatter(rowData[column], column, rowData);
				if (content === undefined) {
					content = '';
				}
				return content;
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
                var settings = this.settings;

                // Changing display mode briefly, to prevent taking in account the  parent's scrollbar width when we are the cause for it
                var oldDisplay, lastScrollTop, lastScrollLeft;
                if (this._$table) {
                    lastScrollTop = this._table ? this._table.scrollTop : 0;
                    lastScrollLeft = this._table ? this._table.scrollLeft : 0;

                    oldDisplay = this._$table[0].style.display;
                    this._$table[0].style.display = 'none';
                }
                var detectedWidth = this.$el.width();
                if (this._$table) {
                    this._$table[0].style.display = oldDisplay;

                    this._table.scrollTop = lastScrollTop;
                    this._table.scrollLeft = lastScrollLeft;
                    this._header.scrollLeft = lastScrollLeft;
                }

                var $thisWrapper, $header, $headerRow;
                var tableClassName = settings.tableClassName;

                if (!this._$table) {

                    $thisWrapper = $('<div>').addClass(this.className).css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px' });
                    $header = $('<div>').addClass(tableClassName + '-header').appendTo($thisWrapper);
                    $headerRow = $('<div>').addClass(tableClassName + '-header-row').appendTo($header);
                    for (var i = 0; i < this._visibleColumns.length; i++) {
                        $headerRow.append($('<div><div></div></div>').addClass(tableClassName + '-header-cell').addClass(this._visibleColumns[i].cellClasses || ''));
                    }
                    $thisWrapper.appendTo(document.body);
                } else {
                    $headerRow = this._$headerRow;
                }

                detectedWidth -= this._horizontalBorderWidth($headerRow[0]);
                var $cells = $headerRow.find('>div.' + tableClassName + '-header-cell');
                for (var i = 0, $cell, $div, cellBorderBox; i < $cells.length; i++) {
                    $div = $($cells[i].firstChild);
                    $cell = $($cells[i]);

                    cellBorderBox = $cell.css('boxSizing') === 'border-box';
                    detectedWidth -=
                        (parseFloat($cell.css('border-right-width')) || 0) +
                        (parseFloat($cell.css('border-left-width')) || 0) +
                        (cellBorderBox ? 0 : this._horizontalPadding($cell[0])); // CELL's padding
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
                    var tableClassName = this.settings.tableClassName;

                    var $cell, $tableWrapper = $('<div>').addClass(this.$el).append(
                        $('<div>').addClass(tableClassName + '-header').append(
                            $('<div>').addClass(tableClassName + '-header-row').append(
                                $cell = $('<div>').addClass(tableClassName + '-header-cell').append(
                                    $('<div>').text(text)
                                )
                            )
                        )
                    ).css({'position': 'absolute', top: '-9999px', 'visibility': 'hidden'});
                    $tableWrapper.appendTo(document.body);
                    var width = $cell.width();
                    $tableWrapper.remove();
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

                    var settings = this.settings,
                        detectedWidth = this._calculateWidthAvailableForColumns(),
                        sizeLeft = detectedWidth,
                        relatives = 0;

                    renderColumns = renderColumns === undefined || renderColumns;

                    var tableWidthBeforeCalculations = 0;

                    if (renderColumns) {
                        tableWidthBeforeCalculations = parseFloat(this._tbody.style.minWidth) || 0;
                    }

                    if (sizeLeft != lastDetectedWidth || forceUpdate) {
                        lastDetectedWidth = detectedWidth;

                        var width, absWidthTotal = 0, changedColumnIndexes = [], i, col, totalRelativePercentage = 0;

                        for (i = 0; i < this._columns.length; i++) {
                            this._columns[i].actualWidthConsideringScrollbarWidth = null;
                        }

                        for (i = 0; i < this._visibleColumns.length; i++) {
                            col = this._visibleColumns[i];
                            if (col.widthMode === COLUMN_WIDTH_MODE.ABSOLUTE) {
                                width = col.width;
                                width += col.arrowProposedWidth || 0; // Sort-arrow width
                                if (width < settings.minColumnWidth) {
                                    width = settings.minColumnWidth;
                                }
                                sizeLeft -= width;
                                absWidthTotal += width;

                                // Update actualWidth
                                if (width !== col.actualWidth) {
                                    col.actualWidth = width;
                                    changedColumnIndexes.push(i);
                                }
                            } else if (col.widthMode === COLUMN_WIDTH_MODE.AUTO) {
                                width = getTextWidth.call(this, col.label) + 20;
                                width += col.arrowProposedWidth || 0; // Sort-arrow width
                                if (width < settings.minColumnWidth) {
                                    width = settings.minColumnWidth;
                                }
                                sizeLeft -= width;
                                absWidthTotal += width;

                                // Update actualWidth
                                if (width !== col.actualWidth) {
                                    col.actualWidth = width;
                                    if (!settings.convertColumnWidthsToRelative) {
                                        changedColumnIndexes.push(i);
                                    }
                                }
                            } else if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                totalRelativePercentage += col.width;
                                relatives++;
                            }
                        }

                        // Normalize relative sizes if needed
                        if (settings.convertColumnWidthsToRelative) {
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
                        if (relatives && ((totalRelativePercentage < 1 && settings.relativeWidthGrowsToFillWidth) ||
                                        (totalRelativePercentage > 1 && settings.relativeWidthShrinksToFillWidth))) {
                            for (i = 0; i < this._visibleColumns.length; i++) {
                                col = this._visibleColumns[i];
                                if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                    col.width /= totalRelativePercentage;
                                }
                            }
                        }

                        detectedWidth = sizeLeft; // Use this as the space to take the relative widths out of

                        var minColumnWidthRelative = (settings.minColumnWidth / detectedWidth);
                        if (isNaN(minColumnWidthRelative)) {
                            minColumnWidthRelative = 0;
                        }
                        if (minColumnWidthRelative > 0) {
                            var extraRelative = 0, delta;

                            // First pass - make sure they are all constrained to the minimum width
                            for (i = 0; i < this._visibleColumns.length; i++) {
                                col = this._visibleColumns[i];
                                if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                    if (col.width < minColumnWidthRelative) {
                                        extraRelative += minColumnWidthRelative - col.width;
                                        col.width = minColumnWidthRelative;
                                    }
                                }
                            }

                            // Second pass - try to take the extra width out of the other columns to compensate
                            for (i = 0; i < this._visibleColumns.length; i++) {
                                col = this._visibleColumns[i];
                                if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                    if (col.width > minColumnWidthRelative) {
                                        if (extraRelative > 0) {
                                            delta = Math.min(extraRelative, col.width - minColumnWidthRelative);
                                            col.width -= delta;
                                            extraRelative -= delta;
                                        }
                                    }
                                }
                            }
                        }

                        for (i = 0; i < this._visibleColumns.length; i++) {
                            col = this._visibleColumns[i];
                            if (col.widthMode === COLUMN_WIDTH_MODE.RELATIVE) {
                                width = Math.round(detectedWidth * col.width);
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

                        if (renderColumns) {
                            var tableWidth = this._calculateTbodyWidth();

                            if (tableWidthBeforeCalculations < tableWidth) {
                                this._updateTableWidth(false);
                            }

                            for (i = 0; i < changedColumnIndexes.length; i++) {
                                this._resizeColumnElements(changedColumnIndexes[i]);
                            }

                            if (tableWidthBeforeCalculations > tableWidth) {
                                this._updateTableWidth(false);
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
                    settings = self.settings,
                    height = this.$el.innerHeight() - (parseFloat(this._$table.css('border-top-width')) || 0) - (parseFloat(this._$table.css('border-bottom-width')) || 0);
                if (height != settings.height) {
                    settings.height = height;
                    if (self._tbody) {
                        // At least 1 pixel - to show scrollers correctly.
                        self._tbody.style.height = Math.max(settings.height - self._$headerRow.outerHeight(), 1) + 'px';
                    }
                    if (settings.virtualTable) {
                        self.clearAndRender();
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
                var self = this;
                if (data) {
                    this._rows.add(data);
                    if (self.settings.virtualTable) {
                        while (this._tbody.firstChild) {
                            this.trigger('rowdestroy', this._tbody.firstChild);
                            this._unhookCellEventsForRow(this._tbody.firstChild);
                            this._tbody.removeChild(this._tbody.firstChild);
                        }

                        if (this._filteredRows) {
                            this._refilter();
                        }

                        this._calculateVirtualHeight() // Calculate virtual height
                            ._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height
                            ._updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar

                        this.render();
                    } else {
                        if (this._filteredRows) {
                            var filteredCount = this._filteredRows.length;
                            this._refilter();
                            if (!this._filteredRows || this._filteredRows.length != filteredCount) {
                                this.clearAndRender();
                            }
                        } else if (this._$tbody) {
                            var firstRow = self._rows.length - data.length,
                                lastRow = firstRow + data.length - 1;

                            var renderedRows = self.renderRows(firstRow, lastRow);
                            self._tbody.appendChild(renderedRows);
                            self._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height, and update existing last cells
                                ._updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar
                        }
                    }
                    this.trigger('addrows', data.length, false);
                }
                return this;
            },

            /**
             * Removes a row from the table
             * @public
             * @expose
             * @param {Number} physicalRowIndex index
             * @param {Boolean=true} render
             * @returns {DGTable} self
             */
            removeRow: function(physicalRowIndex, render) {
                if (physicalRowIndex < 0 || physicalRowIndex > this._rows.length - 1) return this;

                this._rows.splice(physicalRowIndex, 1);
                render = (render === undefined) ? true : !!render;
                if (this._filteredRows) {
                    this._refilter();
                    this._tableSkeletonNeedsRendering = true;
                    if (render) {
                        // Render the skeleton with all rows from scratch
                        this.render();
                    }
                } else if (render) {
                    var childNodes = this._tbody.childNodes;
                    if (this.settings.virtualTable) {
                        for (var i = 0; i < childNodes.length; i++) {
                            if (childNodes[i]['rowIndex'] >= physicalRowIndex) {
                                this.trigger('rowdestroy', childNodes[i]);
                                this._unhookCellEventsForRow(childNodes[i]);
                                this._tbody.removeChild(childNodes[i]);

                                // Keep on destroying all rows further, and later render them all back.
                                // Because f we have a hole in the middle, it will be harder to shift the rest of the rows and re-render
                                i--;
                            }
                        }
                        this._calculateVirtualHeight()
                            ._updateLastCellWidthFromScrollbar()
                            .render()
                            ._updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar
                    } else {
                        for (var i = 0; i < childNodes.length; i++) {
                            if (childNodes[i]['rowIndex'] === physicalRowIndex) {
                                this.trigger('rowdestroy', childNodes[i]);
                                this._unhookCellEventsForRow(childNodes[i]);
                                this._tbody.removeChild(childNodes[i]);
                                break;
                            }
                        }
                        this.render()
                            ._updateLastCellWidthFromScrollbar()
                            ._updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar
                    }
                }
                return this;
            },

            /**
             * Refreshes the row specified
             * @public
             * @expose
             * @param {Number} physicalRowIndex index
             * @returns {DGTable} self
             */
            refreshRow: function(physicalRowIndex) {
                if (physicalRowIndex < 0 || physicalRowIndex > this._rows.length - 1) return this;

                // Find out if the row is in the rendered dataset
                var rowIndex = -1;
                if (this._filteredRows && (rowIndex = _.indexOf(this._filteredRows, this._rows[physicalRowIndex])) === -1) return this;

                if (rowIndex === -1) {
                    rowIndex = physicalRowIndex;
                }

                var childNodes = this._tbody.childNodes;

                if (this.settings.virtualTable) {
                    // Now make sure that the row actually rendered, as this is a virtual table
                    var isRowVisible = false;
                    for (var i = 0; i < childNodes.length; i++) {
                        if (childNodes[i]['physicalRowIndex'] === physicalRowIndex) {
                            isRowVisible = true;
                            this.trigger('rowdestroy', childNodes[i]);
                            this._unhookCellEventsForRow(childNodes[i]);
                            this._tbody.removeChild(childNodes[i]);
                            break;
                        }
                    }
                    if (isRowVisible) {
                        var renderedRow = this.renderRows(rowIndex, rowIndex);
                        this._tbody.insertBefore(renderedRow, childNodes[i] || null);
                    }
                } else {
                    this.trigger('rowdestroy', childNodes[rowIndex]);
                    this._unhookCellEventsForRow(childNodes[rowIndex]);
                    this._tbody.removeChild(childNodes[rowIndex]);
                    var renderedRow = this.renderRows(rowIndex, rowIndex);
                    this._tbody.insertBefore(renderedRow, childNodes[rowIndex] || null);
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
                this.clearAndRender().trigger('addrows', data.length, true);
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
                    if (!this._workerListeners) {
                        this._workerListeners = [];
                    }
                    this._workerListeners.push({worker: worker, listener: listener});
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
                if (this._workerListeners) {
                    for (var j = 0; j < this._workerListeners.length; j++) {
                        if (this._workerListeners[j].worker == worker) {
                            worker.removeEventListener('message', this._workerListeners[j].listener, false);
                            this._workerListeners.splice(j, 1);
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
             * Cancel a resize in progress
             * @expose
             * @private
             * @returns {DGTable} self
             */
            cancelColumnResize: function() {
                if (this._$resizer) {
                    this._$resizer.remove();
                    this._$resizer = null;
                    $(document).off('mousemove.dgtable', this._onMouseMoveResizeAreaBound)
                        .off('mouseup.dgtable', this._onEndDragColumnHeaderBound);
                }
                return this;
            },

            /**
             * @param {jQuery.Event} event
             */
            _onVirtualTableScrolled: function (event) {
                this.render();
            },

            /**
             * @param {jQuery.Event} event
             */
            _onTableScrolledHorizontally: function (event) {
                this._header.scrollLeft = this._table.scrollLeft;
            },

            /**previousElementSibling
             * Reverse-calculate the column to resize from mouse position
             * @private
             * @param {jQuery.Event} e jQuery mouse event
             * @returns {String} name of the column which the mouse is over, or null if the mouse is not in resize position
             */
            _getColumnByResizePosition: function (e) {

                var settings = this.settings,
                    rtl = this._isTableRtl();

                var $headerCell = $(e.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName),
                    headerCell = $headerCell[0];
                if (headerCell['__cell']) {
                    headerCell = headerCell['__cell'];
                    $headerCell = $(headerCell);
                }

                var previousElementSibling = $headerCell[0].previousSibling;
                while (previousElementSibling && previousElementSibling.nodeType != 1) {
                    previousElementSibling = previousElementSibling.previousSibling;
                }

                var firstCol = !previousElementSibling;

                var mouseX = ((e.pageX != null ? e.pageX : e.originalEvent.pageX) || e.originalEvent.clientX) - $headerCell.offset().left;

                if (rtl) {
                    if (!firstCol && $headerCell.outerWidth() - mouseX <= settings.resizeAreaWidth / 2) {
                        return previousElementSibling['columnName'];
                    } else if (mouseX <= settings.resizeAreaWidth / 2) {
                        return headerCell['columnName'];
                    }
                } else {
                    if (!firstCol && mouseX <= settings.resizeAreaWidth / 2) {
                        return previousElementSibling['columnName'];
                    } else if ($headerCell.outerWidth() - mouseX <= settings.resizeAreaWidth / 2) {
                        return headerCell['columnName'];
                    }
                }

                return null;
            },

            /**
             * @param {jQuery.Event} e event
             */
            _onTouchStartColumnHeader: function (event) {
                var self = this;
                if (self._currentTouchId) return;

                var startTouch = event.originalEvent.changedTouches[0];
                self._currentTouchId = startTouch.identifier;

                var $eventTarget = $(event.currentTarget);

                var startPos = { x: startTouch.pageX, y: startTouch.pageY },
                    currentPos = startPos,
                    distanceTreshold = 9;

                var unbind = function () {
                    self._currentTouchId = null;
                    $eventTarget.off('touchend').off('touchcancel');
                    clearTimeout(tapAndHoldTimeout);
                };

                var fakeEvent = function (name) {
                    var fakeEvent = $.Event(name);
                    var extendObjects = Array.prototype.slice.call(arguments, 1);
                    $.each(['target', 'clientX', 'clientY', 'offsetX', 'offsetY', 'screenX', 'screenY', 'pageX', 'pageY', 'which'],
                        function () {
                            fakeEvent[this] = event[this];
                            for (var i = 0; i < extendObjects.length; i++) {
                                if (extendObjects[i][this] != null) {
                                    fakeEvent[this] = extendObjects[i][this];
                                }
                            }
                        });
                    return fakeEvent;
                };

                $eventTarget.trigger(fakeEvent('mousedown', event.originalEvent.changedTouches[0], { 'which': 1 }));

                var tapAndHoldTimeout = setTimeout(function () {
                    unbind();

                    // Prevent simulated mouse events after touchend
                    $eventTarget.one('touchend', function (event) {
                        event.preventDefault();
                        $eventTarget.off('touchend').off('touchcancel');
                    }).one('touchcancel', function (event) {
                        $eventTarget.off('touchend').off('touchcancel');
                    });

                    var distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

                    if (distanceTravelled < distanceTreshold) {
                        self.cancelColumnResize();
                        $eventTarget.trigger(fakeEvent('mouseup', event.originalEvent.changedTouches[0], { 'which': 3 }));
                    }

                }, 500);

                $eventTarget.on('touchend', function (event) {
                    var touch = _.find(event.originalEvent.changedTouches, function(touch){ return touch.identifier === self._currentTouchId; });
                    if (!touch) return;

                    unbind();

                    event.preventDefault(); // Prevent simulated mouse events

                    currentPos = { x: touch.pageX, y: touch.pageY };
                    var distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

                    if (distanceTravelled < distanceTreshold || self._$resizer) {
                        $eventTarget.trigger(fakeEvent('mouseup', touch, { 'which': 1 }));
                        $eventTarget.trigger(fakeEvent('click', touch, { 'which': 1 }));
                    }

                }).on('touchcancel', function () {
                    unbind();
                }).on('touchmove', function (event) {
                    var touch = _.find(event.originalEvent.changedTouches, function (touch) {
                        return touch.identifier === self._currentTouchId;
                    });
                    if (!touch) return;

                    // Keep track of current position, so we know if we need to cancel the tap-and-hold
                    currentPos = { x: touch.pageX, y: touch.pageY };

                    if (self._$resizer) {
                        event.preventDefault();

                        $eventTarget.trigger(fakeEvent('mousemove', touch));
                    }
                });
            },

            /**
             * @param {jQuery.Event} e event
             */
            _onMouseDownColumnHeader: function (event) {
                if (event.which !== 1) return this; // Only treat left-clicks

                var settings = this.settings,
                    col = this._getColumnByResizePosition(event);
                if (col) {
                    var column = this._columns.get(col);
                    if (!settings.resizableColumns || !column || !column.resizable) {
                        return false;
                    }

                    var rtl = this._isTableRtl();

                    if (this._$resizer) {
                        $(this._$resizer).remove();
                    }
                    this._$resizer = $('<div></div>')
                        .addClass(settings.resizerClassName)
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

                    var selectedHeaderCell = column.element,
                        commonAncestor = this._$resizer.parent();

                    var posCol = selectedHeaderCell.offset(),
                        posRelative = commonAncestor.offset();
                    if (ieVersion === 8) {
                        posCol = selectedHeaderCell.offset(); // IE8 bug, first time it receives zeros...
                    }
                    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
                    posRelative.top += parseFloat(commonAncestor.css('border-top-width')) || 0;
                    posCol.left -= posRelative.left;
                    posCol.top -= posRelative.top;
                    posCol.top -= parseFloat(selectedHeaderCell.css('border-top-width')) || 0;
                    var resizerWidth = this._$resizer.outerWidth();
                    if (rtl) {
                        posCol.left -= Math.ceil((parseFloat(selectedHeaderCell.css('border-left-width')) || 0) / 2);
                        posCol.left -= Math.ceil(resizerWidth / 2);
                    } else {
                        posCol.left += selectedHeaderCell.outerWidth();
                        posCol.left += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
                        posCol.left -= Math.ceil(resizerWidth / 2);
                    }

                    this._$resizer
                        .css({
                            'z-index': '10',
                            'visibility': 'visible',
                            'left': posCol.left,
                            'top': posCol.top,
                            'height': this.$el.height()
                        })
                        [0]['columnName'] = selectedHeaderCell[0]['columnName'];
                    try { this._$resizer[0].style.zIndex = ''; } catch (err) { }

                    $(document).on('mousemove.dgtable', this._onMouseMoveResizeAreaBound);
                    $(document).on('mouseup.dgtable', this._onEndDragColumnHeaderBound);

                    event.preventDefault();
                }
            },

            /**
             * @param {jQuery.Event} event event
             */
            _onMouseMoveColumnHeader: function (event) {
                var settings = this.settings;
                if (settings.resizableColumns) {
                    var col = this._getColumnByResizePosition(event);
                    var headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName)[0];
                    if (!col || !this._columns.get(col).resizable) {
                        headerCell.style.cursor = '';
                    } else {
                        headerCell.style.cursor = 'e-resize';
                    }
                }
            },

            /**
             * @param {jQuery.Event} e event
             */
            _onMouseUpColumnHeader: function (event) {
                if (event.which === 3) {
                    var settings = this.settings;
                    var $headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName);
                    var bounds = $headerCell.offset();
                    bounds['width'] = $headerCell.outerWidth();
                    bounds['height'] = $headerCell.outerHeight();
                    this.trigger('headercontextmenu', $headerCell[0]['columnName'], event.pageX, event.pageY, bounds);
                }
                return this;
            },

            /**
             * @private
             * @param {jQuery.Event} event event
             */
            _onMouseLeaveColumnHeader: function (event) {
                var settings = this.settings;
                var headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName)[0];
                headerCell.style.cursor = '';
            },

            /**
             * @private
             * @param {jQuery.Event} event event
             */
            _onClickColumnHeader: function (event) {
                if (!this._getColumnByResizePosition(event)) {
                    var settings = this.settings;
                    var headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName)[0];
                    if (settings.sortableColumns) {
                        var column = this._columns.get(headerCell['columnName']);
                        if (column && column.sortable) {
                            this.sort(headerCell['columnName'], undefined, true);
                        }
                    }
                }
            },

            /**
             * @private
             * @param {jQuery.Event} event event
             */
            _onStartDragColumnHeader: function (event) {
                var settings = this.settings;
                if (settings.movableColumns) {

                    var $headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName);
                    var column = this._columns.get($headerCell[0]['columnName']);
                    if (column && column.movable) {
                        $headerCell[0].style.opacity = 0.35;
                        this._dragId = Math.random() * 0x9999999; // Recognize this ID on drop
                        event.originalEvent.dataTransfer.setData('text', JSON.stringify({dragId: this._dragId, column: column.name}));
                    } else {
                        event.preventDefault();
                    }

                } else {

                    event.preventDefault();

                }

                return undefined;
            },

            /**
             * @private
             * @param {MouseEvent} event event
             */
            _onMouseMoveResizeArea: function (event) {

                var column = this._columns.get(this._$resizer[0]['columnName']);
                var rtl = this._isTableRtl();

                var selectedHeaderCell = column.element,
                    commonAncestor = this._$resizer.parent();
                var posCol = selectedHeaderCell.offset(), posRelative = commonAncestor.offset();
                posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
                posCol.left -= posRelative.left;
                var resizerWidth = this._$resizer.outerWidth();

                var actualX = event.pageX - posRelative.left;
                var minX = posCol.left;
                if (rtl) {
                    minX += selectedHeaderCell.outerWidth();
                    minX -= Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
                    minX -= Math.ceil(resizerWidth / 2);
                    minX -= this.settings.minColumnWidth;
                    minX -= this._horizontalPadding(selectedHeaderCell[0]);
                    if (actualX > minX) {
                        actualX = minX;
                    }
                } else {
                    minX += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
                    minX -= Math.ceil(resizerWidth / 2);
                    minX += this.settings.minColumnWidth;
                    minX += this._horizontalPadding(selectedHeaderCell[0]);
                    if (actualX < minX) {
                        actualX = minX;
                    }
                }

                this._$resizer.css('left', actualX + 'px');
            },

            /**
             * @private
             * @param {Event} event event
             */
            _onEndDragColumnHeader: function (event) {
                if (!this._$resizer) {
                    event.target.style.opacity = null;
                } else {
                    $(document).off('mousemove.dgtable', this._onMouseMoveResizeAreaBound)
                        .off('mouseup.dgtable', this._onEndDragColumnHeaderBound);

                    var column = this._columns.get(this._$resizer[0]['columnName']);
                    var rtl = this._isTableRtl();

                    var selectedHeaderCell = column.element,
                        commonAncestor = this._$resizer.parent();
                    var posCol = selectedHeaderCell.offset(), posRelative = commonAncestor.offset();
                    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
                    posCol.left -= posRelative.left;
                    var resizerWidth = this._$resizer.outerWidth();

                    var actualX = event.pageX - posRelative.left;
                    var baseX = posCol.left, minX = posCol.left;
                    var width = 0;
                    if (rtl) {
                        actualX += this._horizontalPadding(selectedHeaderCell[0]);
                        baseX += selectedHeaderCell.outerWidth();
                        baseX -= Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
                        baseX -= Math.ceil(resizerWidth / 2);
                        minX = baseX;
                        minX -= this.settings.minColumnWidth;
                        if (actualX > minX) {
                            actualX = minX;
                        }
                        width = baseX - actualX;
                    } else {
                        actualX -= this._horizontalPadding(selectedHeaderCell[0]);
                        baseX += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
                        baseX -= Math.ceil(resizerWidth / 2);
                        minX = baseX;
                        minX += this.settings.minColumnWidth;
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
             * @param {jQuery.Event} event event
             */
            _onDragEnterColumnHeader: function (event) {
                var settings = this.settings;
                if (settings.movableColumns) {
                    var dataTransferred = event.originalEvent.dataTransfer.getData('text');
                    if (dataTransferred) {
                        dataTransferred = JSON.parse(dataTransferred);
                    }
                    else {
                        dataTransferred = null; // WebKit does not provide the dataTransfer on dragenter?..
                    }

                    var $headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName);
                    if (!dataTransferred ||
                        (this._dragId == dataTransferred.dragId && $headerCell['columnName'] !== dataTransferred.column)) {

                        var column = this._columns.get($headerCell[0]['columnName']);
                        if (column && (column.movable || column != this._visibleColumns[0])) {
                            $($headerCell).addClass('drag-over');
                        }
                    }
                }
            },

            /**
             * @private
             * @param {jQuery.Event} event event
             */
            _onDragOverColumnHeader: function (event) {
                event.preventDefault();
            },

            /**
             * @private
             * @param {jQuery.Event} event event
             */
            _onDragLeaveColumnHeader: function (event) {
                var settings = this.settings;
                var $headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName);
                if ( ! $($headerCell[0].firstChild)
                       .has(event.originalEvent.relatedTarget).length ) {
                    $headerCell.removeClass('drag-over');
                }
            },

            /**
             * @private
             * @param {jQuery.Event} event event
             */
            _onDropColumnHeader: function (event) {
                event.preventDefault();
                var settings = this.settings;
                var dataTransferred = JSON.parse(event.originalEvent.dataTransfer.getData('text'));
                var $headerCell = $(event.target).closest('div.' + settings.tableClassName + '-header-cell,div.' + settings.cellPreviewClassName);
                if (settings.movableColumns && dataTransferred.dragId == this._dragId) {
                    var srcColName = dataTransferred.column,
                        destColName = $headerCell[0]['columnName'],
                        srcCol = this._columns.get(srcColName),
                        destCol = this._columns.get(destColName);
                    if (srcCol && destCol && srcCol.movable && (destCol.movable || destCol != this._visibleColumns[0])) {
                        this.moveColumn(srcColName, destColName);
                    }
                }
                $($headerCell).removeClass('drag-over');
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _clearSortArrows: function () {
                if (this._$table) {
                    var tableClassName = this.settings.tableClassName;
                    var sortedColumns = this._$headerRow.find('>div.' + tableClassName + '-header-cell.sorted');
                    var arrows = sortedColumns.find('>div>.sort-arrow');
                    _.forEach(arrows, _.bind(function(arrow){
                        var col = this._columns.get(arrow.parentNode.parentNode['columnName']);
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

                if (col.widthMode != COLUMN_WIDTH_MODE.RELATIVE && this.settings.adjustColumnWidthForSortArrow) {
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
                var headerCells = this._$headerRow.find('div.' + this.settings.tableClassName + '-header-cell');
                var col = this._columns.get(headerCells[cellIndex]['columnName']);

                if (col) {
                    headerCells[cellIndex].style.width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';

                    var width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';
                    var tbodyChildren = this._$tbody[0].childNodes;
                    for (var i = 0, count = tbodyChildren.length, headerRow; i < count; i++) {
                        headerRow = tbodyChildren[i];
                        if (headerRow.nodeType !== 1) continue;
                        headerRow.childNodes[cellIndex].style.width = width;
                    }
                }

                return this;
            },

            /**
             * @returns {DGTable} self
             * */
            _unbindHeaderEvents: function() {
                if (this._$headerRow) {
                    this._$headerRow.find('div.' + this.settings.tableClassName + '-header-cell')
                        .off('.dgtable')
                        .find('>div')
                        .off('.dgtable');
                }
                return this;
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _renderSkeleton: function () {
                var self = this;

                self._unbindHeaderEvents();
                self._currentTouchId = null;

                var settings = this.settings,
                    allowCellPreview = settings.allowCellPreview,
                    allowHeaderCellPreview = settings.allowHeaderCellPreview;

                var tableClassName = settings.tableClassName,
                    headerCellClassName = tableClassName + '-header-cell',
                    header = createElement('div'),
                    $header = $(header),
                    headerRow = createElement('div'),
                    $headerRow = $(headerRow);

                header.className = tableClassName + '-header';
                headerRow.className = tableClassName + '-header-row';

                var ieDragDropHandler;
                if (hasIeDragAndDropBug) {
                    ieDragDropHandler = function(evt) {
                        evt.preventDefault();
                        this.dragDrop();
                        return false;
                    };
                }

                var preventDefault = function (event) { event.preventDefault(); };

                for (var i = 0, column, cell, cellInside, $cell; i < self._visibleColumns.length; i++) {
                    column = self._visibleColumns[i];
                    if (column.visible) {
                        cell = createElement('div');
                        $cell = $(cell);
                        cell.draggable = true;
                        cell.className = headerCellClassName;
                        cell.style.width = column.actualWidth + 'px';
                        if (settings.sortableColumns && column.sortable) {
                            cell.className += ' sortable';
                        }
                        cell['columnName'] = column.name;
                        cellInside = createElement('div');
                        cellInside.innerHTML = settings.headerCellFormatter(column.label, column.name);
                        cell.appendChild(cellInside);
                        if (allowCellPreview && allowHeaderCellPreview) {
                            this._hookCellHoverIn(cell);
                        }
                        headerRow.appendChild(cell);

                        self._visibleColumns[i].element = $cell;

                        $cell.on('mousedown.dgtable', _.bind(self._onMouseDownColumnHeader, self))
                            .on('mousemove.dgtable', _.bind(self._onMouseMoveColumnHeader, self))
                            .on('mouseup.dgtable', _.bind(self._onMouseUpColumnHeader, self))
                            .on('mouseleave.dgtable', _.bind(self._onMouseLeaveColumnHeader, self))
                            .on('touchstart.dgtable', _.bind(self._onTouchStartColumnHeader, self))
                            .on('dragstart.dgtable', _.bind(self._onStartDragColumnHeader, self))
                            .on('click.dgtable', _.bind(self._onClickColumnHeader, self))
                            .on('contextmenu.dgtable', preventDefault);
                        $(cellInside)
                            .on('dragenter.dgtable', _.bind(self._onDragEnterColumnHeader, self))
                            .on('dragover.dgtable', _.bind(self._onDragOverColumnHeader, self))
                            .on('dragleave.dgtable', _.bind(self._onDragLeaveColumnHeader, self))
                            .on('drop.dgtable', _.bind(self._onDropColumnHeader, self));

                        if (hasIeDragAndDropBug) {
                            $cell.on('selectstart.dgtable', _.bind(ieDragDropHandler, cell));
                        }

                        // Disable these to allow our own context menu events without interruption
                        $cell.css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none', '-o-user-select': 'none', 'user-select': 'none' });
                    }
                }

                if (this._$header) {
                    this._$header.remove();
                }
                this._$header = $header;
                this._header = header;
                this._$headerRow = $headerRow;
                this._headerRow = headerRow;
                $headerRow.appendTo(this._$header);
                $header.prependTo(this.$el);

                if (settings.width == DGTable.Width.SCROLL) {
                    this.el.style.overflow = 'hidden';
                } else {
                    this.el.style.overflow = '';
                }

                if (self._$table && settings.virtualTable) {
                    self._$table.remove();
                    if (self._$tbody) {
                        var rows = self._$tbody[0].childNodes;
                        for (var i = 0, len = rows.length; i < len; i++) {
                            self.trigger('rowdestroy', rows[i]);
                            self._unhookCellEventsForRow(rows[i]);
                        }
                    }
                    self._$table = self._table = self._$tbody = self._tbody = null;
                }

                relativizeElement(self.$el);

                if (!settings.height && settings.virtualTable) {
                    settings.height = this.$el.innerHeight();
                }

                // Calculate virtual row heights
                if (settings.virtualTable && !self._virtualRowHeight) {
                    var createDummyRow = function() {
                        var row = createElement('div'),
                            cell = row.appendChild(createElement('div')),
                            cellInner = cell.appendChild(createElement('div'));
                        row.className = tableClassName + '-row';
                        cell.className = tableClassName + '-cell';
                        cellInner.innerHTML = '0';
                        row.style.visibility = 'hidden';
                        row.style.position = 'absolute';
                        return row;
                    };

                    var $dummyTbody, $dummyWrapper = $('<div>')
                        .addClass(this.className)
                        .css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px', width: '1px', overflow: 'hidden' })
                        .append(
                        $('<div>').addClass(tableClassName).append(
                            $dummyTbody = $('<div>').addClass(tableClassName + '-body').css('width', 99999)
                        )
                    );

                    $dummyWrapper.appendTo(document.body);

                    var row1 = createDummyRow(), row2 = createDummyRow(), row3 = createDummyRow();
                    $dummyTbody.append(row1, row2, row3);

                    self._virtualRowHeightFirst = $(row1).outerHeight();
                    self._virtualRowHeight = $(row2).outerHeight();
                    self._virtualRowHeightLast = $(row3).outerHeight();
                    self._virtualRowHeightMin = Math.min(Math.min(self._virtualRowHeightFirst, self._virtualRowHeight), self._virtualRowHeightLast);
                    self._virtualRowHeightMax = Math.max(Math.max(self._virtualRowHeightFirst, self._virtualRowHeight), self._virtualRowHeightLast);

                    $dummyWrapper.remove();
                }

                // Create table skeleton
                if (!self._$table) {

                    var fragment = document.createDocumentFragment();
                    var table = createElement('div');
                    var $table = $(table);
                    table.className = settings.tableClassName;

                    if (settings.virtualTable) {
                        table.className += ' virtual';
                    }

                    var tableHeight = (settings.height - $headerRow.outerHeight());
                    if ($table.css('box-sizing') !== 'border-box') {
                        tableHeight -= parseFloat($table.css('border-top-width')) || 0;
                        tableHeight -= parseFloat($table.css('border-bottom-width')) || 0;
                        tableHeight -= parseFloat($table.css('padding-top')) || 0;
                        tableHeight -= parseFloat($table.css('padding-bottom')) || 0;
                    }
                    self._visibleHeight = tableHeight;
                    table.style.height = settings.height ? tableHeight + 'px' : 'auto';
                    table.style.display = 'block';
                    table.style.overflowY = 'auto';
                    table.style.overflowX = settings.width == DGTable.Width.SCROLL ? 'auto' : 'hidden';
                    fragment.appendChild(table);

                    var tbody = createElement('div');
                    var $tbody = $(tbody);
                    tbody.className = settings.tableClassName + '-body';
                    self._table = table;
                    self._tbody = tbody;
                    self._$table = $table;
                    self._$tbody = $tbody;

                    if (settings.virtualTable) {
                        self._virtualVisibleRows = Math.ceil(self._visibleHeight / self._virtualRowHeightMin);
                    }

                    self._calculateVirtualHeight();

                    relativizeElement($tbody);
                    relativizeElement($table);

                    table.appendChild(tbody);
                    self.el.appendChild(fragment);
                }

                return self;
            },

            /**
             * @private
             * @returns {DGTable} self
             */
            _updateLastCellWidthFromScrollbar: function(force) {
                // Calculate scrollbar's width and reduce from lat column's width
                var scrollbarWidth = this._table.offsetWidth - this._table.clientWidth;
                if (scrollbarWidth != this._scrollbarWidth || force) {
                    this._scrollbarWidth = scrollbarWidth;
                    for (var i = 0; i < this._columns.length; i++) {
                        this._columns[i].actualWidthConsideringScrollbarWidth = null;
                    }

                    if (this._scrollbarWidth > 0) {
                        var lastColIndex = this._visibleColumns.length - 1;
                        this._visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth = this._visibleColumns[lastColIndex].actualWidth - this._scrollbarWidth;
                        var lastColWidth = this._visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth + 'px';
                        var tbodyChildren = this._tbody.childNodes;
                        for (var i = 0, count = tbodyChildren.length, row; i < count; i++) {
                            row = tbodyChildren[i];
                            if (row.nodeType !== 1) continue;
                            row.childNodes[lastColIndex].style.width = lastColWidth;
                        }

                        this._headerRow.childNodes[lastColIndex].style.width = lastColWidth;
                    }
                }
                return this;
            },

            /**
             * Explicitly set the width of the table based on the sum of the column widths
             * @private
             * @param {boolean} parentSizeMayHaveChanged Parent size may have changed, treat rendering accordingly
             * @returns {DGTable} self
             */
            _updateTableWidth: function (parentSizeMayHaveChanged) {
                var settings = this.settings,
                    width = this._calculateTbodyWidth();
                this._tbody.style.minWidth = width + 'px';
                this._headerRow.style.minWidth = (width + (this._scrollbarWidth || 0)) + 'px';

                this._$table.off('scroll', this._onTableScrolledHorizontallyBound);

                if (settings.width == DGTable.Width.AUTO) {
                    // Update wrapper element's size to full contain the table body
                    this.$el.width(this._$table.width(this._$tbody.outerWidth()).outerWidth());
                } else if (settings.width == DGTable.Width.SCROLL) {

                    if (parentSizeMayHaveChanged) {
                        var lastScrollTop = this._table ? this._table.scrollTop : 0,
                            lastScrollLeft = this._table ? this._table.scrollLeft : 0;

                        // BUGFIX: Relayout before recording the widths
                        webkitRenderBugfix(this.el);

                        this._table.scrollTop = lastScrollTop;
                        this._table.scrollLeft = lastScrollLeft;
                        this._header.scrollLeft = lastScrollLeft;
                    }

                    this._$table.on('scroll', this._onTableScrolledHorizontallyBound);
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
                var self = this,
                    settings = self.settings;

                settings.abortCellPreview = false;

                var elInner = el.firstChild;

                if ((elInner.scrollWidth - elInner.clientWidth > 1) ||
                    (elInner.scrollHeight - elInner.clientHeight > 1)) {

                    self._hideCellPreview();

                    var $el = $(el), $elInner = $(elInner);
                    var div = createElement('div'), $div = $(div);
                    div.innerHTML = el.innerHTML;
                    div.className = settings.cellPreviewClassName;

                    var isHeaderCell = $el.hasClass(settings.tableClassName + '-header-cell');
                    if (isHeaderCell) {
                        div.className += ' header';
                        if ($el.hasClass('sortable')) {
                            div.className += ' sortable';
                        }

                        div.draggable = true;

                        $(div).on('mousedown', _.bind(self._onMouseDownColumnHeader, self))
                            .on('mousemove', _.bind(self._onMouseMoveColumnHeader, self))
                            .on('mouseup', _.bind(self._onMouseUpColumnHeader, self))
                            .on('mouseleave', _.bind(self._onMouseLeaveColumnHeader, self))
                            .on('touchstart', _.bind(self._onTouchStartColumnHeader, self))
                            .on('dragstart', _.bind(self._onStartDragColumnHeader, self))
                            .on('click', _.bind(self._onClickColumnHeader, self))
                            .on('contextmenu.dgtable', function (event) { event.preventDefault(); });
                        $(div.firstChild)
                            .on('dragenter', _.bind(self._onDragEnterColumnHeader, self))
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

                    var requiredWidth = elInner.scrollWidth + el.clientWidth - elInner.offsetWidth;

                    var borderBox = $el.css('boxSizing') === 'border-box';
                    if (borderBox) {
                        requiredWidth -= parseFloat($(el).css('border-left-width')) || 0;
                        requiredWidth -= parseFloat($(el).css('border-right-width')) || 0;
                        $div.css('box-sizing', 'border-box');
                    } else {
                        requiredWidth -= paddingL + paddingR;
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
                        'min-height': $el.height() + 'px',
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
                        'direction': $elInner.css('direction'),
                        'white-space': $elInner.css('white-space')
                    });

                    if (isHeaderCell) {
                        // Disable these to allow our own context menu events without interruption
                        $div.css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none', '-o-user-select': 'none', 'user-select': 'none' });
                    }

                    div['rowIndex'] = el.parentNode['rowIndex'];
                    var physicalRowIndex = div['physicalRowIndex'] = el.parentNode['physicalRowIndex'];
                    div['columnName'] = self._visibleColumns[_.indexOf(el.parentNode.childNodes, el)].name;

                    self.trigger('cellpreview', div.firstChild, physicalRowIndex == null ? null : physicalRowIndex, div['columnName'], physicalRowIndex == null ? null : self._rows[physicalRowIndex]);
                    if (settings.abortCellPreview) return;

                    var offset = $el.offset();

                    if ($el.css('float') === 'right') {
                        var w = $div.outerWidth();
                        var elW = $el.outerWidth();
                        offset.left -= w - elW;
                        offset.left -= parseFloat($(el).css('border-right-width')) || 0;
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

                    $div.on('mousewheel', function (event) {
                        var originalEvent = event.originalEvent;
                        var xy = originalEvent.wheelDelta || -originalEvent.detail,
                            x = originalEvent.wheelDeltaX || (originalEvent.axis == 1 ? xy : 0),
                            y = originalEvent.wheelDeltaY || (originalEvent.axis == 2 ? xy : 0);

                        if (xy) {
                            self._hideCellPreview();
                        }

                        if (y && self._table.scrollHeight > self._table.clientHeight) {
                            var scrollTop = (y * -1) + self._$table.scrollTop();
                            self._$table.scrollTop(scrollTop);
                        }

                        if (x && self._table.scrollWidth > self._table.clientWidth) {
                            var scrollLeft = (x * -1) + self._$table.scrollLeft();
                            self._$table.scrollLeft(scrollLeft);
                        }
                    });
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
                    this._$cellPreviewEl.remove();
                    this._unhookCellHoverOut(div['__cell']);
                    this._unhookCellHoverOut(div);

                    div['__cell']['__previewEl'] = null;
                    div['__cell'] = null;

                    this.trigger('cellpreviewdestroy', div.firstChild, div['physicalRowIndex'], div['columnName']);

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