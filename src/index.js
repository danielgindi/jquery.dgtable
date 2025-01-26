/* eslint-env browser */

'use strict';

import jQuery from 'jquery';
import { find, htmlEncode, includes } from './util.js';
import RowCollection from './row_collection.js';
import ColumnCollection from './column_collection.js';
import SelectionHelper from './SelectionHelper.js';
import {
    getScrollHorz,
    setScrollHorz,
} from '@danielgindi/dom-utils/lib/ScrollHelper.js';
import {
    getElementWidth,
    getElementHeight,
    setElementWidth,
} from '@danielgindi/dom-utils/lib/Css.js';
import VirtualListHelper from '@danielgindi/virtual-list-helper';
import ByColumnFilter from './by_column_filter.js';

const nativeIndexOf = Array.prototype.indexOf;
const $ = jQuery;

let userAgent = navigator.userAgent;
let ieVersion = userAgent.indexOf('MSIE ') !== -1 ? parseFloat(userAgent.substr(userAgent.indexOf('MSIE ') + 5)) : null;
let hasIeDragAndDropBug = ieVersion && ieVersion < 10;
let createElement = document.createElement.bind(document);
const hasOwnProperty = Object.prototype.hasOwnProperty;

const IsSafeSymbol = Symbol('safe');
const HoverInEventSymbol = Symbol('hover_in');
const HoverOutEventSymbol = Symbol('hover_out');
const RowClickEventSymbol = Symbol('row_click');

function webkitRenderBugfix(el) {
    // BUGFIX: WebKit has a bug where it does not relayout, and this affects us because scrollbars
    //   are still calculated even though they are not there yet. This is the last resort.
    let oldDisplay = el.style.display;
    el.style.display = 'none';
    //noinspection BadExpressionStatementJS
    el.offsetHeight; // No need to store this anywhere, the reference is enough
    el.style.display = oldDisplay;
    return el;
}

function relativizeElement($el) {
    if (!includes(['relative', 'absolute', 'fixed'], $el.css('position'))) {
        $el.css('position', 'relative');
    }
}

const isInputElementEvent = event => /^(?:INPUT|TEXTAREA|BUTTON|SELECT)$/.test(event.target.tagName);

/** @class DGTable */
let DGTable = function DGTable () {
    if (!(this instanceof DGTable)) {
        // Allow constructing without `new`
        return new (Function.prototype.bind.apply(
            DGTable,
            [DGTable].concat(Array.prototype.slice.call(arguments, 0))));
    }

    this.initialize.apply(this, arguments);
};

/**
 * @public
 * @expose
 * @type {string}
 */
DGTable.VERSION = '@@VERSION';

/**
 * @public
 * @expose
 * @type {string}
 */
DGTable.prototype.VERSION = DGTable.VERSION;

/**
 * @constructs
 * @param {DGTable.Options?} options - initialization options
 * @returns {DGTable}
 */
DGTable.prototype.initialize = function (options) {
    let that = this;

    options = options || {};

    /**
     * @private
     * @type {DGTable.Options}
     * */
    let o = that.o = {};

    /**
     * @private
     * This is for encapsulating private data */
    let p = that.p = {};

    /** This is for encapsulating event callback */
    p.events = {};

    /**
     * @public
     * @expose
     * */
    that.el = (options.el && options.el instanceof Element) ? options.el : document.createElement('div');

    /**
     * @public
     * @expose
     * */
    let $el = that.$el = $(that.el);

    if (that.el !== options.el) {
        $el.addClass(options.className || 'dgtable-wrapper');
    }

    // Set control data
    $el
        .data('control', that)
        .data('dgtable', that);

    // For jQuery.UI or jquery.removeevent
    $el.on('remove', () => that.destroy());

    p.onMouseMoveResizeAreaBound = this._onMouseMoveResizeArea.bind(this);
    p.onEndDragColumnHeaderBound = this._onEndDragColumnHeader.bind(this);
    p.onTableScrolledHorizontallyBound = this._onTableScrolledHorizontally.bind(this);

    this.$el.on('dragend', p.onEndDragColumnHeaderBound);

    /**
     * @private
     * @field {boolean} _tableSkeletonNeedsRendering */
    p.tableSkeletonNeedsRendering = true;

    /**
     * @private
     * @field {boolean} virtualTable */
    o.virtualTable = options.virtualTable === undefined ? true : !!options.virtualTable;

    /**
     * @private
     * @field {number} estimatedRowHeight */
    o.estimatedRowHeight = options.estimatedRowHeight || undefined;

    /**
     * @private
     * @field {number} rowsBufferSize */
    o.rowsBufferSize = options.rowsBufferSize || 3;

    /**
     * @private
     * @field {number} minColumnWidth */
    o.minColumnWidth = Math.max(options.minColumnWidth || 35, 0);

    /**
     * @private
     * @field {number} resizeAreaWidth */
    o.resizeAreaWidth = options.resizeAreaWidth || 8;

    /**
     * @private
     * @field {boolean} resizableColumns */
    o.resizableColumns = options.resizableColumns === undefined ? true : !!options.resizableColumns;

    /**
     * @private
     * @field {boolean} movableColumns */
    o.movableColumns = options.movableColumns === undefined ? true : !!options.movableColumns;

    /**
     * @private
     * @field {number} sortableColumns */
    o.sortableColumns = options.sortableColumns === undefined ? 1 : (parseInt(options.sortableColumns, 10) || 1);

    /**
     * @private
     * @field {boolean} adjustColumnWidthForSortArrow */
    o.adjustColumnWidthForSortArrow = options.adjustColumnWidthForSortArrow === undefined ? true : !!options.adjustColumnWidthForSortArrow;

    /**
     * @private
     * @field {boolean} convertColumnWidthsToRelative */
    o.convertColumnWidthsToRelative = options.convertColumnWidthsToRelative === undefined ? false : !!options.convertColumnWidthsToRelative;

    /**
     * @private
     * @field {boolean} autoFillTableWidth */
    o.autoFillTableWidth = options.autoFillTableWidth === undefined ? false : !!options.autoFillTableWidth;

    /**
     * @private
     * @field {boolean} allowCancelSort */
    o.allowCancelSort = options.allowCancelSort === undefined ? true : !!options.allowCancelSort;

    /**
     * @private
     * @field {string} cellClasses */
    o.cellClasses = options.cellClasses === undefined ? '' : options.cellClasses;

    /**
     * @private
     * @field {string} resizerClassName */
    o.resizerClassName = options.resizerClassName === undefined ? 'dgtable-resize' : options.resizerClassName;

    /**
     * @private
     * @field {string} tableClassName */
    o.tableClassName = options.tableClassName === undefined ? 'dgtable' : options.tableClassName;

    /**
     * @private
     * @field {boolean} allowCellPreview */
    o.allowCellPreview = options.allowCellPreview === undefined ? true : options.allowCellPreview;

    /**
     * @private
     * @field {boolean} allowHeaderCellPreview */
    o.allowHeaderCellPreview = options.allowHeaderCellPreview === undefined ? true : options.allowHeaderCellPreview;

    /**
     * @private
     * @field {string} cellPreviewClassName */
    o.cellPreviewClassName = options.cellPreviewClassName === undefined ? 'dgtable-cell-preview' : options.cellPreviewClassName;

    /**
     * @private
     * @field {boolean} cellPreviewAutoBackground */
    o.cellPreviewAutoBackground = options.cellPreviewAutoBackground === undefined ? true : options.cellPreviewAutoBackground;

    /**
     * @private
     * @field {function(columnName: string, descending: boolean, defaultComparator: function(a,b):number):(function(a,b):number)} onComparatorRequired */
    o.onComparatorRequired = options.onComparatorRequired === undefined ? null : options.onComparatorRequired;
    if (!o.onComparatorRequired && typeof options['comparatorCallback'] === 'function') {
        o.onComparatorRequired = options['comparatorCallback'];
    }

    o.customSortingProvider = options.customSortingProvider === undefined ? null : options.customSortingProvider;

    /**
     * @private
     * @field {boolean} width */
    o.width = options.width === undefined ? DGTable.Width.NONE : options.width;

    /**
     * @private
     * @field {boolean} relativeWidthGrowsToFillWidth */
    o.relativeWidthGrowsToFillWidth = options.relativeWidthGrowsToFillWidth === undefined ? true : !!options.relativeWidthGrowsToFillWidth;

    /**
     * @private
     * @field {boolean} relativeWidthShrinksToFillWidth */
    o.relativeWidthShrinksToFillWidth = options.relativeWidthShrinksToFillWidth === undefined ? false : !!options.relativeWidthShrinksToFillWidth;

    this.setCellFormatter(options.cellFormatter);
    this.setHeaderCellFormatter(options.headerCellFormatter);
    this.setFilter(options.filter);

    /** @private
     * @field {number} height */
    o.height = options.height;

    // Prepare columns
    that.setColumns(options.columns || [], false);

    // Set sorting columns
    let sortColumns = [];

    if (options.sortColumn) {

        let tmpSortColumns = options.sortColumn;

        if (tmpSortColumns && !Array.isArray(tmpSortColumns)) {
            tmpSortColumns = [tmpSortColumns];
        }

        if (tmpSortColumns) {
            for (let i = 0, len = tmpSortColumns.length; i < len; i++) {
                let sortColumn = tmpSortColumns[i];
                if (typeof sortColumn === 'string') {
                    sortColumn = { column: sortColumn, descending: false };
                }
                let col = p.columns.get(sortColumn.column);
                if (!col) continue;

                sortColumns.push({
                    column: sortColumn.column,
                    comparePath: col.comparePath || col.dataPath,
                    descending: sortColumn.descending,
                });
            }
        }
    }

    /** @field {RowCollection} _rows */
    p.rows = new RowCollection({ sortColumn: sortColumns });
    p.rows.onComparatorRequired = (column, descending, defaultComparator) => {
        if (o.onComparatorRequired) {
            return o.onComparatorRequired(column, descending, defaultComparator);
        }
    };
    p.rows.customSortingProvider = (data, sort) => {
        if (o.customSortingProvider) {
            return o.customSortingProvider(data, sort);
        } else {
            return sort(data);
        }
    };

    /** @private
     * @field {RowCollection} _filteredRows */
    p.filteredRows = null;

    p.scrollbarWidth = 0;
    p.lastVirtualScrollHeight = 0;

    this._setupHovers();
};

DGTable.prototype._setupHovers = function () {
    const that = this, p = that.p;

    /*
     Setup hover mechanism.
     We need this to be high performance, as there may be MANY cells to call this on, on creation and destruction.
     Using native events to spare the overhead of jQuery's event binding, and even just the creation of the jQuery collection object.
     */

    /**
     * @param {MouseEvent} event
     * @this {HTMLElement}
     * */
    let hoverMouseOverHandler = function (event) {
        let relatedTarget = event.fromElement || event.relatedTarget;
        if (relatedTarget === this || $.contains(this, relatedTarget)) return;
        if (this['__previewCell'] && (relatedTarget === this['__previewCell'] || $.contains(this['__previewCell'], relatedTarget))) return;
        that._cellMouseOverEvent.call(that, this);
    };

    /**
     * @param {MouseEvent} evt
     * @this {HTMLElement}
     * */
    let hoverMouseOutHandler = function (evt) {
        evt = evt || event;
        let relatedTarget = evt.toElement || evt.relatedTarget;
        if (relatedTarget === this || $.contains(this, relatedTarget)) return;
        if (this['__previewCell'] && (relatedTarget === this['__previewCell'] || $.contains(this['__previewCell'], relatedTarget))) return;
        that._cellMouseOutEvent.call(that, this);
    };

    /**
     * @param {HTMLElement} el cell or header-cell
     * */
    p._bindCellHoverIn = function (el) {
        if (!el[HoverInEventSymbol]) {
            el.addEventListener('mouseover', el[HoverInEventSymbol] = hoverMouseOverHandler.bind(el));
        }
    };

    /**
     * @param {HTMLElement} el cell or header-cell
     * */
    p._unbindCellHoverIn = function (el) {
        if (el[HoverInEventSymbol]) {
            el.removeEventListener('mouseover', el[HoverInEventSymbol]);
            el[HoverInEventSymbol] = null;
        }
    };

    /**
     * @param {HTMLElement} el cell or header-cell
     * @returns {DGTable} self
     * */
    p._bindCellHoverOut = function (el) {
        if (!el[HoverOutEventSymbol]) {
            el.addEventListener('mouseout', el[HoverOutEventSymbol] = hoverMouseOutHandler.bind(el['__cell'] || el));
        }
        return this;
    };

    /**
     * @param {HTMLElement} el cell or header-cell
     * @returns {DGTable} self
     * */
    p._unbindCellHoverOut = function (el) {
        if (el[HoverOutEventSymbol]) {
            el.removeEventListener('mouseout', el[HoverOutEventSymbol]);
            el[HoverOutEventSymbol] = null;
        }
        return this;
    };
};

DGTable.prototype._setupVirtualTable = function () {
    const that = this, p = that.p, o = that.o;

    const tableClassName = o.tableClassName,
        rowClassName = tableClassName + '-row',
        altRowClassName = tableClassName + '-row-alt',
        cellClassName = tableClassName + '-cell';

    let visibleColumns = p.visibleColumns,
        colCount = visibleColumns.length;

    p.notifyRendererOfColumnsConfig = () => {
        visibleColumns = p.visibleColumns;
        colCount = visibleColumns.length;

        for (let colIndex = 0, column; colIndex < colCount; colIndex++) {
            column = visibleColumns[colIndex];
            column._finalWidth = (column.actualWidthConsideringScrollbarWidth || column.actualWidth);
        }
    };

    p.virtualListHelper = new VirtualListHelper({
        list: p.table,
        itemsParent: p.tbody,
        autoVirtualWrapperWidth: false,
        virtual: o.virtualTable,
        buffer: o.rowsBufferSize,
        estimatedItemHeight: o.estimatedRowHeight ? o.estimatedRowHeight : (p.virtualRowHeight || 40),
        itemElementCreatorFn: () => {
            return createElement('div');
        },
        onItemRender: (row, index) => {
            const rows = p.filteredRows || p.rows,
                isDataFiltered = !!p.filteredRows,
                allowCellPreview = o.allowCellPreview;

            row.className = rowClassName;
            if ((index % 2) === 1)
                row.className += ' ' + altRowClassName;

            let rowData = rows[index];
            let physicalRowIndex = isDataFiltered ? rowData['__i'] : index;

            row['rowIndex'] = index;
            row['physicalRowIndex'] = physicalRowIndex;

            for (let colIndex = 0; colIndex < colCount; colIndex++) {
                let column = visibleColumns[colIndex];
                let cell = createElement('div');
                cell['columnName'] = column.name;
                cell.setAttribute('data-column', column.name);
                cell.className = cellClassName;
                cell.style.width = column._finalWidth + 'px';
                if (column.cellClasses) cell.className += ' ' + column.cellClasses;
                if (allowCellPreview) {
                    p._bindCellHoverIn(cell);
                }

                let cellInner = cell.appendChild(createElement('div'));
                cellInner.innerHTML = this._getHtmlForCell(rowData, column);

                row.appendChild(cell);
            }

            row.addEventListener('click', row[RowClickEventSymbol] = event => {
                that.trigger('rowclick', event, index, physicalRowIndex, row, rowData);
            });

            that.trigger('rowcreate', index, physicalRowIndex, row, rowData);
        },

        onItemUnrender: (row) => {
            if (row[RowClickEventSymbol]) {
                row.removeEventListener('click', row[RowClickEventSymbol]);
            }

            that._unbindCellEventsForRow(row);

            that.trigger('rowdestroy', row);
        },

        onScrollHeightChange: height => {
            // only recalculate scrollbar width if height increased. we reset it in other situations.
            if (height > p._lastVirtualScrollHeight && !p.scrollbarWidth) {
                this._updateLastCellWidthFromScrollbar();
            }

            p._lastVirtualScrollHeight = height;
        },
    });

    p.virtualListHelper.setCount((p.filteredRows ?? p.rows).length);

    p.notifyRendererOfColumnsConfig();
};

/**
 * Add an event listener
 * @public
 * @expose
 * @param {string} eventName
 * @param {Function} callback
 * @returns {DGTable}
 */
DGTable.prototype.on = function (eventName, callback) {
    let that = this, events = that.p.events;

    if (typeof callback !== 'function')
        return that;

    if (!hasOwnProperty.call(events, eventName))
        events[eventName] = [];

    events[eventName].push({
        cb: callback,
        once: false,
    });

    return that;
};

/**
 * Add an event listener for a one shot
 * @public
 * @expose
 * @param {string} eventName
 * @param {Function} callback
 * @returns {DGTable}
 */
DGTable.prototype.once = function (eventName, callback) {
    let that = this, events = that.p.events;

    if (typeof callback !== 'function')
        return that;

    if (!hasOwnProperty.call(events, eventName))
        events[eventName] = [];

    events[eventName].push({
        cb: callback,
        once: true,
    });

    return that;
};

/**
 * Remove an event listener
 * @public
 * @expose
 * @param {string} eventName
 * @param {Function} callback
 * @returns {DGTable}
 */
DGTable.prototype.off = function (eventName, callback) {
    let events = this.p.events;

    if (!hasOwnProperty.call(events, eventName))
        return this;

    let callbacks = events[eventName];
    for (let i = 0; i < callbacks.length; i++) {
        let item = callbacks[i];
        if (callback && item.cb !== callback) continue;
        callbacks.splice(i--, 1);
    }

    return this;
};

DGTable.prototype.trigger = function (eventName) {
    const p = this.p;
    if (!p) return;

    let events = p.events;

    if (hasOwnProperty.call(events, eventName)) {
        let callbacks = events[eventName];
        for (let i = 0; i < callbacks.length; i++) {
            let item = callbacks[i];
            if (item.once) {
                callbacks.splice(i--, 1);
            }
            item.cb.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }

    return this;
};

/**
 * Detect column width mode
 * @private
 * @param {Number|string} width
 * @param {number} minWidth
 * @returns {Object} parsed width
 */
DGTable.prototype._parseColumnWidth = function (width, minWidth) {

    let widthSize = Math.max(0, parseFloat(width)),
        widthMode = ColumnWidthMode.AUTO; // Default

    if (widthSize > 0) {
        // Well, it's sure is not AUTO, as we have a value

        if (width === widthSize + '%') {
            // It's a percentage!

            widthMode = ColumnWidthMode.RELATIVE;
            widthSize /= 100;
        } else if (widthSize > 0 && widthSize < 1) {
            // It's a decimal value, as a relative value!

            widthMode = ColumnWidthMode.RELATIVE;
        } else {
            // It's an absolute size!

            if (widthSize < minWidth) {
                widthSize = minWidth;
            }
            widthMode = ColumnWidthMode.ABSOLUTE;
        }
    }

    return { width: widthSize, mode: widthMode };
};

/**
 * @private
 * @param {COLUMN_OPTIONS} columnData
 */
DGTable.prototype._initColumnFromData = function(columnData) {

    let parsedWidth = this._parseColumnWidth(columnData.width, columnData.ignoreMin ? 0 : this.o.minColumnWidth);

    let col = {
        name: columnData.name,
        label: columnData.label === undefined ? columnData.name : columnData.label,
        width: parsedWidth.width,
        widthMode: parsedWidth.mode,
        resizable: columnData.resizable === undefined ? true : columnData.resizable,
        sortable: columnData.sortable === undefined ? true : columnData.sortable,
        movable: columnData.movable === undefined ? true : columnData.movable,
        visible: columnData.visible === undefined ? true : columnData.visible,
        cellClasses: columnData.cellClasses === undefined ? this.o.cellClasses : columnData.cellClasses,
        ignoreMin: columnData.ignoreMin === undefined ? false : !!columnData.ignoreMin,
    };

    col.dataPath = columnData.dataPath === undefined ? col.name : columnData.dataPath;
    col.comparePath = columnData.comparePath === undefined ? col.dataPath : columnData.comparePath;

    if (typeof col.dataPath === 'string') {
        col.dataPath = col.dataPath.split('.');
    }
    if (typeof col.comparePath === 'string') {
        col.comparePath = col.comparePath.split('.');
    }

    return col;
};

/**
 * Destroy, releasing all memory, events and DOM elements
 * @public
 * @expose
 */
DGTable.prototype.close = DGTable.prototype.remove = DGTable.prototype.destroy = function () {

    let that = this,
        p = that.p || {},
        $el = that.$el;

    if (that.__removed) {
        return that;
    }

    if (p.$resizer) {
        p.$resizer.remove();
        p.$resizer = null;
    }

    p.virtualListHelper?.destroy();
    p.virtualListHelper = null;

    // Using quotes for __super__ because Google Closure Compiler has a bug...

    this._destroyHeaderCells();

    if (p.$table) {
        p.$table.empty();
    }
    if (p.$tbody) {
        p.$tbody.empty();
    }

    if (p.workerListeners) {
        for (let j = 0; j < p.workerListeners.length; j++) {
            let worker = p.workerListeners[j];
            worker.worker.removeEventListener('message', worker.listener, false);
        }
        p.workerListeners.length = 0;
    }

    p.rows.length = p.columns.length = 0;

    if (p._deferredRender) {
        clearTimeout(p._deferredRender);
    }

    // Cleanup
    for (let prop in that) {
        if (hasOwnProperty.call(that, prop)) {
            that[prop] = null;
        }
    }

    that.__removed = true;

    if ($el) {
        $el.remove();
    }

    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._unbindCellEventsForTable = function() {
    const p = this.p;

    if (p.headerRow) {
        for (let i = 0, rows = p.headerRow.childNodes, rowCount = rows.length; i < rowCount; i++) {
            let rowToClean = rows[i];
            for (let j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
                p._unbindCellHoverIn(cells[j]);
            }
        }
    }

    return this;
};

/**
 * @private
 * @param {HTMLElement} rowToClean
 * @returns {DGTable} self
 */
DGTable.prototype._unbindCellEventsForRow = function(rowToClean) {
    const p = this.p;
    for (let i = 0, cells = rowToClean.childNodes, cellCount = cells.length; i < cellCount; i++) {
        p._unbindCellHoverIn(cells[i]);
    }
    return this;
};

/**
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.render = function () {
    const o = this.o, p = this.p;

    if (!this.el.offsetParent) {
        if (!p._deferredRender) {
            p._deferredRender = setTimeout(() => {
                p._deferredRender = null;
                if (!this.__removed && this.el.offsetParent) {
                    this.render();
                }
            });
        }

        return this;
    }

    if (p.tableSkeletonNeedsRendering === true) {
        p.tableSkeletonNeedsRendering = false;

        if (o.width === DGTable.Width.AUTO) {
            // We need to do this to return to the specified widths instead. The arrows added to the column widths...
            this._clearSortArrows();
        }

        let lastScrollTop = p.table && p.table.parentNode ? p.table.scrollTop : NaN,
            lastScrollHorz = p.table && p.table.parentNode ? getScrollHorz(p.table) : NaN;

        this._renderSkeletonBase()
            ._renderSkeletonBody()
            .tableWidthChanged(true, false) // Take this chance to calculate required column widths
            ._renderSkeletonHeaderCells();

        p.virtualListHelper.setCount((p.filteredRows ?? p.rows).length);

        this._updateVirtualHeight();
        this._updateLastCellWidthFromScrollbar(true);
        this._updateTableWidth(true);

        // Show sort arrows
        for (let i = 0; i < p.rows.sortColumn.length; i++) {
            this._showSortArrow(p.rows.sortColumn[i].column, p.rows.sortColumn[i].descending);
        }
        if (o.adjustColumnWidthForSortArrow && p.rows.sortColumn.length) {
            this.tableWidthChanged(true);
        } else if (!o.virtualTable) {
            this.tableWidthChanged();
        }

        if (!isNaN(lastScrollTop))
            p.table.scrollTop = lastScrollTop;

        if (!isNaN(lastScrollHorz)) {
            setScrollHorz(p.table, lastScrollHorz);
            setScrollHorz(p.header, lastScrollHorz);
        }

        this.trigger('renderskeleton');
    }

    p.virtualListHelper.render();

    this.trigger('render');
    return this;
};

/**
 * Forces a full render of the table
 * @public
 * @expose
 * @param {boolean=true} render - Should render now?
 * @returns {DGTable} self
 */
DGTable.prototype.clearAndRender = function (render) {
    let p = this.p;

    p.tableSkeletonNeedsRendering = true;
    p.notifyRendererOfColumnsConfig?.();

    if (render === undefined || render) {
        this.render();
    }

    return this;
};

/**
 * Calculate the size required for the table body width (which is the row's width)
 * @private
 * @returns {number} calculated width
 */
DGTable.prototype._calculateTbodyWidth = function () {
    const p = this.p;

    let tableClassName = this.o.tableClassName,
        rowClassName = tableClassName + '-row',
        cellClassName = tableClassName + '-cell',
        visibleColumns = p.visibleColumns,
        colCount = visibleColumns.length,
        cell,
        cellInner,
        colIndex,
        column;

    let $row = $('<div>').addClass(rowClassName).css('float', 'left');
    let sumActualWidth = 0;

    for (colIndex = 0; colIndex < colCount; colIndex++) {
        column = visibleColumns[colIndex];
        cell = createElement('div');
        cell.className = cellClassName;
        cell.style.width = column.actualWidth + 'px';
        if (column.cellClasses) cell.className += ' ' + column.cellClasses;
        cellInner = cell.appendChild(createElement('div'));
        $row.append(cell);
        sumActualWidth += column.actualWidth;
    }

    let $thisWrapper = $('<div>')
        .addClass(this.el.className)
        .css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px', 'float': 'left', width: '1px', overflow: 'hidden' })
        .append(
            $('<div>').addClass(tableClassName).append(
                $('<div>').addClass(tableClassName + '-body').css('width', sumActualWidth + 10000).append(
                    $row,
                ),
            ),
        );

    $thisWrapper.appendTo(document.body);

    let fractionTest = $('<div style="border:1.5px solid #000;width:0;height:0;position:absolute;left:0;top:-9999px">').appendTo(document.body);
    let fractionValue = parseFloat(fractionTest.css('border-width'));
    let hasFractions = Math.round(fractionValue) !== fractionValue;
    fractionTest.remove();

    let width = getElementWidth($row[0], true, true, true);
    width -= p.scrollbarWidth || 0;

    if (hasFractions) {
        width++;
    }

    $thisWrapper.remove();
    return width;
};

/**
 * Sets the columns of the table
 * @public
 * @expose
 * @param {COLUMN_OPTIONS[]} columns - Column definitions array
 * @param {boolean=true} render - Should render now?
 * @returns {DGTable} self
 */
DGTable.prototype.setColumns = function (columns, render) {
    const p = this.p;

    columns = columns || [];

    let normalizedCols = new ColumnCollection();
    for (let i = 0, order = 0; i < columns.length; i++) {

        let columnData = columns[i];
        let normalizedColumn = this._initColumnFromData(columnData);

        if (columnData.order !== undefined) {
            if (columnData.order > order) {
                order = columnData.order + 1;
            }
            normalizedColumn.order = columnData.order;
        } else {
            normalizedColumn.order = order++;
        }

        normalizedCols.push(normalizedColumn);
    }
    normalizedCols.normalizeOrder();

    p.columns = normalizedCols;
    p.visibleColumns = normalizedCols.getVisibleColumns();

    this._ensureVisibleColumns().clearAndRender(render);

    return this;
};

/**
 * Add a column to the table
 * @public
 * @expose
 * @param {COLUMN_OPTIONS} columnData column properties
 * @param {string|number} [before=-1] column name or order to be inserted before
 * @param {boolean=true} render - Should render now?
 * @returns {DGTable} self
 */
DGTable.prototype.addColumn = function (columnData, before, render) {
    const p = this.p;
    let columns = p.columns;

    if (columnData && !columns.get(columnData.name)) {
        let beforeColumn = null;
        if (before !== undefined) {
            beforeColumn = columns.get(before) || columns.getByOrder(before);
        }

        let column = this._initColumnFromData(columnData);
        column.order = beforeColumn ? beforeColumn.order : (columns.getMaxOrder() + 1);

        for (let i = columns.getMaxOrder(), to = column.order; i >= to ; i--) {
            let col = columns.getByOrder(i);
            if (col) {
                col.order++;
            }
        }

        columns.push(column);
        columns.normalizeOrder();

        p.visibleColumns = columns.getVisibleColumns();
        this._ensureVisibleColumns().clearAndRender(render);

        this.trigger('addcolumn', column.name);
    }
    return this;
};

/**
 * Remove a column from the table
 * @public
 * @expose
 * @param {string} column column name
 * @param {boolean=true} render - Should render now?
 * @returns {DGTable} self
 */
DGTable.prototype.removeColumn = function (column, render) {
    const p = this.p;
    let columns = p.columns;

    let colIdx = columns.indexOf(column);
    if (colIdx > -1) {
        columns.splice(colIdx, 1);
        columns.normalizeOrder();

        p.visibleColumns = columns.getVisibleColumns();
        this._ensureVisibleColumns().clearAndRender(render);

        this.trigger('removecolumn', column);
    }
    return this;
};

/**
 * Sets a new cell formatter.
 * @public
 * @expose
 * @param {function(value: *, columnName: string, row: Object):string|null} [formatter=null] - The cell formatter. Should return an HTML.
 * @returns {DGTable} self
 */
DGTable.prototype.setCellFormatter = function (formatter) {
    if (!formatter) {
        formatter = val => (typeof val === 'string') ? htmlEncode(val) : val;
        formatter[IsSafeSymbol] = true;
    }

    /**
     * @private
     * @field {Function} cellFormatter */
    this.o.cellFormatter = formatter;

    return this;
};

/**
 * Sets a new header cell formatter.
 * @public
 * @expose
 * @param {function(label: string, columnName: string):string|null} [formatter=null] - The cell formatter. Should return an HTML.
 * @returns {DGTable} self
 */
DGTable.prototype.setHeaderCellFormatter = function (formatter) {
    /**
     * @private
     * @field {Function} headerCellFormatter */
    this.o.headerCellFormatter = formatter || function (val) {
        return (typeof val === 'string') ? htmlEncode(val) : val;
    };

    return this;
};

/**
 * @public
 * @expose
 * @param {function(row:Object,args:Object):boolean|null} [filterFunc=null] - The filter function to work with filters. Default is a by-colum filter.
 * @returns {DGTable} self
 */
DGTable.prototype.setFilter = function (filterFunc) {
    /** @private
     * @field {Function} filter */
    this.o.filter = filterFunc;
    return this;
};

/**
 * @public
 * @expose
 * @param {Object|null} args - Options to pass to the filter function
 * @returns {DGTable} self
 */
DGTable.prototype.filter = function (args) {
    const p = this.p;

    let filterFunc = this.o.filter || ByColumnFilter;

    // Deprecated use of older by-column filter
    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
        args = {
            column: arguments[0],
            keyword: arguments[1],
            caseSensitive: arguments[2],
        };
    }

    let hadFilter = !!p.filteredRows;
    if (p.filteredRows) {
        p.filteredRows = null; // Allow releasing array memory now
    }

    // Shallow-clone the args, as the filter function may want to modify it for keeping state
    p.filterArgs = args == null ? null : ((typeof args === 'object' && !Array.isArray(args)) ? $.extend({}, args) : args);

    if (p.filterArgs !== null) {
        p.filteredRows = p.rows.filteredCollection(filterFunc, p.filterArgs);

        if (hadFilter || p.filteredRows) {
            this.clearAndRender();
            this.trigger('filter', args);
        }
    }
    else {
        p.filterArgs = null;
        p.filteredRows = null;
        this.clearAndRender();
        this.trigger('filterclear', {});
    }

    return this;
};

/**
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.clearFilter = function () {
    const p = this.p;

    if (p.filteredRows) {
        p.filterArgs = null;
        p.filteredRows = null;
        this.clearAndRender();
        this.trigger('filterclear', {});
    }

    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._refilter = function() {
    const p = this.p;

    if (p.filteredRows && p.filterArgs) {
        let filterFunc = this.o.filter || ByColumnFilter;
        p.filteredRows = p.rows.filteredCollection(filterFunc, p.filterArgs);
    }
    return this;
};

/**
 * Set a new label to a column
 * @public
 * @expose
 * @param {string} column Name of the column
 * @param {string} label New label for the column
 * @returns {DGTable} self
 */
DGTable.prototype.setColumnLabel = function (column, label) {
    const p = this.p;

    let col = p.columns.get(column);
    if (col) {
        col.label = label === undefined ? col.name : label;

        if (col.element) {
            for (let i = 0; i < col.element[0].firstChild.childNodes.length; i++) {
                let node = col.element[0].firstChild.childNodes[i];
                if (node.nodeType === 3) {
                    node.textContent = col.label;
                    break;
                }
            }
        }
    }
    return this;
};

/**
 * Move a column to a new position
 * @public
 * @expose
 * @param {string|number} src Name or position of the column to be moved
 * @param {string|number} dest Name of the column currently in the desired position, or the position itself
 * @param {boolean} [visibleOnly=true] Should consider only visible columns and visible-relative indexes
 * @returns {DGTable} self
 */
DGTable.prototype.moveColumn = function (src, dest, visibleOnly = true) {
    const o = this.o, p = this.p;

    let columns = p.columns,
        col, destCol;

    let columnsArray = visibleOnly ? p.visibleColumns : columns.getColumns();

    if (typeof src === 'string') {
        col = columns.get(src);
    } else if (typeof src === 'number') {
        col = columnsArray[src];
    }
    if (typeof dest === 'string') {
        destCol = columns.get(dest);
    } else if (typeof dest === 'number') {
        destCol = columnsArray[dest];
    }

    if (col && destCol && src !== dest) {
        let srcOrder = col.order, destOrder = destCol.order;

        let visibleColumns = columns.moveColumn(col, destCol).getVisibleColumns();

        if (p.visibleColumns.length !== visibleColumns.length ||
            p.visibleColumns.some((x, i) => x !== visibleColumns[i])) {

            p.visibleColumns = visibleColumns;
            this._ensureVisibleColumns();

            if (o.virtualTable) {
                this.clearAndRender();
            } else {
                let headerCell = p.$headerRow.find('>div.' + o.tableClassName + '-header-cell');
                let beforePos = srcOrder < destOrder ? destOrder + 1 : destOrder,
                    fromPos = srcOrder;
                headerCell[0].parentNode.insertBefore(headerCell[fromPos], headerCell[beforePos]);

                let srcWidth = p.visibleColumns[srcOrder];
                srcWidth = (srcWidth.actualWidthConsideringScrollbarWidth || srcWidth.actualWidth) + 'px';
                let destWidth = p.visibleColumns[destOrder];
                destWidth = (destWidth.actualWidthConsideringScrollbarWidth || destWidth.actualWidth) + 'px';

                let tbodyChildren = p.tbody.childNodes;
                for (let i = 0, count = tbodyChildren.length; i < count; i++) {
                    let row = tbodyChildren[i];
                    if (row.nodeType !== 1) continue;
                    row.insertBefore(row.childNodes[fromPos], row.childNodes[beforePos]);
                    row.childNodes[destOrder].firstChild.style.width = destWidth;
                    row.childNodes[srcOrder].firstChild.style.width = srcWidth;
                }
            }
        }

        this.trigger('movecolumn', col.name, srcOrder, destOrder);
    }
    return this;
};

/**
 * Sort the table
 * @public
 * @expose
 * @param {string?} column Name of the column to sort on (or null to remove sort arrow)
 * @param {boolean=} descending Sort in descending order
 * @param {boolean} [add=false] Should this sort be on top of the existing sort? (For multiple column sort)
 * @returns {DGTable} self
 */
DGTable.prototype.sort = function (column, descending, add) {
    const o = this.o, p = this.p;

    let columns = p.columns,
        col = columns.get(column);

    let currentSort = p.rows.sortColumn;

    if (col) {
        if (add) { // Add the sort to current sort stack

            for (let i = 0; i < currentSort.length; i++) {
                if (currentSort[i].column === col.name) {
                    if (i < currentSort.length - 1) {
                        currentSort.length = 0;
                    } else {
                        descending = currentSort[currentSort.length - 1].descending;
                        currentSort.splice(currentSort.length - 1, 1);
                    }
                    break;
                }
            }
            if ((o.sortableColumns > 0 /* allow manual sort when disabled */ && currentSort.length >= o.sortableColumns) || currentSort.length >= p.visibleColumns.length) {
                currentSort.length = 0;
            }

        } else { // Sort only by this column
            currentSort.length = 0;
        }

        // Default to ascending
        descending = descending === undefined ? false : descending;

        // Set the required column in the front of the stack
        currentSort.push({
            column: col.name,
            comparePath: col.comparePath || col.dataPath,
            descending: !!descending,
        });
    } else {
        currentSort.length = 0;
    }

    this._clearSortArrows();

    for (let i = 0; i < currentSort.length; i++) {
        this._showSortArrow(currentSort[i].column, currentSort[i].descending);
    }

    if (o.adjustColumnWidthForSortArrow && !p.tableSkeletonNeedsRendering) {
        this.tableWidthChanged(true);
    }

    p.rows.sortColumn = currentSort;

    let comparator;
    if (currentSort.length) {
        comparator = p.rows.sort(!!p.filteredRows);
        if (p.filteredRows) {
            p.filteredRows.sort(!!p.filteredRows);
        }
    }

    if (p.virtualListHelper)
        p.virtualListHelper.invalidate().render();

    // Build output for event, with option names that will survive compilers
    let sorts = [];
    for (let i = 0; i < currentSort.length; i++) {
        sorts.push({ 'column': currentSort[i].column, 'descending': currentSort[i].descending });
    }
    this.trigger('sort', sorts, true /* direct sort */, comparator);

    return this;
};

/**
 * Re-sort the table using current sort specifiers
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.resort = function () {
    const p = this.p;
    let columns = p.columns;

    let currentSort = p.rows.sortColumn;
    if (currentSort.length) {

        for (let i = 0; i < currentSort.length; i++) {
            if (!columns.get(currentSort[i].column)) {
                currentSort.splice(i--, 1);
            }
        }

        let comparator;
        p.rows.sortColumn = currentSort;
        if (currentSort.length) {
            comparator = p.rows.sort(!!p.filteredRows);
            if (p.filteredRows) {
                p.filteredRows.sort(!!p.filteredRows);
            }
        }

        // Build output for event, with option names that will survive compilers
        let sorts = [];
        for (let i = 0; i < currentSort.length; i++) {
            sorts.push({ 'column': currentSort[i].column, 'descending': currentSort[i].descending });
        }
        this.trigger('sort', sorts, false /* indirect sort */, comparator);
    }

    return this;
};

/**
 * Make sure there's at least one column visible
 * @private
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype._ensureVisibleColumns = function () {
    const p = this.p;

    if (p.visibleColumns.length === 0 && p.columns.length) {
        p.columns[0].visible = true;
        p.visibleColumns.push(p.columns[0]);
        this.trigger('showcolumn', p.columns[0].name);
    }

    return this;
};

/**
 * Show or hide a column
 * @public
 * @expose
 * @param {string} column Unique column name
 * @param {boolean} visible New visibility mode for the column
 * @returns {DGTable} self
 */
DGTable.prototype.setColumnVisible = function (column, visible) {
    const p = this.p;

    let col = p.columns.get(column);

    //noinspection PointlessBooleanExpressionJS
    visible = !!visible;

    if (col && !!col.visible !== visible) {
        col.visible = visible;
        p.visibleColumns = p.columns.getVisibleColumns();
        this.trigger(visible ? 'showcolumn' : 'hidecolumn', column);
        this._ensureVisibleColumns();
        this.clearAndRender();
    }
    return this;
};

/**
 * Get the visibility mode of a column
 * @public
 * @expose
 * @returns {boolean} true if visible
 */
DGTable.prototype.isColumnVisible = function (column) {
    const p = this.p;
    let col = p.columns.get(column);
    if (col) {
        return col.visible;
    }
    return false;
};

/**
 * Globally set the minimum column width
 * @public
 * @expose
 * @param {number} minColumnWidth Minimum column width
 * @returns {DGTable} self
 */
DGTable.prototype.setMinColumnWidth = function (minColumnWidth) {
    let o = this.o;
    minColumnWidth = Math.max(minColumnWidth, 0);
    if (o.minColumnWidth !== minColumnWidth) {
        o.minColumnWidth = minColumnWidth;
        this.tableWidthChanged(true);
    }
    return this;
};

/**
 * Get the current minimum column width
 * @public
 * @expose
 * @returns {number} Minimum column width
 */
DGTable.prototype.getMinColumnWidth = function () {
    return this.o.minColumnWidth;
};

/**
 * Set the limit on concurrent columns sorted
 * @public
 * @expose
 * @param {number} sortableColumns How many sortable columns to allow?
 * @returns {DGTable} self
 */
DGTable.prototype.setSortableColumns = function (sortableColumns) {
    const p = this.p, o = this.o;
    if (o.sortableColumns !== sortableColumns) {
        o.sortableColumns = sortableColumns;
        if (p.$table) {
            let headerCell = p.$headerRow.find('>div.' + o.tableClassName + '-header-cell');
            for (let i = 0; i < headerCell.length; i++) {
                $(headerCell[0])[(o.sortableColumns > 0 && p.visibleColumns[i].sortable) ? 'addClass' : 'removeClass']('sortable');
            }
        }
    }
    return this;
};

/**
 * Get the limit on concurrent columns sorted
 * @public
 * @expose
 * @returns {number} How many sortable columns are allowed?
 */
DGTable.prototype.getSortableColumns = function () {
    return this.o.sortableColumns;
};

/**
 * @public
 * @expose
 * @param {boolean?} movableColumns=true are the columns movable?
 * @returns {DGTable} self
 */
DGTable.prototype.setMovableColumns = function (movableColumns) {
    let o = this.o;
    //noinspection PointlessBooleanExpressionJS
    movableColumns = movableColumns === undefined ? true : !!movableColumns;
    if (o.movableColumns !== movableColumns) {
        o.movableColumns = movableColumns;
    }
    return this;
};

/**
 * @public
 * @expose
 * @returns {boolean} are the columns movable?
 */
DGTable.prototype.getMovableColumns = function () {
    return this.o.movableColumns;
};

/**
 * @public
 * @expose
 * @param {boolean} resizableColumns=true are the columns resizable?
 * @returns {DGTable} self
 */
DGTable.prototype.setResizableColumns = function (resizableColumns) {
    let o = this.o;
    //noinspection PointlessBooleanExpressionJS
    resizableColumns = resizableColumns === undefined ? true : !!resizableColumns;
    if (o.resizableColumns !== resizableColumns) {
        o.resizableColumns = resizableColumns;
    }
    return this;
};

/**
 * @public
 * @expose
 * @returns {boolean} are the columns resizable?
 */
DGTable.prototype.getResizableColumns = function () {
    return this.o.resizableColumns;
};

/**
 * Sets a functions that supplies comparators dynamically
 * @public
 * @expose
 * @param {{function(columnName: string, descending: boolean, defaultComparator: function(a,b):number):{function(a,b):number}}|null|undefined} comparatorCallback a function that returns the comparator for a specific column
 * @returns {DGTable} self
 */
DGTable.prototype.setOnComparatorRequired = function (comparatorCallback) {
    let o = this.o;
    if (o.onComparatorRequired !== comparatorCallback) {
        o.onComparatorRequired = comparatorCallback;
    }
    return this;
};

DGTable.prototype.setComparatorCallback = DGTable.prototype.setOnComparatorRequired;

/**
 * sets custom sorting function for a data set
 * @public
 * @expose
 * @param {{function(data: any[], sort: function(any[]):any[]):any[]}|null|undefined} customSortingProvider provides a custom sorting function (not the comparator, but a sort() alternative) for a data set
 * @returns {DGTable} self
 */
DGTable.prototype.setCustomSortingProvider = function (customSortingProvider) {
    let o = this.o;
    if (o.customSortingProvider !== customSortingProvider) {
        o.customSortingProvider = customSortingProvider;
    }
    return this;
};

/**
 * Set a new width to a column
 * @public
 * @expose
 * @param {string} column name of the column to resize
 * @param {number|string} width new column as pixels, or relative size (0.5, 50%)
 * @returns {DGTable} self
 */
DGTable.prototype.setColumnWidth = function (column, width) {

    const p = this.p;

    let col = p.columns.get(column);

    let parsedWidth = this._parseColumnWidth(width, col.ignoreMin ? 0 : this.o.minColumnWidth);

    if (col) {
        let oldWidth = this._serializeColumnWidth(col);

        col.width = parsedWidth.width;
        col.widthMode = parsedWidth.mode;

        let newWidth = this._serializeColumnWidth(col);

        if (oldWidth !== newWidth) {
            this.tableWidthChanged(true); // Calculate actual sizes
        }

        this.trigger('columnwidth', col.name, oldWidth, newWidth);
    }
    return this;
};

/**
 * @public
 * @expose
 * @param {string} column name of the column
 * @returns {string|null} the serialized width of the specified column, or null if column not found
 */
DGTable.prototype.getColumnWidth = function (column) {
    const p = this.p;

    let col = p.columns.get(column);
    if (col) {
        return this._serializeColumnWidth(col);
    }
    return null;
};

/**
 * @public
 * @expose
 * @param {string} column name of the column
 * @returns {SERIALIZED_COLUMN|null} configuration for all columns
 */
DGTable.prototype.getColumnConfig = function (column) {
    const p = this.p;
    let col = p.columns.get(column);
    if (col) {
        return {
            'order': col.order,
            'width': this._serializeColumnWidth(col),
            'visible': col.visible,
            'label': col.label,
        };
    }
    return null;
};

/**
 * Returns a config object for the columns, to allow saving configurations for next time...
 * @public
 * @expose
 * @returns {Object} configuration for all columns
 */
DGTable.prototype.getColumnsConfig = function () {
    const p = this.p;

    let config = {};
    for (let i = 0; i < p.columns.length; i++) {
        config[p.columns[i].name] = this.getColumnConfig(p.columns[i].name);
    }
    return config;
};

/**
 * Returns an array of the currently sorted columns
 * @public
 * @expose
 * @returns {Array.<SERIALIZED_COLUMN_SORT>} configuration for all columns
 */
DGTable.prototype.getSortedColumns = function () {
    const p = this.p;

    let sorted = [];
    for (let i = 0; i < p.rows.sortColumn.length; i++) {
        let sort = p.rows.sortColumn[i];
        sorted.push({ column: sort.column, descending: sort.descending });
    }
    return sorted;
};

/**
 * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
 * @public
 * @expose
 * @param {number} rowIndex - index of the row
 * @param {string} columnName - name of the column
 * @returns {string} HTML string for the specified cell
 */
DGTable.prototype.getHtmlForRowCell = function (rowIndex, columnName) {
    const p = this.p;

    if (rowIndex < 0 || rowIndex > p.rows.length - 1) return null;
    let column = p.columns.get(columnName);
    if (!column) return null;
    let rowData = p.rows[rowIndex];

    return this._getHtmlForCell(rowData, column);
};

/**
 * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
 * @public
 * @expose
 * @param {Object} rowData - row data
 * @param {Object} columnName - column data
 * @returns {string|null} HTML string for the specified cell
 */
DGTable.prototype.getHtmlForRowDataCell = function (rowData, columnName) {
    const p = this.p;

    let column = p.columns.get(columnName);
    if (!column) return null;

    return this._getHtmlForCell(rowData, column);
};

/**
 * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
 * @private
 * @expose
 * @param {Object} rowData - row data
 * @param {Object} column - column data
 * @returns {string} HTML string for the specified cell
 */
DGTable.prototype._getHtmlForCell = function (rowData, column) {
    let dataPath = column.dataPath;
    let colValue = rowData[dataPath[0]];
    for (let dataPathIndex = 1; dataPathIndex < dataPath.length; dataPathIndex++) {
        if (colValue == null) break;
        colValue = colValue && colValue[dataPath[dataPathIndex]];
    }

    const formatter = this.o.cellFormatter;
    let content;

    if (formatter[IsSafeSymbol]) {
        content = formatter(colValue, column.name, rowData);
    } else {
        try {
            content = formatter(colValue, column.name, rowData);
        } catch (err) {
            content = '[ERROR]';
            // eslint-disable-next-line no-console
            console.error('Failed to generate content for cell ' + column.name, err);
        }
    }

    if (content === undefined || content === null) {
        content = '';
    }

    return content;
};

/**
 * Returns the y pos of a row by index
 * @public
 * @expose
 * @param {number} rowIndex - index of the row
 * @returns {number|null} Y pos
 */
DGTable.prototype.getRowYPos = function (rowIndex) {
    const p = this.p;

    return p.virtualListHelper.getItemPosition(rowIndex) || null;
};

/**
 * Returns the row data for a specific row
 * @public
 * @expose
 * @param {number} row index of the row
 * @returns {Object} Row data
 */
DGTable.prototype.getDataForRow = function (row) {
    const p = this.p;

    if (row < 0 || row > p.rows.length - 1) return null;
    return p.rows[row];
};

/**
 * Gets the number of rows
 * @public
 * @expose
 * @returns {number} Row count
 */
DGTable.prototype.getRowCount = function () {
    const p = this.p;
    return p.rows ? p.rows.length : 0;
};

/**
 * Returns the physical row index for specific row
 * @public
 * @expose
 * @param {Object} rowData - Row data to find
 * @returns {number} Row index
 */
DGTable.prototype.getIndexForRow = function (rowData) {
    const p = this.p;
    return p.rows.indexOf(rowData);
};

/**
 * Gets the number of filtered rows
 * @public
 * @expose
 * @returns {number} Filtered row count
 */
DGTable.prototype.getFilteredRowCount = function () {
    const p = this.p;
    return (p.filteredRows || p.rows).length;
};

/**
 * Returns the filtered row index for specific row
 * @public
 * @expose
 * @param {Object} rowData - Row data to find
 * @returns {number} Row index
 */
DGTable.prototype.getIndexForFilteredRow = function (rowData) {
    const p = this.p;
    return (p.filteredRows || p.rows).indexOf(rowData);
};

/**
 * Returns the row data for a specific row
 * @public
 * @expose
 * @param {number} row index of the filtered row
 * @returns {Object} Row data
 */
DGTable.prototype.getDataForFilteredRow = function (row) {
    const p = this.p;
    if (row < 0 || row > (p.filteredRows || p.rows).length - 1) return null;
    return (p.filteredRows || p.rows)[row];
};

/**
 * Returns DOM element of the header row
 * @public
 * @expose
 * @returns {Element} Row element
 */
DGTable.prototype.getHeaderRowElement = function () {
    return this.p.headerRow;
};

/**
 * @private
 * @param {Element} el
 * @returns {number} width
 */
DGTable.prototype._horizontalPadding = function(el) {
    return ((parseFloat($.css(el, 'padding-left')) || 0) +
    (parseFloat($.css(el, 'padding-right')) || 0));
};

/**
 * @private
 * @param {Element} el
 * @returns {number} width
 */
DGTable.prototype._horizontalBorderWidth = function(el) {
    return ((parseFloat($.css(el, 'border-left')) || 0) +
    (parseFloat($.css(el, 'border-right')) || 0));
};

/**
 * @private
 * @returns {number} width
 */
DGTable.prototype._calculateWidthAvailableForColumns = function() {
    const o = this.o, p = this.p;

    // Changing display mode briefly, to prevent taking in account the  parent's scrollbar width when we are the cause for it
    let oldDisplay, lastScrollTop, lastScrollLeft;
    if (p.table) {
        lastScrollTop = p.table ? p.table.scrollTop : 0;
        lastScrollLeft = p.table ? p.table.scrollLeft : 0;

        if (o.virtualTable) {
            oldDisplay = p.table.style.display;
            p.table.style.display = 'none';
        }
    }

    let detectedWidth = getElementWidth(this.$el[0]);

    if (p.table) {
        if (o.virtualTable) {
            p.table.style.display = oldDisplay;
        }

        p.table.scrollTop = lastScrollTop;
        p.table.scrollLeft = lastScrollLeft;
        p.header.scrollLeft = lastScrollLeft;
    }

    let tableClassName = o.tableClassName;

    let $thisWrapper = $('<div>').addClass(this.el.className).css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px' });
    let $header = $('<div>').addClass(tableClassName + '-header').appendTo($thisWrapper);
    let $headerRow = $('<div>').addClass(tableClassName + '-header-row').appendTo($header);
    for (let i = 0; i < p.visibleColumns.length; i++) {
        const column = p.visibleColumns[i];
        const $cell = $('<div><div></div></div>')
            .addClass(tableClassName + '-header-cell')
            .addClass(column.cellClasses || '');
        $cell[0]['columnName'] = column.name;
        $headerRow.append($cell);
    }
    $thisWrapper.appendTo(document.body);

    detectedWidth -= this._horizontalBorderWidth($headerRow[0]);

    let $cells = $headerRow.find('>div.' + tableClassName + '-header-cell');
    for (let i = 0; i < $cells.length; i++) {
        let $cell = $($cells[i]);

        let isBoxing = $cell.css('boxSizing') === 'border-box';
        if (!isBoxing) {
            detectedWidth -=
                (parseFloat($cell.css('border-right-width')) || 0) +
                (parseFloat($cell.css('border-left-width')) || 0) +
                (this._horizontalPadding($cell[0])); // CELL's padding

            const colName = $cell[0]['columnName'];
            const column = p.columns.get(colName);
            if (column)
                detectedWidth -= column.arrowProposedWidth || 0;
        }
    }

    if ($thisWrapper) {
        $thisWrapper.remove();
    }

    return Math.max(0, detectedWidth);
};

/**
 * Notify the table that its width has changed
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.tableWidthChanged = (function () {

    let getTextWidth = function(text) {
        let tableClassName = this.o.tableClassName;

        let $cell, $tableWrapper = $('<div>').addClass(this.$el).append(
            $('<div>').addClass(tableClassName + '-header').append(
                $('<div>').addClass(tableClassName + '-header-row').append(
                    $cell = $('<div>').addClass(tableClassName + '-header-cell').append(
                        $('<div>').text(text),
                    ),
                ),
            ),
        ).css({ 'position': 'absolute', top: '-9999px', 'visibility': 'hidden' });
        $tableWrapper.appendTo(document.body);

        let width = getElementWidth($cell[0]);

        $tableWrapper.remove();

        return width;
    };

    let lastDetectedWidth = null;

    /**
     * @public
     * @expose
     * @param {boolean} [forceUpdate=false]
     * @param {boolean} [renderColumns=true]
     * @returns {DGTable} self
     */
    return function(forceUpdate, renderColumns) {

        let that = this,
            o = that.o,
            p = that.p,
            detectedWidth = this._calculateWidthAvailableForColumns(),
            sizeLeft = detectedWidth,
            relatives = 0;

        if (!p.$table) return this;

        renderColumns = renderColumns === undefined || renderColumns;

        let tableWidthBeforeCalculations = 0;

        if (!p.tbody) {
            renderColumns = false;
        }

        if (renderColumns) {
            tableWidthBeforeCalculations = parseFloat(p.tbody.style.minWidth) || 0;
        }

        if (sizeLeft !== lastDetectedWidth || forceUpdate) {
            lastDetectedWidth = detectedWidth;

            let absWidthTotal = 0, changedColumnIndexes = [], totalRelativePercentage = 0;

            for (let i = 0; i < p.columns.length; i++) {
                p.columns[i].actualWidthConsideringScrollbarWidth = null;
            }

            for (let i = 0; i < p.visibleColumns.length; i++) {
                let col = p.visibleColumns[i];
                if (col.widthMode === ColumnWidthMode.ABSOLUTE) {
                    let width = col.width;
                    width += col.arrowProposedWidth || 0; // Sort-arrow width
                    if (!col.ignoreMin && width < o.minColumnWidth) {
                        width = o.minColumnWidth;
                    }
                    sizeLeft -= width;
                    absWidthTotal += width;

                    // Update actualWidth
                    if (width !== col.actualWidth) {
                        col.actualWidth = width;
                        changedColumnIndexes.push(i);
                    }
                } else if (col.widthMode === ColumnWidthMode.AUTO) {
                    let width = getTextWidth.call(this, col.label) + 20;
                    width += col.arrowProposedWidth || 0; // Sort-arrow width
                    if (!col.ignoreMin && width < o.minColumnWidth) {
                        width = o.minColumnWidth;
                    }
                    sizeLeft -= width;
                    absWidthTotal += width;

                    // Update actualWidth
                    if (width !== col.actualWidth) {
                        col.actualWidth = width;
                        if (!o.convertColumnWidthsToRelative) {
                            changedColumnIndexes.push(i);
                        }
                    }
                } else if (col.widthMode === ColumnWidthMode.RELATIVE) {
                    totalRelativePercentage += col.width;
                    relatives++;
                }
            }

            // Normalize relative sizes if needed
            if (o.convertColumnWidthsToRelative) {
                for (let i = 0; i < p.visibleColumns.length; i++) {
                    let col = p.visibleColumns[i];
                    if (col.widthMode === ColumnWidthMode.AUTO) {
                        col.widthMode = ColumnWidthMode.RELATIVE;
                        sizeLeft += col.actualWidth;
                        col.width = col.actualWidth / absWidthTotal;
                        totalRelativePercentage += col.width;
                        relatives++;
                    }
                }
            }

            // Normalize relative sizes if needed
            if (relatives && ((totalRelativePercentage < 1 && o.relativeWidthGrowsToFillWidth) ||
                (totalRelativePercentage > 1 && o.relativeWidthShrinksToFillWidth))) {
                for (let i = 0; i < p.visibleColumns.length; i++) {
                    let col = p.visibleColumns[i];
                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
                        col.width /= totalRelativePercentage;
                    }
                }
            }

            let sizeLeftForRelative = Math.max(0, sizeLeft); // Use this as the space to take the relative widths out of
            if (sizeLeftForRelative === 0) {
                sizeLeftForRelative = p.table.clientWidth;
            }

            let minColumnWidthRelative = (o.minColumnWidth / sizeLeftForRelative);
            if (isNaN(minColumnWidthRelative)) {
                minColumnWidthRelative = 0;
            }
            if (minColumnWidthRelative > 0) {
                let extraRelative = 0, delta;

                // First pass - make sure they are all constrained to the minimum width
                for (let i = 0; i < p.visibleColumns.length; i++) {
                    let col = p.visibleColumns[i];
                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
                        if (!col.ignoreMin && col.width < minColumnWidthRelative) {
                            extraRelative += minColumnWidthRelative - col.width;
                            col.width = minColumnWidthRelative;
                        }
                    }
                }

                // Second pass - try to take the extra width out of the other columns to compensate
                for (let i = 0; i < p.visibleColumns.length; i++) {
                    let col = p.visibleColumns[i];
                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
                        if (!col.ignoreMin && col.width > minColumnWidthRelative) {
                            if (extraRelative > 0) {
                                delta = Math.min(extraRelative, col.width - minColumnWidthRelative);
                                col.width -= delta;
                                extraRelative -= delta;
                            }
                        }
                    }
                }
            }

            // Try to fill width
            if (o.autoFillTableWidth && sizeLeft > 0) {
                let nonResizableTotal = 0;
                let sizeLeftToFill = sizeLeft;

                for (let i = 0; i < p.visibleColumns.length; i++) {
                    let col = p.visibleColumns[i];
                    if (!col.resizable && col.widthMode === ColumnWidthMode.ABSOLUTE)
                        nonResizableTotal += col.width;

                    if (col.widthMode === ColumnWidthMode.RELATIVE)
                        sizeLeftToFill -= Math.round(sizeLeftForRelative * col.width);
                }

                let conv = ((detectedWidth - nonResizableTotal) / (detectedWidth - sizeLeftToFill - nonResizableTotal)) || NaN;
                for (let i = 0; i < p.visibleColumns.length && sizeLeftToFill > 0; i++) {
                    let col = p.visibleColumns[i];
                    if (!col.resizable && col.widthMode === ColumnWidthMode.ABSOLUTE)
                        continue;

                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
                        col.width *= conv;
                    } else {
                        let width = col.actualWidth * conv;
                        if (col.actualWidth !== width) {
                            col.actualWidth = width;
                            if (changedColumnIndexes.indexOf(i) === -1)
                                changedColumnIndexes.push(i);
                        }
                    }
                }
            }

            // Materialize relative sizes
            for (let i = 0; i < p.visibleColumns.length; i++) {
                let col = p.visibleColumns[i];
                if (col.widthMode === ColumnWidthMode.RELATIVE) {
                    let width = Math.round(sizeLeftForRelative * col.width);
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

            if (p.visibleColumns.length) {
                // (There should always be at least 1 column visible, but just in case)
                p.visibleColumns[p.visibleColumns.length - 1].actualWidthConsideringScrollbarWidth =
                    p.visibleColumns[p.visibleColumns.length - 1].actualWidth - (p.scrollbarWidth || 0);
            }

            p.notifyRendererOfColumnsConfig?.();

            if (renderColumns) {
                let tableWidth = this._calculateTbodyWidth();

                if (tableWidthBeforeCalculations < tableWidth) {
                    this._updateTableWidth(false);
                }

                for (let i = 0; i < changedColumnIndexes.length; i++) {
                    this._resizeColumnElements(changedColumnIndexes[i]);
                }

                if (tableWidthBeforeCalculations > tableWidth) {
                    this._updateTableWidth(false);
                }
            }
        }

        return this;
    };
})();

/**
 * Notify the table that its height has changed
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.tableHeightChanged = function () {
    let that = this,
        o = that.o,
        p = that.p;

    if (!p.$table) {
        return that;
    }

    let height = getElementHeight(that.$el[0], true)
        - (parseFloat(p.$table.css('border-top-width')) || 0) // Subtract top border of inner element
        - (parseFloat(p.$table.css('border-bottom-width')) || 0); // Subtract bottom border of inner element

    if (height !== o.height) {

        o.height = height;

        if (p.tbody) {
            // At least 1 pixel - to show scrollbars correctly.
            p.tbody.style.height = Math.max(o.height - getElementHeight(p.$header[0], true, true, true), 1) + 'px';
        }

        if (o.virtualTable) {
            that.clearAndRender();
        }
    }

    return that;
};

/**
 * Add rows to the table
 * @public
 * @expose
 * @param {Object[]} data - array of rows to add to the table
 * @param {number} [at=-1] - where to add the rows at
 * @param {boolean} [resort=false] - should resort all rows?
 * @param {boolean} [render=true]
 * @returns {DGTable} self
 */
DGTable.prototype.addRows = function (data, at, resort, render) {
    let that = this,
        p = that.p;

    if (typeof at === 'boolean') {
        render = resort;
        resort = at;
        at = -1;
    }

    if (typeof at !== 'number')
        at = -1;

    if (at < 0 || at > p.rows.length)
        at = p.rows.length;

    render = (render === undefined) ? true : !!render;

    if (data) {
        p.rows.add(data, at);

        if (p.filteredRows || (resort && p.rows.sortColumn.length)) {

            if (resort && p.rows.sortColumn.length) {
                this.resort();
            } else {
                this._refilter();
            }

            p.tableSkeletonNeedsRendering = true;

            if (render) {
                // Render the skeleton with all rows from scratch
                this.render();
            }

        } else if (render) {
            p.virtualListHelper.addItemsAt(data.length, at);

            if (that.o.virtualTable) {
                this._updateVirtualHeight()
                    ._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height
                    .render()
                    ._updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar

            } else if (p.tbody) {
                this.render()
                    ._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height, and update existing last cells
                    ._updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar
            }
        }

        this.trigger('addrows', data.length, false);
    }
    return this;
};

/**
 * Removes a row from the table
 * @public
 * @expose
 * @param {number} physicalRowIndex - index
 * @param {number} count - how many rows to remove
 * @param {boolean=true} render
 * @returns {DGTable} self
 */
DGTable.prototype.removeRows = function (physicalRowIndex, count, render) {
    let that = this,
        p = that.p;

    if (typeof count !== 'number' || count <= 0) return this;

    if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return this;

    p.rows.splice(physicalRowIndex, count);
    render = (render === undefined) ? true : !!render;

    if (p.filteredRows) {

        this._refilter();

        p.tableSkeletonNeedsRendering = true;

        if (render) {
            // Render the skeleton with all rows from scratch
            this.render();
        }

    } else if (render) {
        p.virtualListHelper.removeItemsAt(count, physicalRowIndex);

        if (this.o.virtualTable) {
            this._updateVirtualHeight()
                ._updateLastCellWidthFromScrollbar()
                .render()
                ._updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar
        } else {
            this.render()
                ._updateLastCellWidthFromScrollbar()
                ._updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar
        }
    }

    return this;
};

/**
 * Removes a row from the table
 * @public
 * @expose
 * @param {number} physicalRowIndex - index
 * @param {boolean=true} render
 * @returns {DGTable} self
 */
DGTable.prototype.removeRow = function (physicalRowIndex, render) {
    return this.removeRows(physicalRowIndex, 1, render);
};

/**
 * Refreshes the row specified
 * @public
 * @expose
 * @param {number} physicalRowIndex index
 * @param {boolean} render should render the changes immediately?
 * @returns {DGTable} self
 */
DGTable.prototype.refreshRow = function(physicalRowIndex, render = true) {
    let that = this,
        p = that.p;

    if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return this;

    // Find out if the row is in the rendered dataset
    let rowIndex = -1;
    if (p.filteredRows && (rowIndex = p.filteredRows.indexOf(p.rows[physicalRowIndex])) === -1) return this;

    if (rowIndex === -1) {
        rowIndex = physicalRowIndex;
    }

    p.virtualListHelper.refreshItemAt(rowIndex);

    if (render)
        p.virtualListHelper.render();

    return this;
};

/**
 * Get the DOM element for the specified row, if it exists
 * @public
 * @expose
 * @param {number} physicalRowIndex index
 * @returns {Element|null} row or null
 */
DGTable.prototype.getRowElement = function(physicalRowIndex) {
    let that = this,
        p = that.p;

    if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return null;

    // Find out if the row is in the rendered dataset
    let rowIndex = -1;
    if (p.filteredRows && (rowIndex = p.filteredRows.indexOf(p.rows[physicalRowIndex])) === -1) return this;

    if (rowIndex === -1) {
        rowIndex = physicalRowIndex;
    }

    return p.virtualListHelper.getItemElementAt(rowIndex) || null;
};

/**
 * Refreshes all virtual rows
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.refreshAllVirtualRows = function () {
    const p = this.p;
    p.virtualListHelper.invalidate().render();
    return this;
};

/**
 * Replace the whole dataset
 * @public
 * @expose
 * @param {Object[]} data array of rows to add to the table
 * @param {boolean} [resort=false] should resort all rows?
 * @returns {DGTable} self
 */
DGTable.prototype.setRows = function (data, resort) {
    let that = this,
        p = that.p;

    // this.scrollTop = this.$el.find('.table').scrollTop();
    p.rows.reset(data);

    if (resort && p.rows.sortColumn.length) {
        this.resort();
    } else {
        this._refilter();
    }

    this.clearAndRender().trigger('addrows', data.length, true);

    return this;
};

/**
 * Creates a URL representing the data in the specified element.
 * This uses the Blob or BlobBuilder of the modern browsers.
 * The url can be used for a Web Worker.
 * @public
 * @expose
 * @param {string} id Id of the element containing your data
 * @returns {string|null} the url, or null if not supported
 */
DGTable.prototype.getUrlForElementContent = function (id) {
    let blob,
        el = document.getElementById(id);
    if (el) {
        let data = el.textContent;
        if (typeof Blob === 'function') {
            blob = new Blob([data]);
        } else {
            let BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            if (!BlobBuilder) {
                return null;
            }
            let builder = new BlobBuilder();
            builder.append(data);
            blob = builder.getBlob();
        }
        return (window.URL || window.webkitURL).createObjectURL(blob);
    }
    return null;
};

/**
 * @public
 * @expose
 * @returns {boolean} A value indicating whether Web Workers are supported
 */
DGTable.prototype.isWorkerSupported = function() {
    return window['Worker'] instanceof Function;
};

/**
 * Creates a Web Worker for updating the table.
 * @public
 * @expose
 * @param {string} url Url to the script for the Web Worker
 * @param {boolean} [start=true] if true, starts the Worker immediately
 * @param {boolean} [resort=false]
 * @returns {Worker|null} the Web Worker, or null if not supported
 */
DGTable.prototype.createWebWorker = function (url, start, resort) {
    if (this.isWorkerSupported()) {
        let that = this,
            p = that.p;

        let worker = new Worker(url);
        let listener = function (evt) {
            if (evt.data.append) {
                that.addRows(evt.data.rows, resort);
            } else {
                that.setRows(evt.data.rows, resort);
            }
        };
        worker.addEventListener('message', listener, false);
        if (!p.workerListeners) {
            p.workerListeners = [];
        }
        p.workerListeners.push({ worker: worker, listener: listener });
        if (start || start === undefined) {
            worker.postMessage(null);
        }
        return worker;
    }
    return null;
};

/**
 * Unbinds a Web Worker from the table, stopping updates.
 * @public
 * @expose
 * @param {Worker} worker the Web Worker
 * @returns {DGTable} self
 */
DGTable.prototype.unbindWebWorker = function (worker) {
    let that = this,
        p = that.p;

    if (p.workerListeners) {
        for (let j = 0; j < p.workerListeners.length; j++) {
            if (p.workerListeners[j].worker === worker) {
                worker.removeEventListener('message', p.workerListeners[j].listener, false);
                p.workerListeners.splice(j, 1);
                j--;
            }
        }
    }

    return this;
};

/**
 * A synonym for hideCellPreview()
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.abortCellPreview = function() {
    this.hideCellPreview();
    return this;
};

/**
 * Cancel a resize in progress
 * @expose
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype.cancelColumnResize = function() {
    const p = this.p;

    if (p.$resizer) {
        p.$resizer.remove();
        p.$resizer = null;
        $(document).off('mousemove.dgtable', p.onMouseMoveResizeAreaBound)
            .off('mouseup.dgtable', p.onEndDragColumnHeaderBound);
    }

    return this;
};

DGTable.prototype._onTableScrolledHorizontally = function () {
    const p = this.p;

    p.header.scrollLeft = p.table.scrollLeft;
};

/**previousElementSibling
 * Reverse-calculate the column to resize from mouse position
 * @private
 * @param {jQuery_Event} e jQuery mouse event
 * @returns {string} name of the column which the mouse is over, or null if the mouse is not in resize position
 */
DGTable.prototype._getColumnByResizePosition = function (e) {

    let that = this,
        o = that.o,
        rtl = this._isTableRtl();

    let $headerCell = $(e.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName),
        headerCell = $headerCell[0];
    if (headerCell['__cell']) {
        headerCell = headerCell['__cell'];
        $headerCell = $(headerCell);
    }

    let previousElementSibling = $headerCell[0].previousSibling;
    while (previousElementSibling && previousElementSibling.nodeType !== 1) {
        previousElementSibling = previousElementSibling.previousSibling;
    }

    let firstCol = !previousElementSibling;

    let mouseX = ((e.pageX != null ? e.pageX : e.originalEvent.pageX) || e.originalEvent.clientX) - $headerCell.offset().left;

    if (rtl) {
        if (!firstCol && getElementWidth($headerCell[0], true, true, true) - mouseX <= o.resizeAreaWidth / 2) {
            return previousElementSibling['columnName'];
        } else if (mouseX <= o.resizeAreaWidth / 2) {
            return headerCell['columnName'];
        }
    } else {
        if (!firstCol && mouseX <= o.resizeAreaWidth / 2) {
            return previousElementSibling['columnName'];
        } else if (getElementWidth($headerCell[0], true, true, true) - mouseX <= o.resizeAreaWidth / 2) {
            return headerCell['columnName'];
        }
    }

    return null;
};

/**
 * @param {jQuery_Event} event
 */
DGTable.prototype._onTouchStartColumnHeader = function (event) {
    const p = this.p;

    if (p.currentTouchId) return;

    let startTouch = event.originalEvent.changedTouches[0];
    p.currentTouchId = startTouch.identifier;

    let $eventTarget = $(event.currentTarget);

    let startPos = { x: startTouch.pageX, y: startTouch.pageY },
        currentPos = startPos,
        distanceTreshold = 9;

    let tapAndHoldTimeout;

    let unbind = function () {
        p.currentTouchId = null;
        $eventTarget.off('touchend').off('touchcancel');
        clearTimeout(tapAndHoldTimeout);
    };

    let fakeEvent = function (name) {
        let fakeEvent = $.Event(name);
        let extendObjects = Array.prototype.slice.call(arguments, 1);
        for (let key of ['target', 'clientX', 'clientY', 'offsetX', 'offsetY', 'screenX', 'screenY', 'pageX', 'pageY', 'which']) {
            fakeEvent[key] = event[key];
            for (let i = 0; i < extendObjects.length; i++) {
                if (extendObjects[i][key] != null) {
                    fakeEvent[key] = extendObjects[i][key];
                }
            }
        }
        return fakeEvent;
    };

    $eventTarget.trigger(fakeEvent('mousedown', event.originalEvent.changedTouches[0], { 'which': 1, target: event.target }));

    tapAndHoldTimeout = setTimeout(() => {
        unbind();

        $eventTarget
            .one('touchend', (event) => {
                // Prevent simulated mouse events after touchend
                if (!isInputElementEvent(event))
                    event.preventDefault();

                $eventTarget.off('touchend').off('touchcancel');
            })
            .one('touchcancel', (_event) => {
                $eventTarget.off('touchend').off('touchcancel');
            });

        let distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

        if (distanceTravelled < distanceTreshold) {
            this.cancelColumnResize();
            $eventTarget.trigger(fakeEvent('mouseup', event.originalEvent.changedTouches[0], { 'which': 3, target: event.target }));
        }

    }, 500);

    $eventTarget
        .on('touchend', (event) => {
            let touch = find(event.originalEvent.changedTouches, (touch) => touch.identifier === p.currentTouchId);
            if (!touch) return;

            unbind();

            // Prevent simulated mouse events after touchend
            if (!isInputElementEvent(event))
                event.preventDefault();

            currentPos = { x: touch.pageX, y: touch.pageY };
            let distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

            if (distanceTravelled < distanceTreshold || p.$resizer) {
                $eventTarget.trigger(fakeEvent('mouseup', touch, { 'which': 1, target: event.target }));
                $eventTarget.trigger(fakeEvent('click', touch, { 'which': 1, target: event.target }));
            }

        })
        .on('touchcancel', () => {
            unbind();
        })
        .on('touchmove', (event) => {
            let touch = find(event.originalEvent.changedTouches, (touch) => touch.identifier === p.currentTouchId);
            if (!touch) return;

            // Keep track of current position, so we know if we need to cancel the tap-and-hold
            currentPos = { x: touch.pageX, y: touch.pageY };

            if (p.$resizer) {
                event.preventDefault();

                $eventTarget.trigger(fakeEvent('mousemove', touch, { target: event.target }));
            }
        });
};

/**
 * @param {jQuery_Event} event
 */
DGTable.prototype._onMouseDownColumnHeader = function (event) {
    if (event.which !== 1) return this; // Only treat left-clicks

    let that = this,
        o = that.o,
        p = that.p,
        col = this._getColumnByResizePosition(event);

    if (col) {
        let column = p.columns.get(col);
        if (!o.resizableColumns || !column || !column.resizable) {
            return false;
        }

        let rtl = this._isTableRtl();

        if (p.$resizer) {
            $(p.$resizer).remove();
        }
        p.$resizer = $('<div></div>')
            .addClass(o.resizerClassName)
            .css({
                'position': 'absolute',
                'display': 'block',
                'z-index': -1,
                'visibility': 'hidden',
                'width': '2px',
                'background': '#000',
                'opacity': 0.7,
            })
            .appendTo(this.$el);

        let selectedHeaderCell = column.element,
            commonAncestor = p.$resizer.parent();

        let posCol = selectedHeaderCell.offset(),
            posRelative = commonAncestor.offset();
        if (ieVersion === 8) {
            posCol = selectedHeaderCell.offset(); // IE8 bug, first time it receives zeros...
        }
        posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
        posRelative.top += parseFloat(commonAncestor.css('border-top-width')) || 0;
        posCol.left -= posRelative.left;
        posCol.top -= posRelative.top;
        posCol.top -= parseFloat(selectedHeaderCell.css('border-top-width')) || 0;
        let resizerWidth = getElementWidth(p.$resizer[0], true, true, true);
        if (rtl) {
            posCol.left -= Math.ceil((parseFloat(selectedHeaderCell.css('border-left-width')) || 0) / 2);
            posCol.left -= Math.ceil(resizerWidth / 2);
        } else {
            posCol.left += getElementWidth(selectedHeaderCell[0], true, true, true);
            posCol.left += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
            posCol.left -= Math.ceil(resizerWidth / 2);
        }

        p.$resizer
            .css({
                'z-index': '10',
                'visibility': 'visible',
                'left': posCol.left,
                'top': posCol.top,
                'height': getElementHeight(this.$el[0]),
            })[0]['columnName'] = selectedHeaderCell[0]['columnName'];

        try { p.$resizer[0].style.zIndex = ''; }
        catch (ignored) { /* we're ok with this */ }

        $(document).on('mousemove.dgtable', p.onMouseMoveResizeAreaBound);
        $(document).on('mouseup.dgtable', p.onEndDragColumnHeaderBound);

        event.preventDefault();
    }
};

/**
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onMouseMoveColumnHeader = function (event) {

    let that = this,
        o = that.o,
        p = that.p;

    if (o.resizableColumns) {
        let col = this._getColumnByResizePosition(event);
        let headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];
        if (!col || !p.columns.get(col).resizable) {
            headerCell.style.cursor = '';
        } else {
            headerCell.style.cursor = 'e-resize';
        }
    }
};

/**
 * @param {jQuery_Event} event
 */
DGTable.prototype._onMouseUpColumnHeader = function (event) {
    if (event.which === 3) {
        let o = this.o;
        let $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
        let bounds = $headerCell.offset();
        bounds['width'] = getElementWidth($headerCell[0], true, true, true);
        bounds['height'] = getElementHeight($headerCell[0], true, true, true);
        this.trigger('headercontextmenu', $headerCell[0]['columnName'], event.pageX, event.pageY, bounds);
    }
    return this;
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onMouseLeaveColumnHeader = function (event) {
    let o = this.o;
    let headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];
    headerCell.style.cursor = '';
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onClickColumnHeader = function (event) {
    if (isInputElementEvent(event))
        return;

    if (!this._getColumnByResizePosition(event)) {

        let that = this,
            o = that.o,
            p = that.p;

        let headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];
        if (o.sortableColumns) {
            let column = p.columns.get(headerCell['columnName']);
            let currentSort = p.rows.sortColumn;
            if (column && column.sortable) {
                let shouldAdd = true;

                let lastSort = currentSort.length ? currentSort[currentSort.length - 1] : null;

                if (lastSort && lastSort.column === column.name) {
                    if (!lastSort.descending || !o.allowCancelSort) {
                        lastSort.descending = !lastSort.descending;
                    } else {
                        shouldAdd = false;
                        currentSort.splice(currentSort.length - 1, 1);
                    }
                }

                if (shouldAdd) {
                    this.sort(column.name, undefined, true).render();
                } else {
                    this.sort(); // just refresh current situation
                }
            }
        }
    }
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onStartDragColumnHeader = function (event) {

    let that = this,
        o = that.o,
        p = that.p;

    if (o.movableColumns) {

        let $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
        let column = p.columns.get($headerCell[0]['columnName']);
        if (column && column.movable) {
            $headerCell[0].style.opacity = 0.35;
            p.dragId = Math.random() * 0x9999999; // Recognize this ID on drop
            event.originalEvent.dataTransfer.setData('text', JSON.stringify({ dragId: p.dragId, column: column.name }));
        } else {
            event.preventDefault();
        }

    } else {

        event.preventDefault();

    }

    return undefined;
};

/**
 * @private
 * @param {MouseEvent} event event
 */
DGTable.prototype._onMouseMoveResizeArea = function (event) {

    let that = this,
        p = that.p;

    let column = p.columns.get(p.$resizer[0]['columnName']);
    let rtl = this._isTableRtl();

    let selectedHeaderCell = column.element,
        commonAncestor = p.$resizer.parent();
    let posCol = selectedHeaderCell.offset(), posRelative = commonAncestor.offset();
    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
    posCol.left -= posRelative.left;
    let resizerWidth = getElementWidth(p.$resizer[0], true, true, true);

    let isBoxing = selectedHeaderCell.css('box-sizing') === 'border-box';

    let actualX = event.pageX - posRelative.left;
    let minX = posCol.left;

    minX -= Math.ceil(resizerWidth / 2);

    if (rtl) {
        minX += getElementWidth(selectedHeaderCell[0], true, true, true);
        minX -= column.ignoreMin ? 0 : this.o.minColumnWidth;

        if (!isBoxing) {
            minX -= Math.ceil((parseFloat(selectedHeaderCell.css('border-left-width')) || 0) / 2);
            minX -= this._horizontalPadding(selectedHeaderCell[0]);
        }

        if (actualX > minX) {
            actualX = minX;
        }
    } else {
        minX += column.ignoreMin ? 0 : this.o.minColumnWidth;

        if (!isBoxing) {
            minX += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
            minX += this._horizontalPadding(selectedHeaderCell[0]);
        }

        if (actualX < minX) {
            actualX = minX;
        }
    }

    p.$resizer.css('left', actualX + 'px');
};

/**
 * @private
 * @param {Event} event event
 */
DGTable.prototype._onEndDragColumnHeader = function (event) {

    let that = this,
        o = that.o,
        p = that.p;

    if (!p.$resizer) {
        event.target.style.opacity = null;
    } else {
        $(document).off('mousemove.dgtable', p.onMouseMoveResizeAreaBound)
            .off('mouseup.dgtable', p.onEndDragColumnHeaderBound);

        let column = p.columns.get(p.$resizer[0]['columnName']);
        let rtl = this._isTableRtl();

        let selectedHeaderCell = column.element,
            selectedHeaderCellInner = selectedHeaderCell[0].firstChild,
            commonAncestor = p.$resizer.parent();
        let posCol = selectedHeaderCell.offset(), posRelative = commonAncestor.offset();
        posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
        posCol.left -= posRelative.left;
        let resizerWidth = getElementWidth(p.$resizer[0], true, true, true);

        let isBoxing = selectedHeaderCell.css('box-sizing') === 'border-box';

        let actualX = event.pageX - posRelative.left;
        let baseX = posCol.left, minX = posCol.left;
        let width = 0;

        baseX -= Math.ceil(resizerWidth / 2);

        if (rtl) {
            if (!isBoxing) {
                actualX += this._horizontalPadding(selectedHeaderCell[0]);
                const innerComputedStyle = getComputedStyle(selectedHeaderCellInner || selectedHeaderCell[0]);
                actualX += parseFloat(innerComputedStyle.borderLeftWidth) || 0;
                actualX += parseFloat(innerComputedStyle.borderRightWidth) || 0;
                actualX += column.arrowProposedWidth || 0; // Sort-arrow width
            }

            baseX += getElementWidth(selectedHeaderCell[0], true, true, true);

            minX = baseX - (column.ignoreMin ? 0 : this.o.minColumnWidth);
            if (actualX > minX) {
                actualX = minX;
            }

            width = baseX - actualX;
        } else {
            if (!isBoxing) {
                actualX -= this._horizontalPadding(selectedHeaderCell[0]);
                const innerComputedStyle = getComputedStyle(selectedHeaderCellInner || selectedHeaderCell[0]);
                actualX -= parseFloat(innerComputedStyle.borderLeftWidth) || 0;
                actualX -= parseFloat(innerComputedStyle.borderRightWidth) || 0;
                actualX -= column.arrowProposedWidth || 0; // Sort-arrow width
            }

            minX = baseX + (column.ignoreMin ? 0 : this.o.minColumnWidth);
            if (actualX < minX) {
                actualX = minX;
            }

            width = actualX - baseX;
        }

        p.$resizer.remove();
        p.$resizer = null;

        let sizeToSet = width;

        if (column.widthMode === ColumnWidthMode.RELATIVE) {
            let sizeLeft = this._calculateWidthAvailableForColumns();
            //sizeLeft -= p.table.offsetWidth - p.table.clientWidth;

            let totalRelativePercentage = 0;
            let relatives = 0;

            for (let i = 0; i < p.visibleColumns.length; i++) {
                let col = p.visibleColumns[i];
                if (col.name === column.name) continue;

                if (col.widthMode === ColumnWidthMode.RELATIVE) {
                    totalRelativePercentage += col.width;
                    relatives++;
                } else {
                    sizeLeft -= col.actualWidth;
                }
            }

            sizeLeft = Math.max(1, sizeLeft);
            if (sizeLeft === 1)
                sizeLeft = p.table.clientWidth;
            sizeToSet = width / sizeLeft;

            if (relatives > 0) {
                // When there's more than one relative overall,
                //   we can do relative enlarging/shrinking.
                // Otherwise, we can end up having a 0 width.

                let unNormalizedSizeToSet = sizeToSet / ((1 - sizeToSet) / totalRelativePercentage);

                totalRelativePercentage += sizeToSet;

                // Account for relative widths scaling later
                if ((totalRelativePercentage < 1 && o.relativeWidthGrowsToFillWidth) ||
                    (totalRelativePercentage > 1 && o.relativeWidthShrinksToFillWidth)) {
                    sizeToSet = unNormalizedSizeToSet;
                }
            }

            sizeToSet *= 100;
            sizeToSet += '%';
        }

        this.setColumnWidth(column.name, sizeToSet);
    }
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onDragEnterColumnHeader = function (event) {
    let that = this,
        o = that.o,
        p = that.p;

    if (o.movableColumns) {
        let dataTransferred = event.originalEvent.dataTransfer.getData('text');
        if (dataTransferred) {
            dataTransferred = JSON.parse(dataTransferred);
        }
        else {
            dataTransferred = null; // WebKit does not provide the dataTransfer on dragenter?..
        }

        let $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
        if (!dataTransferred ||
            (p.dragId === dataTransferred.dragId && $headerCell['columnName'] !== dataTransferred.column)) {

            let column = p.columns.get($headerCell[0]['columnName']);
            if (column && (column.movable || column !== p.visibleColumns[0])) {
                $($headerCell).addClass('drag-over');
            }
        }
    }
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onDragOverColumnHeader = function (event) {
    event.preventDefault();
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onDragLeaveColumnHeader = function (event) {
    let o = this.o;
    let $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
    if ( !$($headerCell[0].firstChild)
            .has(event.originalEvent.relatedTarget).length ) {
        $headerCell.removeClass('drag-over');
    }
};

/**
 * @private
 * @param {jQuery_Event} event event
 */
DGTable.prototype._onDropColumnHeader = function (event) {
    event.preventDefault();

    let that = this,
        o = that.o,
        p = that.p;

    let dataTransferred = JSON.parse(event.originalEvent.dataTransfer.getData('text'));
    let $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
    if (o.movableColumns && dataTransferred.dragId === p.dragId) {
        let srcColName = dataTransferred.column,
            destColName = $headerCell[0]['columnName'],
            srcCol = p.columns.get(srcColName),
            destCol = p.columns.get(destColName);
        if (srcCol && destCol && srcCol.movable && (destCol.movable || destCol !== p.visibleColumns[0])) {
            this.moveColumn(srcColName, destColName);
        }
    }
    $($headerCell).removeClass('drag-over');
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._clearSortArrows = function () {

    let that = this,
        p = that.p;

    if (p.$table) {
        let tableClassName = this.o.tableClassName;
        let sortedColumns = p.$headerRow.find('>div.' + tableClassName + '-header-cell.sorted');
        let arrows = sortedColumns.find('>div>.sort-arrow');
        arrows.each((_, arrow) => {
            let col = p.columns.get(arrow.parentNode.parentNode['columnName']);
            if (col) {
                col.arrowProposedWidth = 0;
            }
        });
        arrows.remove();
        sortedColumns.removeClass('sorted').removeClass('desc');
    }
    return this;
};

/**
 * @private
 * @param {string} column the name of the sort column
 * @param {boolean} descending table is sorted descending
 * @returns {DGTable} self
 */
DGTable.prototype._showSortArrow = function (column, descending) {

    let that = this,
        p = that.p;

    let col = p.columns.get(column);
    if (!col) return false;

    let arrow = createElement('span');
    arrow.className = 'sort-arrow';

    if (col.element) {
        col.element.addClass(descending ? 'sorted desc' : 'sorted');
        col.element[0].firstChild.insertBefore(arrow, col.element[0].firstChild.firstChild);
    }

    if (col.widthMode !== ColumnWidthMode.RELATIVE && this.o.adjustColumnWidthForSortArrow) {
        col.arrowProposedWidth = arrow.scrollWidth + (parseFloat($(arrow).css('margin-right')) || 0) + (parseFloat($(arrow).css('margin-left')) || 0);
    }

    return this;
};

/**
 * @private
 * @param {number} cellIndex index of the column in the DOM
 * @returns {DGTable} self
 */
DGTable.prototype._resizeColumnElements = function (cellIndex) {

    let that = this,
        p = that.p;

    let headerCells = p.$headerRow.find('div.' + this.o.tableClassName + '-header-cell');
    let col = p.columns.get(headerCells[cellIndex]['columnName']);

    if (col) {
        headerCells[cellIndex].style.width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';

        let width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';
        let tbodyChildren = p.tbody.childNodes;
        for (let i = 0, count = tbodyChildren.length; i < count; i++) {
            let rowEl = tbodyChildren[i];
            if (rowEl.nodeType !== 1) continue;
            rowEl.childNodes[cellIndex].style.width = width;
        }
    }

    return this;
};

/**
 * @returns {DGTable} self
 * */
DGTable.prototype._destroyHeaderCells = function() {

    let that = this,
        o = that.o,
        p = that.p;

    if (p.$headerRow) {
        this.trigger('headerrowdestroy', p.headerRow);
        p.$headerRow.find('div.' + o.tableClassName + '-header-cell').remove();
        p.$headerRow = null;
        p.headerRow = null;
    }
    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._renderSkeletonBase = function () {
    let that = this,
        p = that.p,
        o = that.o;

    // Clean up old elements

    p.virtualListHelper?.destroy();
    p.virtualListHelper = null;

    if (p.$table && o.virtualTable) {
        p.$table.remove();
        p.$table = p.table = p.$tbody = p.tbody = null;
    }

    that._destroyHeaderCells();
    p.currentTouchId = null;
    if (p.$header) {
        p.$header.remove();
    }

    // Create new base elements
    let tableClassName = o.tableClassName,
        header = createElement('div'),
        $header = $(header),
        headerRow = createElement('div'),
        $headerRow = $(headerRow);

    header.className = tableClassName + '-header';
    headerRow.className = tableClassName + '-header-row';

    p.$header = $header;
    p.header = header;
    p.$headerRow = $headerRow;
    p.headerRow = headerRow;
    $headerRow.appendTo(p.$header);
    $header.prependTo(this.$el);

    relativizeElement(that.$el);

    if (o.width === DGTable.Width.SCROLL) {
        this.el.style.overflow = 'hidden';
    } else {
        this.el.style.overflow = '';
    }

    if (!o.height && o.virtualTable) {
        o.height = getElementHeight(this.$el[0], true);
    }

    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._renderSkeletonHeaderCells = function () {
    let that = this,
        p = that.p,
        o = that.o;

    let allowCellPreview = o.allowCellPreview,
        allowHeaderCellPreview = o.allowHeaderCellPreview;

    let tableClassName = o.tableClassName,
        headerCellClassName = tableClassName + '-header-cell',
        headerRow = p.headerRow;

    let ieDragDropHandler;
    if (hasIeDragAndDropBug) {
        ieDragDropHandler = function(evt) {
            evt.preventDefault();
            this.dragDrop();
            return false;
        };
    }

    let preventDefault = function (event) { event.preventDefault(); };

    // Create header cells
    for (let i = 0; i < p.visibleColumns.length; i++) {
        let column = p.visibleColumns[i];
        if (column.visible) {
            let cell = createElement('div');
            let $cell = $(cell);
            cell.draggable = true;
            cell.className = headerCellClassName;
            cell.style.width = column.actualWidth + 'px';
            if (o.sortableColumns && column.sortable) {
                cell.className += ' sortable';
            }
            cell['columnName'] = column.name;
            cell.setAttribute('data-column', column.name);

            let cellInside = createElement('div');
            cellInside.innerHTML = o.headerCellFormatter(column.label, column.name);
            cell.appendChild(cellInside);
            if (allowCellPreview && allowHeaderCellPreview) {
                p._bindCellHoverIn(cell);
            }
            headerRow.appendChild(cell);

            p.visibleColumns[i].element = $cell;

            $cell.on('mousedown.dgtable', that._onMouseDownColumnHeader.bind(that))
                .on('mousemove.dgtable', that._onMouseMoveColumnHeader.bind(that))
                .on('mouseup.dgtable', that._onMouseUpColumnHeader.bind(that))
                .on('mouseleave.dgtable', that._onMouseLeaveColumnHeader.bind(that))
                .on('touchstart.dgtable', that._onTouchStartColumnHeader.bind(that))
                .on('dragstart.dgtable', that._onStartDragColumnHeader.bind(that))
                .on('click.dgtable', that._onClickColumnHeader.bind(that))
                .on('contextmenu.dgtable', preventDefault);
            $(cellInside)
                .on('dragenter.dgtable', that._onDragEnterColumnHeader.bind(that))
                .on('dragover.dgtable', that._onDragOverColumnHeader.bind(that))
                .on('dragleave.dgtable', that._onDragLeaveColumnHeader.bind(that))
                .on('drop.dgtable', that._onDropColumnHeader.bind(that));

            if (hasIeDragAndDropBug) {
                $cell.on('selectstart.dgtable', ieDragDropHandler.bind(cell));
            }

            // Disable these to allow our own context menu events without interruption
            $cell.css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none', '-o-user-select': 'none', 'user-select': 'none' });
        }
    }

    this.trigger('headerrowcreate', headerRow);

    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._renderSkeletonBody = function () {
    let that = this,
        p = that.p,
        o = that.o;

    let tableClassName = o.tableClassName;

    // Calculate virtual row heights
    if (o.virtualTable && !p.virtualRowHeight) {
        let createDummyRow = function() {
            let row = createElement('div'),
                cell = row.appendChild(createElement('div')),
                cellInner = cell.appendChild(createElement('div'));
            row.className = tableClassName + '-row';
            cell.className = tableClassName + '-cell';
            cellInner.innerHTML = '0';
            row.style.visibility = 'hidden';
            row.style.position = 'absolute';
            return row;
        };

        let $dummyTbody, $dummyWrapper = $('<div>')
            .addClass(that.el.className)
            .css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px', width: '1px', overflow: 'hidden' })
            .append(
                $('<div>').addClass(tableClassName).append(
                    $dummyTbody = $('<div>').addClass(tableClassName + '-body').css('width', 99999),
                ),
            );

        $dummyWrapper.appendTo(document.body);

        let row1 = createDummyRow(), row2 = createDummyRow(), row3 = createDummyRow();
        $dummyTbody.append(row1, row2, row3);

        p.virtualRowHeightFirst = getElementHeight(row1, true, true, true);
        p.virtualRowHeight = getElementHeight(row2, true, true, true);
        p.virtualRowHeightLast = getElementHeight(row3, true, true, true);

        $dummyWrapper.remove();
    }

    // Create inner table and tbody
    if (!p.$table) {

        let fragment = document.createDocumentFragment();

        // Create the inner table element
        let table = createElement('div');
        let $table = $(table);
        table.className = tableClassName;

        if (o.virtualTable) {
            table.className += ' virtual';
        }

        let tableHeight = (o.height - getElementHeight(p.$headerRow[0], true, true, true));
        if ($table.css('box-sizing') !== 'border-box') {
            tableHeight -= parseFloat($table.css('border-top-width')) || 0;
            tableHeight -= parseFloat($table.css('border-bottom-width')) || 0;
            tableHeight -= parseFloat($table.css('padding-top')) || 0;
            tableHeight -= parseFloat($table.css('padding-bottom')) || 0;
        }
        p.visibleHeight = tableHeight;
        table.style.height = o.height ? tableHeight + 'px' : 'auto';
        table.style.display = 'block';
        table.style.overflowY = 'auto';
        table.style.overflowX = o.width === DGTable.Width.SCROLL ? 'auto' : 'hidden';
        fragment.appendChild(table);

        // Create the "tbody" element
        let tbody = createElement('div');
        let $tbody = $(tbody);
        tbody.className = o.tableClassName + '-body';
        tbody.style.minHeight = '1px';
        p.table = table;
        p.tbody = tbody;
        p.$table = $table;
        p.$tbody = $tbody;

        relativizeElement($tbody);
        relativizeElement($table);

        table.appendChild(tbody);
        that.el.appendChild(fragment);

        this._setupVirtualTable();
    }

    return this;
};

/**
 * @private
 * @returns {DGTable} self
 * @deprecated
 */
DGTable.prototype._renderSkeleton = function () {
    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._updateVirtualHeight = function() {
    const o = this.o, p = this.p;

    if (!p.tbody)
        return this;

    if (o.virtualTable) {
        const virtualHeight =  p.virtualListHelper.estimateFullHeight();
        p.lastVirtualScrollHeight = virtualHeight;
        p.tbody.style.height = virtualHeight + 'px';
    } else {
        p.tbody.style.height = '';
    }

    return this;
};

/**
 * @private
 * @returns {DGTable} self
 */
DGTable.prototype._updateLastCellWidthFromScrollbar = function(force) {

    const p = this.p;

    // Calculate scrollbar's width and reduce from lat column's width
    let scrollbarWidth = p.table.offsetWidth - p.table.clientWidth;
    if (scrollbarWidth !== p.scrollbarWidth || force) {
        p.scrollbarWidth = scrollbarWidth;
        for (let i = 0; i < p.columns.length; i++) {
            p.columns[i].actualWidthConsideringScrollbarWidth = null;
        }

        if (p.scrollbarWidth > 0 && p.visibleColumns.length > 0) {
            // (There should always be at least 1 column visible, but just in case)
            let lastColIndex = p.visibleColumns.length - 1;

            p.visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth = p.visibleColumns[lastColIndex].actualWidth - p.scrollbarWidth;
            let lastColWidth = p.visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth + 'px';
            let tbodyChildren = p.tbody.childNodes;
            for (let i = 0, count = tbodyChildren.length; i < count; i++) {
                let row = tbodyChildren[i];
                if (row.nodeType !== 1) continue;
                row.childNodes[lastColIndex].style.width = lastColWidth;
            }

            p.headerRow.childNodes[lastColIndex].style.width = lastColWidth;
        }

        p.notifyRendererOfColumnsConfig?.();
    }

    return this;
};

/**
 * Explicitly set the width of the table based on the sum of the column widths
 * @private
 * @param {boolean} parentSizeMayHaveChanged Parent size may have changed, treat rendering accordingly
 * @returns {DGTable} self
 */
DGTable.prototype._updateTableWidth = function (parentSizeMayHaveChanged) {
    const o = this.o, p = this.p;
    let width = this._calculateTbodyWidth();

    p.tbody.style.minWidth = width + 'px';
    p.headerRow.style.minWidth = (width + (p.scrollbarWidth || 0)) + 'px';

    p.$table.off('scroll', p.onTableScrolledHorizontallyBound);

    if (o.width === DGTable.Width.AUTO) {
        // Update wrapper element's size to fully contain the table body

        setElementWidth(p.$table[0], getElementWidth(p.tbody, true, true, true));
        setElementWidth(this.$el[0], getElementWidth(p.$table[0], true, true, true));

    } else if (o.width === DGTable.Width.SCROLL) {

        if (parentSizeMayHaveChanged) {
            let lastScrollTop = p.table ? p.table.scrollTop : 0,
                lastScrollLeft = p.table ? p.table.scrollLeft : 0;

            // BUGFIX: Relayout before recording the widths
            webkitRenderBugfix(this.el);

            p.table.scrollTop = lastScrollTop;
            p.table.scrollLeft = lastScrollLeft;
            p.header.scrollLeft = lastScrollLeft;
        }

        p.$table.on('scroll', p.onTableScrolledHorizontallyBound);
    }

    return this;
};

/**
 * @private
 * @returns {boolean}
 */
DGTable.prototype._isTableRtl = function() {
    return this.p.$table.css('direction') === 'rtl';
};

/**
 * @private
 * @param {Object} column column object
 * @returns {string}
 */
DGTable.prototype._serializeColumnWidth = function(column) {
    return column.widthMode === ColumnWidthMode.AUTO ? 'auto' :
        column.widthMode === ColumnWidthMode.RELATIVE ? column.width * 100 + '%' :
            column.width;
};

/**
 * @private
 * @param {HTMLElement} el
 */
DGTable.prototype._cellMouseOverEvent = function(el) {
    const o = this.o, p = this.p;

    let elInner = el.firstChild;

    if ((elInner.scrollWidth - elInner.clientWidth > 1) ||
        (elInner.scrollHeight - elInner.clientHeight > 1)) {

        this.hideCellPreview();
        p.abortCellPreview = false;

        let $el = $(el), $elInner = $(elInner);
        const rowNode = el.parentNode;
        let previewCell = createElement('div'), $previewCell = $(previewCell);
        previewCell.innerHTML = el.innerHTML;
        previewCell.className = o.cellPreviewClassName;

        let isHeaderCell = $el.hasClass(o.tableClassName + '-header-cell');
        if (isHeaderCell) {
            previewCell.className += ' header';
            if ($el.hasClass('sortable')) {
                previewCell.className += ' sortable';
            }

            previewCell.draggable = true;

            $(previewCell).on('mousedown', this._onMouseDownColumnHeader.bind(this))
                .on('mousemove', this._onMouseMoveColumnHeader.bind(this))
                .on('mouseup', this._onMouseUpColumnHeader.bind(this))
                .on('mouseleave', this._onMouseLeaveColumnHeader.bind(this))
                .on('touchstart', this._onTouchStartColumnHeader.bind(this))
                .on('dragstart', this._onStartDragColumnHeader.bind(this))
                .on('click', this._onClickColumnHeader.bind(this))
                .on('contextmenu.dgtable', function (event) { event.preventDefault(); });
            $(previewCell.firstChild)
                .on('dragenter', this._onDragEnterColumnHeader.bind(this))
                .on('dragover', this._onDragOverColumnHeader.bind(this))
                .on('dragleave', this._onDragLeaveColumnHeader.bind(this))
                .on('drop', this._onDropColumnHeader.bind(this));

            if (hasIeDragAndDropBug) {
                $(previewCell).on('selectstart', (function(evt) {
                    evt.preventDefault();
                    this.dragDrop();
                    return false;
                }).bind(previewCell));
            }
        }

        let paddingL = parseFloat($el.css('padding-left')) || 0,
            paddingR = parseFloat($el.css('padding-right')) || 0,
            paddingT = parseFloat($el.css('padding-top')) || 0,
            paddingB = parseFloat($el.css('padding-bottom')) || 0;

        let requiredWidth = elInner.scrollWidth + (el.clientWidth - elInner.offsetWidth);

        let borderBox = $el.css('box-sizing') === 'border-box';
        if (borderBox) {
            $previewCell.css('box-sizing', 'border-box');
        } else {
            requiredWidth -= paddingL + paddingR;
            $previewCell.css('margin-top', parseFloat($(el).css('border-top-width')) || 0);
        }

        if (!p.transparentBgColor1) {
            // Detect browser's transparent spec
            let tempDiv = document.createElement('div');
            tempDiv.style.backgroundColor = 'transparent';
            p.transparentBgColor1 = $(tempDiv).css('background-color');
            tempDiv.style.backgroundColor = 'rgba(0,0,0,0)';
            p.transparentBgColor2 = $(tempDiv).css('background-color');
        }

        let css = {
            'box-sizing': borderBox ? 'border-box' : 'content-box',
            'width': requiredWidth,
            'min-height': getElementHeight($el[0]),
            'padding-left': paddingL,
            'padding-right': paddingR,
            'padding-top': paddingT,
            'padding-bottom': paddingB,
            'overflow': 'hidden',
            'position': 'absolute',
            'z-index': '-1',
            'left': '0',
            'top': '0',
            'cursor': $el.css('cursor'),
        };

        if (css) {
            let bgColor = $(el).css('background-color');
            if (bgColor === p.transparentBgColor1 || bgColor === p.transparentBgColor2) {
                bgColor = $(rowNode).css('background-color');
            }
            if (bgColor === p.transparentBgColor1 || bgColor === p.transparentBgColor2) {
                bgColor = '#fff';
            }
            css['background-color'] = bgColor;
        }

        $previewCell.css(css);

        this.el.appendChild(previewCell);

        $(previewCell.firstChild).css({
            'direction': $elInner.css('direction'),
            'white-space': $elInner.css('white-space'),
        });

        if (isHeaderCell) {
            // Disable these to allow our own context menu events without interruption
            $previewCell.css({
                '-webkit-touch-callout': 'none',
                '-webkit-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                '-o-user-select': 'none',
                'user-select': 'none',
            });
        }

        previewCell['rowIndex'] = rowNode['rowIndex'];
        let physicalRowIndex = previewCell['physicalRowIndex'] = rowNode['physicalRowIndex'];
        previewCell['columnName'] = p.visibleColumns[nativeIndexOf.call(rowNode.childNodes, el)].name;

        try {
            let selection = SelectionHelper.saveSelection(el);
            if (selection)
                SelectionHelper.restoreSelection(previewCell, selection);
        } catch (ignored) { /* we're ok with this */ }

        this.trigger(
            'cellpreview',
            previewCell.firstChild,
            physicalRowIndex == null ? null : physicalRowIndex,
            previewCell['columnName'],
            physicalRowIndex == null ? null : p.rows[physicalRowIndex],
            el,
        );

        if (p.abortCellPreview) {
            $previewCell.remove();
            return;
        }

        if (physicalRowIndex != null) {
            previewCell.addEventListener('click', event => {
                this.trigger('rowclick', event,
                    rowNode['rowIndex'], physicalRowIndex,
                    rowNode, p.rows[physicalRowIndex]);
            });
        }

        let $parent = this.$el;
        let $scrollParent = $parent[0] === window ? $(document) : $parent;

        let offset = $el.offset();
        let parentOffset = $parent.offset();
        let rtl = $el.css('float') === 'right';
        let prop = rtl ? 'right' : 'left';

        // Handle RTL, go from the other side
        if (rtl) {
            let windowWidth = $(window).width();
            offset.right = windowWidth - (offset.left + getElementWidth($el[0], true, true, true));
            parentOffset.right = windowWidth - (parentOffset.left + getElementWidth($parent[0], true, true, true));
        }

        // If the parent has borders, then it would offset the offset...
        offset.left -= parseFloat($parent.css('border-left-width')) || 0;
        offset.right -= parseFloat($parent.css('border-right-width')) || 0;
        offset.top -= parseFloat($parent.css('border-top-width')) || 0;

        // Handle border widths of the element being offset
        offset[prop] += parseFloat($(el).css('border-' + prop + '-width')) || 0;
        offset.top += parseFloat($(el).css('border-top-width')) || parseFloat($(el).css('border-bottom-width')) || 0;

        // Subtract offsets to get offset relative to parent
        offset.left -= parentOffset.left;
        offset.right -= parentOffset.right;
        offset.top -= parentOffset.top;

        // Constrain horizontally
        let minHorz = 0,
            maxHorz = $parent - getElementWidth($previewCell[0], true, true, true);
        offset[prop] = offset[prop] < minHorz ?
            minHorz :
            (offset[prop] > maxHorz ? maxHorz : offset[prop]);

        // Constrain vertically
        let totalHeight = getElementHeight($el[0], true, true, true);
        let maxTop = $scrollParent.scrollTop() + getElementHeight($parent[0], true) - totalHeight;
        if (offset.top > maxTop) {
            offset.top = Math.max(0, maxTop);
        }

        // Apply css to preview cell
        let previewCss = {
            top: offset.top,
            'z-index': 9999,
        };
        previewCss[prop] = offset[prop];

        $previewCell.css(previewCss);

        previewCell['__cell'] = el;
        p.$cellPreviewCell = $previewCell;
        el['__previewCell'] = previewCell;

        p._bindCellHoverOut(el);
        p._bindCellHoverOut(previewCell);

        // Avoid interfering with wheel scrolling the table
        $previewCell.on('wheel', () => {
            // Let the table naturally scroll with the wheel
            this.hideCellPreview();
        });
    }
};

/**
 * @private
 * @param {HTMLElement} _el
 */
DGTable.prototype._cellMouseOutEvent = function(_el) {
    this.hideCellPreview();
};

/**
 * Hides the current cell preview,
 * or prevents the one that is currently trying to show (in the 'cellpreview' event)
 * @public
 * @expose
 * @returns {DGTable} self
 */
DGTable.prototype.hideCellPreview = function() {
    const p = this.p;

    if (p.$cellPreviewCell) {
        let previewCell = p.$cellPreviewCell[0];
        let origCell = previewCell['__cell'];
        let selection;

        try {
            selection = SelectionHelper.saveSelection(previewCell);
        } catch (ignored) { /* we're ok with this */ }

        p.$cellPreviewCell.remove();
        p._unbindCellHoverOut(origCell);
        p._unbindCellHoverOut(previewCell);

        try {
            if (selection)
                SelectionHelper.restoreSelection(origCell, selection);
        } catch (ignored) { /* we're ok with this */ }

        this.trigger('cellpreviewdestroy', previewCell.firstChild, previewCell['physicalRowIndex'], previewCell['columnName'], origCell);

        origCell['__previewCell'] = null;
        previewCell['__cell'] = null;

        p.$cellPreviewCell = null;
        p.abortCellPreview = false;
    } else {
        p.abortCellPreview = true;
    }

    return this;
};

// It's a shame the Google Closure Compiler does not support exposing a nested @param

/**
 * @typedef {Object} SERIALIZED_COLUMN
 * @property {number|null|undefined} [order=0]
 * @property {string|null|undefined} [width='auto']
 * @property {boolean|null|undefined} [visible=true]
 * */

/**
 * @typedef {Object} SERIALIZED_COLUMN_SORT
 * @property {string|null|undefined} [column='']
 * @property {boolean|null|undefined} [descending=false]
 * */

/**
 * @enum {ColumnWidthMode|number|undefined}
 * @const
 * @typedef {ColumnWidthMode}
 */
const ColumnWidthMode = {
    /** @const*/ AUTO: 0,
    /** @const*/ ABSOLUTE: 1,
    /** @const*/ RELATIVE: 2,
};

/**
 * @enum {DGTable.Width|string|undefined}
 * @const
 * @typedef {DGTable.Width}
 */
DGTable.Width = {
    /** @const*/ NONE: 'none',
    /** @const*/ AUTO: 'auto',
    /** @const*/ SCROLL: 'scroll',
};

/**
 * @expose
 * @typedef {Object} COLUMN_SORT_OPTIONS
 * @property {string|null|undefined} column
 * @property {boolean|null|undefined} [descending=false]
 * */

/**
 * @expose
 * @typedef {Object} COLUMN_OPTIONS
 * @property {string|null|undefined} width
 * @property {string|null|undefined} name
 * @property {string|null|undefined} label
 * @property {string|null|undefined} dataPath - defaults to `name`
 * @property {string|null|undefined} comparePath - defaults to `dataPath`
 * @property {number|string|null|undefined} comparePath
 * @property {boolean|null|undefined} [resizable=true]
 * @property {boolean|null|undefined} [movable=true]
 * @property {boolean|null|undefined} [sortable=true]
 * @property {boolean|null|undefined} [visible=true]
 * @property {string|null|undefined} [cellClasses]
 * @property {boolean|null|undefined} [ignoreMin=false]
 * */

/**
 * @typedef {Object} DGTable.Options
 * @property {COLUMN_OPTIONS[]} [columns]
 * @property {number} [height]
 * @property {DGTable.Width} [width]
 * @property {boolean|null|undefined} [virtualTable=true]
 * @property {number|null|undefined} [estimatedRowHeight=40]
 * @property {boolean|null|undefined} [resizableColumns=true]
 * @property {boolean|null|undefined} [movableColumns=true]
 * @property {number|null|undefined} [sortableColumns=1]
 * @property {boolean|null|undefined} [adjustColumnWidthForSortArrow=true]
 * @property {boolean|null|undefined} [relativeWidthGrowsToFillWidth=true]
 * @property {boolean|null|undefined} [relativeWidthShrinksToFillWidth=false]
 * @property {boolean|null|undefined} [convertColumnWidthsToRelative=false]
 * @property {boolean|null|undefined} [autoFillTableWidth=false]
 * @property {boolean|null|undefined} [allowCancelSort=true]
 * @property {string|null|undefined} [cellClasses]
 * @property {string|string[]|COLUMN_SORT_OPTIONS|COLUMN_SORT_OPTIONS[]} [sortColumn]
 * @property {Function|null|undefined} [cellFormatter=null]
 * @property {Function|null|undefined} [headerCellFormatter=null]
 * @property {number|null|undefined} [rowsBufferSize=10]
 * @property {number|null|undefined} [minColumnWidth=35]
 * @property {number|null|undefined} [resizeAreaWidth=8]
 * @property {function(columnName: string, descending: boolean, defaultComparator: function(a,b):number):{function(a,b):number}} [onComparatorRequired]
 * @property {function(data: any[], sort: function(any[]):any[]):any[]} [customSortingProvider]
 * @property {string|null|undefined} [resizerClassName=undefined]
 * @property {string|null|undefined} [tableClassName=undefined]
 * @property {boolean|null|undefined} [allowCellPreview=true]
 * @property {boolean|null|undefined} [allowHeaderCellPreview=true]
 * @property {string|null|undefined} [cellPreviewClassName=undefined]
 * @property {boolean|null|undefined} [cellPreviewAutoBackground=true]
 * @property {Element|null|undefined} [el=undefined]
 * @property {string|null|undefined} [className=undefined]
 * @property {Function|null|undefined} [filter=undefined]
 * */

/**
 * @typedef {{
     *  currentTarget: Element,
     *  data: Object.<string, *>,
     *  delegateTarget: Element,
     *  isDefaultPrevented: boolean,
     *  isImmediatePropagationStopped: boolean,
     *  isPropagationStopped: boolean,
     *  namespace: string,
     *  originalEvent: MouseEvent|TouchEvent|Event,
     *  pageX: number,
     *  pageY: number,
     *  preventDefault: Function,
     *  props: Object.<string, *>,
     *  relatedTarget: Element,
     *  result: *,
     *  stopImmediatePropagation: Function,
     *  stopPropagation: Function,
     *  target: Element,
     *  timeStamp: number,
     *  type: string,
     *  which: number
     * }} jQuery_Event
 * */

if (!$.controls) {
    $.controls = {};
}

$.controls.dgtable = DGTable;

export default DGTable;
