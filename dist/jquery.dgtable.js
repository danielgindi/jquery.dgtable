/*!
 * jquery.dgtable 0.5.22
 * git://github.com/danielgindi/jquery.dgtable.git
 */

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["DGTable"] = factory(require("jquery"));
	else
		root["DGTable"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0).default;
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _jquery = __webpack_require__(1),
	    _jquery2 = _interopRequireDefault(_jquery),
	    _util = __webpack_require__(2),
	    _row_collection = __webpack_require__(3),
	    _row_collection2 = _interopRequireDefault(_row_collection),
	    _column_collection = __webpack_require__(4),
	    _column_collection2 = _interopRequireDefault(_column_collection),
	    _css_util = __webpack_require__(5),
	    _css_util2 = _interopRequireDefault(_css_util),
	    _selection_helper = __webpack_require__(6),
	    _selection_helper2 = _interopRequireDefault(_selection_helper),
	    _by_column_filter = __webpack_require__(7),
	    _by_column_filter2 = _interopRequireDefault(_by_column_filter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var $ = _jquery2['default'],
	    userAgent = navigator.userAgent,
	    ieVersion = userAgent.indexOf('MSIE ') != -1 ? parseFloat(userAgent.substr(userAgent.indexOf('MSIE ') + 5)) : null,
	    hasIeDragAndDropBug = ieVersion && ieVersion < 10,
	    createElement = (0, _util.bind)(document.createElement, document);

	function webkitRenderBugfix(el) {
	    // BUGFIX: WebKit has a bug where it does not relayout, and this affects us because scrollbars 
	    //   are still calculated even though they are not there yet. This is the last resort.
	    var oldDisplay = el.style.display;
	    el.style.display = 'none';
	    //noinspection BadExpressionStatementJS
	    el.offsetHeight; // No need to store this anywhere, the reference is enough
	    el.style.display = oldDisplay;
	    return el;
	}

	function relativizeElement($el) {
	    if (!(0, _util.contains)(['relative', 'absolute', 'fixed'], $el.css('position'))) {
	        $el.css('position', 'relative');
	    }
	}

	/** @class DGTable */
	var DGTable = function DGTable() {
	    if (!(this instanceof DGTable)) {
	        // Allow constructing without `new`
	        return new (Function.prototype.bind.apply(DGTable, [DGTable].concat(Array.prototype.slice.call(arguments, 0))))();
	    }

	    this.initialize.apply(this, arguments);
	};

	/**
	 * @public
	 * @expose
	 * @type {string}
	 */
	DGTable.VERSION = '0.5.22';

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
	    var that = this;

	    options = options || {};

	    /**
	     * @private
	     * @type {DGTable.Options}
	     * */
	    var o = that.o = {},
	        p = that.p = {};

	    /**
	     * @private
	     * This is for encapsulating private data */


	    /** This is for encapsulating event callback */
	    p.events = {};

	    /**
	     * @public
	     * @expose
	     * */
	    that.el = options.el && options.el instanceof Element ? options.el : document.createElement('div');

	    /**
	     * @public
	     * @expose
	     * */
	    var $el = that.$el = $(that.el);

	    if (that.el !== options.el) {
	        $el.addClass(options.className || 'dgtable-wrapper');
	    }

	    // Set control data
	    $el.data('control', that).data('dgtable', that);

	    // For jQuery.UI or jquery.removeevent
	    $el.on('remove', function () {
	        that.destroy();
	    });

	    p.onMouseMoveResizeAreaBound = (0, _util.bind)(this._onMouseMoveResizeArea, this);
	    p.onEndDragColumnHeaderBound = (0, _util.bind)(this._onEndDragColumnHeader, this);
	    p.onTableScrolledHorizontallyBound = (0, _util.bind)(this._onTableScrolledHorizontally, this);

	    this.$el.on('dragend', p.onEndDragColumnHeaderBound);

	    /**
	     * @private
	     * @field {Boolean} _tableSkeletonNeedsRendering */
	    p.tableSkeletonNeedsRendering = true;

	    /**
	     * @private
	     * @field {Boolean} virtualTable */
	    o.virtualTable = options.virtualTable === undefined ? true : !!options.virtualTable;

	    /**
	     * @private
	     * @field {Number} rowsBufferSize */
	    o.rowsBufferSize = options.rowsBufferSize || 3;

	    /**
	     * @private
	     * @field {Number} minColumnWidth */
	    o.minColumnWidth = Math.max(options.minColumnWidth || 35, 0);

	    /**
	     * @private
	     * @field {Number} resizeAreaWidth */
	    o.resizeAreaWidth = options.resizeAreaWidth || 8;

	    /**
	     * @private
	     * @field {Boolean} resizableColumns */
	    o.resizableColumns = options.resizableColumns === undefined ? true : !!options.resizableColumns;

	    /**
	     * @private
	     * @field {Boolean} movableColumns */
	    o.movableColumns = options.movableColumns === undefined ? true : !!options.movableColumns;

	    /**
	     * @private
	     * @field {Number} sortableColumns */
	    o.sortableColumns = options.sortableColumns === undefined ? 1 : parseInt(options.sortableColumns, 10) || 1;

	    /**
	     * @private
	     * @field {Boolean} adjustColumnWidthForSortArrow */
	    o.adjustColumnWidthForSortArrow = options.adjustColumnWidthForSortArrow === undefined ? true : !!options.adjustColumnWidthForSortArrow;

	    /**
	     * @private
	     * @field {Boolean} convertColumnWidthsToRelative */
	    o.convertColumnWidthsToRelative = options.convertColumnWidthsToRelative === undefined ? false : !!options.convertColumnWidthsToRelative;

	    /**
	     * @private
	     * @field {Boolean} autoFillTableWidth */
	    o.autoFillTableWidth = options.autoFillTableWidth === undefined ? false : !!options.autoFillTableWidth;

	    /**
	     * @private
	     * @field {String} cellClasses */
	    o.cellClasses = options.cellClasses === undefined ? '' : options.cellClasses;

	    /**
	     * @private
	     * @field {String} resizerClassName */
	    o.resizerClassName = options.resizerClassName === undefined ? 'dgtable-resize' : options.resizerClassName;

	    /**
	     * @private
	     * @field {String} tableClassName */
	    o.tableClassName = options.tableClassName === undefined ? 'dgtable' : options.tableClassName;

	    /**
	     * @private
	     * @field {Boolean} allowCellPreview */
	    o.allowCellPreview = options.allowCellPreview === undefined ? true : options.allowCellPreview;

	    /**
	     * @private
	     * @field {Boolean} allowHeaderCellPreview */
	    o.allowHeaderCellPreview = options.allowHeaderCellPreview === undefined ? true : options.allowHeaderCellPreview;

	    /**
	     * @private
	     * @field {String} cellPreviewClassName */
	    o.cellPreviewClassName = options.cellPreviewClassName === undefined ? 'dgtable-cell-preview' : options.cellPreviewClassName;

	    /**
	     * @private
	     * @field {Boolean} cellPreviewAutoBackground */
	    o.cellPreviewAutoBackground = options.cellPreviewAutoBackground === undefined ? true : options.cellPreviewAutoBackground;

	    /**
	     * @private
	     * @field {Function(String,Boolean)Function(a,b)Boolean} onComparatorRequired */
	    o.onComparatorRequired = options.onComparatorRequired === undefined ? null : options.onComparatorRequired;
	    if (!o.onComparatorRequired && typeof options['comparatorCallback'] === 'function') {
	        o.onComparatorRequired = options['comparatorCallback'];
	    }

	    /**
	     * @private
	     * @field {Boolean} width */
	    o.width = options.width === undefined ? DGTable.Width.NONE : options.width;

	    /**
	     * @private
	     * @field {Boolean} relativeWidthGrowsToFillWidth */
	    o.relativeWidthGrowsToFillWidth = options.relativeWidthGrowsToFillWidth === undefined ? true : !!options.relativeWidthGrowsToFillWidth;

	    /**
	     * @private
	     * @field {Boolean} relativeWidthShrinksToFillWidth */
	    o.relativeWidthShrinksToFillWidth = options.relativeWidthShrinksToFillWidth === undefined ? false : !!options.relativeWidthShrinksToFillWidth;

	    this.setCellFormatter(options.cellFormatter);
	    this.setHeaderCellFormatter(options.headerCellFormatter);
	    this.setFilter(options.filter);

	    /** @private
	     * @field {Number} height */
	    o.height = options.height;

	    // Prepare columns
	    that.setColumns(options.columns || [], false);

	    // Set sorting columns
	    var sortColumns = [];

	    if (options.sortColumn) {

	        var tmpSortColumns = options.sortColumn;

	        if (tmpSortColumns && (typeof tmpSortColumns === 'undefined' ? 'undefined' : _typeof(tmpSortColumns)) !== 'object') {
	            tmpSortColumns = [tmpSortColumns];
	        }

	        if (tmpSortColumns instanceof Array || (typeof tmpSortColumns === 'undefined' ? 'undefined' : _typeof(tmpSortColumns)) === 'object') {

	            for (var i = 0, len = tmpSortColumns.length, sortColumn; i < len; i++) {
	                sortColumn = tmpSortColumns[i];

	                if (typeof sortColumn === 'string') {
	                    sortColumn = { column: sortColumn, descending: false };
	                }
	                var col = p.columns.get(sortColumn.column);
	                sortColumns.push({
	                    column: sortColumn.column,
	                    comparePath: col.comparePath,
	                    descending: sortColumn.descending
	                });
	            }
	        }
	    }

	    /** @field {RowCollection} _rows */
	    p.rows = new _row_collection2['default']({ sortColumn: sortColumns });
	    p.rows.onComparatorRequired = function (column, descending) {
	        if (o.onComparatorRequired) {
	            return o.onComparatorRequired(column, descending);
	        }
	    };

	    /** @private
	     * @field {RowCollection} _filteredRows */
	    p.filteredRows = null;

	    /*
	     Setup hover mechanism.
	     We need this to be high performance, as there may be MANY cells to call this on, on creation and destruction.
	     Using native events to spare the overhead of jQuery's event binding, and even just the creation of the jQuery collection object.
	     */

	    /**
	     * @param {MouseEvent} evt
	     * @this {HTMLElement}
	     * */
	    var hoverMouseOverHandler = function hoverMouseOverHandler(evt) {
	        evt = evt || event;
	        var relatedTarget = evt.fromElement || evt.relatedTarget;
	        if (relatedTarget == this || $.contains(this, relatedTarget)) return;
	        if (this['__previewCell'] && (relatedTarget == this['__previewCell'] || $.contains(this['__previewCell'], relatedTarget))) return;
	        that._cellMouseOverEvent.call(that, this);
	    },
	        hoverMouseOutHandler = function hoverMouseOutHandler(evt) {
	        evt = evt || event;
	        var relatedTarget = evt.toElement || evt.relatedTarget;
	        if (relatedTarget == this || $.contains(this, relatedTarget)) return;
	        if (this['__previewCell'] && (relatedTarget == this['__previewCell'] || $.contains(this['__previewCell'], relatedTarget))) return;
	        that._cellMouseOutEvent.call(that, this);
	    };

	    /**
	     * @param {MouseEvent} evt
	     * @this {HTMLElement}
	     * */


	    if ('addEventListener' in window) {

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * */
	        p._bindCellHoverIn = function (el) {
	            if (!el['__hoverIn']) {
	                el.addEventListener('mouseover', el['__hoverIn'] = (0, _util.bind)(hoverMouseOverHandler, el));
	            }
	        };

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * */
	        p._unbindCellHoverIn = function (el) {
	            if (el['__hoverIn']) {
	                el.removeEventListener('mouseover', el['__hoverIn']);
	                el['__hoverIn'] = null;
	            }
	        };

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * @returns {DGTable} self
	         * */
	        p._bindCellHoverOut = function (el) {
	            if (!el['__hoverOut']) {
	                el.addEventListener('mouseout', el['__hoverOut'] = (0, _util.bind)(hoverMouseOutHandler, el['__cell'] || el));
	            }
	            return this;
	        };

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * @returns {DGTable} self
	         * */
	        p._unbindCellHoverOut = function (el) {
	            if (el['__hoverOut']) {
	                el.removeEventListener('mouseout', el['__hoverOut']);
	                el['__hoverOut'] = null;
	            }
	            return this;
	        };
	    } else {

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * */
	        p._bindCellHoverIn = function (el) {
	            if (!el['__hoverIn']) {
	                el.attachEvent('mouseover', el['__hoverIn'] = (0, _util.bind)(hoverMouseOverHandler, el));
	            }
	        };

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * */
	        p._unbindCellHoverIn = function (el) {
	            if (el['__hoverIn']) {
	                el.detachEvent('mouseover', el['__hoverIn']);
	                el['__hoverIn'] = null;
	            }
	        };

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * */
	        p._bindCellHoverOut = function (el) {
	            if (!el['__hoverOut']) {
	                el.attachEvent('mouseout', el['__hoverOut'] = (0, _util.bind)(hoverMouseOutHandler, el['__cell'] || el));
	            }
	        };

	        /**
	         * @param {HTMLElement} el cell or header-cell
	         * @returns {DGTable} self
	         * */
	        p._unbindCellHoverOut = function (el) {
	            if (el['__hoverOut']) {
	                el.detachEvent('mouseout', el['__hoverOut']);
	                el['__hoverOut'] = null;
	            }
	            return this;
	        };
	    }
	};

	/**
	 * Add an event listener
	 * @public
	 * @expose
	 * @param {String} eventName
	 * @param {Function} callback
	 * @returns {DGTable}
	 */
	DGTable.prototype.on = function (eventName, callback) {
	    var that = this,
	        events = that.p.events;

	    if (typeof callback !== 'function') return that;

	    if (!events.hasOwnProperty(eventName)) events[eventName] = [];

	    events[eventName].push({
	        cb: callback,
	        once: false
	    });

	    return that;
	};

	/**
	 * Add an event listener for a one shot
	 * @public
	 * @expose
	 * @param {String} eventName
	 * @param {Function} callback
	 * @returns {DGTable}
	 */
	DGTable.prototype.once = function (eventName, callback) {
	    var that = this,
	        events = that.p.events;

	    if (typeof callback !== 'function') return that;

	    if (!events.hasOwnProperty(eventName)) events[eventName] = [];

	    events[eventName].push({
	        cb: callback,
	        once: true
	    });

	    return that;
	};

	/**
	 * Remove an event listener
	 * @public
	 * @expose
	 * @param {String} eventName
	 * @param {Function} callback
	 * @returns {DGTable}
	 */
	DGTable.prototype.off = function (eventName, callback) {
	    var that = this,
	        events = that.p.events;

	    if (!events.hasOwnProperty(eventName)) return that;

	    for (var callbacks = events[eventName], i = 0, item; i < callbacks.length; i++) {
	        item = callbacks[i];

	        if (callback && item.cb !== callback) continue;
	        callbacks.splice(i--, 1);
	    }

	    return that;
	};

	DGTable.prototype.trigger = function (eventName) {
	    var that = this,
	        events = that.p.events;

	    if (events.hasOwnProperty(eventName)) {
	        for (var callbacks = events[eventName], i = 0, item; i < callbacks.length; i++) {
	            item = callbacks[i];

	            if (item.once) {
	                callbacks.splice(i--, 1);
	            }
	            item.cb.apply(that, Array.prototype.slice.call(arguments, 1));
	        }
	    }

	    return that;
	};

	/**
	 * Detect column width mode
	 * @private
	 * @param {Number|String} width
	 * @param {Number} minWidth
	 * @returns {Object} parsed width
	 */
	DGTable.prototype._parseColumnWidth = function (width, minWidth) {

	    var widthSize = Math.max(0, parseFloat(width)),
	        widthMode = ColumnWidthMode.AUTO; // Default

	    if (widthSize > 0) {
	        // Well, it's sure is not AUTO, as we have a value

	        if (width == widthSize + '%') {
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
	DGTable.prototype._initColumnFromData = function (columnData) {

	    var parsedWidth = this._parseColumnWidth(columnData.width, columnData.ignoreMin ? 0 : this.o.minColumnWidth),
	        col = {
	        name: columnData.name,
	        label: columnData.label === undefined ? columnData.name : columnData.label,
	        width: parsedWidth.width,
	        widthMode: parsedWidth.mode,
	        resizable: columnData.resizable === undefined ? true : columnData.resizable,
	        sortable: columnData.sortable === undefined ? true : columnData.sortable,
	        movable: columnData.movable === undefined ? true : columnData.movable,
	        visible: columnData.visible === undefined ? true : columnData.visible,
	        cellClasses: columnData.cellClasses === undefined ? this.o.cellClasses : columnData.cellClasses,
	        ignoreMin: columnData.ignoreMin === undefined ? false : !!columnData.ignoreMin
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

	    var that = this,
	        p = that.p || {},
	        $el = that.$el;

	    if (that.__removed) {
	        return that;
	    }

	    if (p.$resizer) {
	        p.$resizer.remove();
	        p.$resizer = null;
	    }

	    if (p.$tbody) {
	        for (var trs = p.$tbody[0].childNodes, i = 0, len = trs.length; i < len; i++) {
	            that.trigger('rowdestroy', trs[i]);
	        }
	    }

	    // Using quotes for __super__ because Google Closure Compiler has a bug...

	    this._destroyHeaderCells()._unbindCellEventsForTable();
	    if (p.$table) {
	        p.$table.empty();
	    }
	    if (p.$tbody) {
	        p.$tbody.empty();
	    }

	    if (p.workerListeners) {
	        for (var j = 0, worker; j < p.workerListeners.length; j++) {
	            worker = p.workerListeners[j];
	            worker.worker.removeEventListener('message', worker.listener, false);
	        }
	        p.workerListeners.length = 0;
	    }

	    p.rows.length = p.columns.length = 0;

	    if (p._deferredRender) {
	        clearTimeout(p._deferredRender);
	    }

	    // Cleanup
	    for (var prop in that) {
	        if (that.hasOwnProperty(prop)) {
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
	DGTable.prototype._unbindCellEventsForTable = function () {
	    var that = this,
	        p = that.p,
	        i,
	        rows,
	        rowCount,
	        rowToClean,
	        j,
	        cells,
	        cellCount;

	    if (p.headerRow) {
	        for (i = 0, rows = p.headerRow.childNodes, rowCount = rows.length; i < rowCount; i++) {
	            rowToClean = rows[i];
	            for (j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
	                p._unbindCellHoverIn(cells[j]);
	            }
	        }
	    }
	    if (p.tbody) {
	        for (i = 0, rows = p.tbody.childNodes, rowCount = rows.length; i < rowCount; i++) {
	            this._unbindCellEventsForRow(rows[i]);
	        }
	    }
	    return this;
	};

	/**
	 * @private
	 * @param {HTMLElement} rowToClean
	 * @returns {DGTable} self
	 */
	DGTable.prototype._unbindCellEventsForRow = function (rowToClean) {
	    for (var that = this, p = that.p, i = 0, cells = rowToClean.childNodes, cellCount = cells.length; i < cellCount; i++) {
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
	    var that = this,
	        o = that.o,
	        p = that.p;

	    if (!this.el.offsetParent) {
	        if (!p._deferredRender) {
	            p._deferredRender = setTimeout(function () {
	                p._deferredRender = null;
	                if (!that.__removed && that.el.offsetParent) {
	                    that.render();
	                }
	            });
	        }

	        return that;
	    }

	    var renderedRows, rowCount;

	    if (p.tableSkeletonNeedsRendering === true) {
	        p.tableSkeletonNeedsRendering = false;

	        if (o.width == DGTable.Width.AUTO) {
	            // We need to do this to return to the specified widths instead. The arrows added to the column widths...
	            that._clearSortArrows();
	        }

	        var lastScrollTop = p.table ? p.table.scrollTop : 0,
	            lastScrollLeft = p.table ? p.table.scrollLeft : 0;

	        that._renderSkeletonBase()._renderSkeletonBody().tableWidthChanged(true, false) // Take this chance to calculate required column widths
	        ._renderSkeletonHeaderCells();

	        if (!o.virtualTable) {
	            var rows = p.filteredRows || p.rows;
	            rowCount = rows.length;
	            renderedRows = that.renderRows(0, rowCount - 1);
	            p.$tbody.html('').append(renderedRows);
	            that._updateLastCellWidthFromScrollbar(true);
	        } else {
	            that._updateLastCellWidthFromScrollbar(); // Detect vertical scrollbar height
	        }

	        p.table.scrollTop = lastScrollTop;
	        p.table.scrollLeft = lastScrollLeft;
	        p.header.scrollLeft = lastScrollLeft;

	        this._updateTableWidth(true);

	        // Show sort arrows
	        for (var i = 0; i < p.rows.sortColumn.length; i++) {
	            this._showSortArrow(p.rows.sortColumn[i].column, p.rows.sortColumn[i].descending);
	        }
	        if (o.adjustColumnWidthForSortArrow && p.rows.sortColumn.length) {
	            this.tableWidthChanged(true);
	        } else if (!o.virtualTable) {
	            this.tableWidthChanged();
	        }

	        this.trigger('renderskeleton');

	        if (o.virtualTable) {
	            p.$table.on('scroll', (0, _util.bind)(this._onVirtualTableScrolled, this));
	            this.render();
	        }
	    } else if (o.virtualTable) {
	        rowCount = (p.filteredRows || p.rows).length;
	        var scrollTop = p.table.scrollTop,
	            firstVisible = Math.floor((scrollTop - p.virtualRowHeightFirst) / p.virtualRowHeight) + 1 - o.rowsBufferSize,
	            lastVisible = Math.ceil((scrollTop - p.virtualRowHeightFirst + p.visibleHeight) / p.virtualRowHeight) + o.rowsBufferSize;

	        if (firstVisible < 0) firstVisible = 0;
	        if (lastVisible >= rowCount) {
	            lastVisible = rowCount - 1;
	        }

	        var oldFirstVisible = -1,
	            oldLastVisible = -1,
	            tbodyChildNodes = p.tbody.childNodes;

	        if (tbodyChildNodes.length) {
	            oldFirstVisible = tbodyChildNodes[0]['rowIndex'];
	            oldLastVisible = tbodyChildNodes[tbodyChildNodes.length - 1]['rowIndex'];
	        }

	        var countToRemove;

	        if (oldFirstVisible !== -1 && oldFirstVisible < firstVisible) {
	            countToRemove = Math.min(oldLastVisible + 1, firstVisible) - oldFirstVisible;
	            for (var i = 0; i < countToRemove; i++) {
	                that.trigger('rowdestroy', tbodyChildNodes[0]);
	                that._unbindCellEventsForRow(tbodyChildNodes[0]);
	                p.tbody.removeChild(tbodyChildNodes[0]);
	            }
	            oldFirstVisible += countToRemove;
	            if (oldFirstVisible > oldLastVisible) {
	                oldFirstVisible = oldLastVisible = -1;
	            }
	        } else if (oldLastVisible !== -1 && oldLastVisible > lastVisible) {
	            countToRemove = oldLastVisible - Math.max(oldFirstVisible - 1, lastVisible);
	            for (var i = 0; i < countToRemove; i++) {
	                that.trigger('rowdestroy', tbodyChildNodes[tbodyChildNodes.length - 1]);
	                that._unbindCellEventsForRow(tbodyChildNodes[tbodyChildNodes.length - 1]);
	                p.tbody.removeChild(tbodyChildNodes[tbodyChildNodes.length - 1]);
	            }
	            if (oldLastVisible < oldFirstVisible) {
	                oldFirstVisible = oldLastVisible = -1;
	            }
	        }

	        if (firstVisible < oldFirstVisible) {
	            renderedRows = that.renderRows(firstVisible, Math.min(lastVisible, oldFirstVisible - 1));
	            p.$tbody.prepend(renderedRows);
	        }
	        if (lastVisible > oldLastVisible || oldLastVisible === -1) {
	            renderedRows = that.renderRows(oldLastVisible === -1 ? firstVisible : oldLastVisible + 1, lastVisible);
	            p.$tbody.append(renderedRows);
	        }
	    }
	    this.trigger('render');
	    return this;
	};

	/**
	 * Forces a full render of the table
	 * @public
	 * @expose
	 * @param {Boolean=true} render - Should render now?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.clearAndRender = function (render) {
	    var p = this.p;

	    p.tableSkeletonNeedsRendering = true;

	    if (render === undefined || render) {
	        this.render();
	    }

	    return this;
	};

	/**
	 * Render rows
	 * @private
	 * @param {Number} first first row to render
	 * @param {Number} last last row to render
	 * @returns {DocumentFragment} fragment containing all rendered rows
	 */
	DGTable.prototype.renderRows = function (first, last) {
	    for (var that = this, o = that.o, p = that.p, tableClassName = o.tableClassName, rowClassName = tableClassName + '-row', cellClassName = tableClassName + '-cell', rows = p.filteredRows || p.rows, isDataFiltered = !!p.filteredRows, allowCellPreview = o.allowCellPreview, visibleColumns = p.visibleColumns, isVirtual = o.virtualTable, virtualRowHeightFirst = p.virtualRowHeightFirst, virtualRowHeight = p.virtualRowHeight, top, physicalRowIndex, colCount = visibleColumns.length, colIndex = 0, column; colIndex < colCount; colIndex++) {
	        column = visibleColumns[colIndex];
	        column._finalWidth = column.actualWidthConsideringScrollbarWidth || column.actualWidth;
	    }

	    for (var bodyFragment = document.createDocumentFragment(), isRtl = this._isTableRtl(), virtualRowXAttr = isRtl ? 'right' : 'left', i = first, rowCount = rows.length, rowData, row, cell, cellInner, content; i < rowCount && i <= last; i++) {

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
	            cell.setAttribute('data-column', column.name);
	            cell.className = cellClassName;
	            cell.style.width = column._finalWidth + 'px';
	            if (column.cellClasses) cell.className += ' ' + column.cellClasses;
	            if (allowCellPreview) {
	                p._bindCellHoverIn(cell);
	            }
	            cellInner = cell.appendChild(createElement('div'));

	            cellInner.innerHTML = this._getHtmlForCell(rowData, column);
	            row.appendChild(cell);
	        }

	        if (isVirtual) {
	            top = i > 0 ? virtualRowHeightFirst + (i - 1) * virtualRowHeight : 0;
	            row.style.position = 'absolute';
	            row.style[virtualRowXAttr] = 0;
	            row.style.top = top + 'px';
	        }

	        bodyFragment.appendChild(row);

	        that.trigger('rowcreate', i, physicalRowIndex, row, rowData);
	    }

	    return bodyFragment;
	};

	/**
	 * Calculate virtual table height for scrollbar
	 * @private
	 * @returns {DGTable} self
	 */
	DGTable.prototype._calculateVirtualHeight = function () {
	    var p = this.p;

	    if (p.tbody) {
	        var rowCount = (p.filteredRows || p.rows).length,
	            height = p.virtualRowHeight * rowCount;

	        if (rowCount) {
	            height += p.virtualRowHeightFirst - p.virtualRowHeight;
	            height += p.virtualRowHeightLast - p.virtualRowHeight;
	        }
	        // At least 1 pixel - to show scrollers correctly.
	        if (height < 1) {
	            height = 1;
	        }
	        p.tbody.style.height = height + 'px';
	    }
	    return this;
	};

	/**
	 * Calculate the size required for the table body width (which is the row's width)
	 * @private
	 * @returns {Number} calculated width
	 */
	DGTable.prototype._calculateTbodyWidth = function () {
	    var that = this,
	        p = that.p,
	        tableClassName = that.o.tableClassName,
	        rowClassName = tableClassName + '-row',
	        cellClassName = tableClassName + '-cell',
	        visibleColumns = p.visibleColumns,
	        colCount = visibleColumns.length,
	        cell,
	        cellInner,
	        colIndex,
	        column,
	        $row = $('<div>').addClass(rowClassName).css('float', 'left'),
	        sumActualWidth = 0;

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

	    var $thisWrapper = $('<div>').addClass(that.el.className).css({ "z-index": -1, position: 'absolute', left: '0', top: '-9999px', float: 'left', width: '1px', overflow: 'hidden' }).append($('<div>').addClass(tableClassName).append($('<div>').addClass(tableClassName + '-body').css('width', sumActualWidth + 10000).append($row)));

	    $thisWrapper.appendTo(document.body);

	    var fractionTest = $('<div style="border:1.5px solid #000;width:0;height:0;position:absolute;left:0;top:-9999px">').appendTo(document.body),
	        hasFractions = parseFloat(fractionTest.css('border-width'));

	    hasFractions = Math.round(hasFractions) != hasFractions;
	    fractionTest.remove();

	    var width = _css_util2['default'].outerWidth($row);
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
	 * @param {Boolean=true} render - Should render now?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setColumns = function (columns, render) {
	    var that = this,
	        p = that.p;

	    columns = columns || [];

	    for (var normalizedCols = new _column_collection2['default'](), i = 0, order = 0; i < columns.length; i++) {

	        var columnData = columns[i],
	            normalizedColumn = that._initColumnFromData(columnData);


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

	    that._ensureVisibleColumns().clearAndRender(render);

	    return that;
	};

	/**
	 * Add a column to the table
	 * @public
	 * @expose
	 * @param {COLUMN_OPTIONS} columnData column properties
	 * @param {String|Number} [before=-1] column name or order to be inserted before
	 * @param {Boolean=true} render - Should render now?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.addColumn = function (columnData, before, render) {
	    var that = this,
	        p = that.p,
	        columns = p.columns;


	    if (columnData && !columns.get(columnData.name)) {
	        var beforeColumn = null;
	        if (before !== undefined) {
	            beforeColumn = columns.get(before) || columns.getByOrder(before);
	        }

	        var column = this._initColumnFromData(columnData);
	        column.order = beforeColumn ? beforeColumn.order : columns.getMaxOrder() + 1;

	        for (var i = columns.getMaxOrder(), to = column.order, col; i >= to; i--) {
	            col = columns.getByOrder(i);
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
	 * @param {String} column column name
	 * @param {Boolean=true} render - Should render now?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.removeColumn = function (column, render) {
	    var that = this,
	        p = that.p,
	        columns = p.columns,
	        colIdx = columns.indexOf(column);

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
	 * @param {function(value: *, columnName: String, row: Object):String|null} [formatter=null] - The cell formatter. Should return an HTML.
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setCellFormatter = function (formatter) {
	    /**
	     * @private
	     * @field {Function} cellFormatter */
	    this.o.cellFormatter = formatter || function (val) {
	        return val;
	    };

	    return this;
	};

	/**
	 * Sets a new header cell formatter.
	 * @public
	 * @expose
	 * @param {function(label: String, columnName: String):String|null} [formatter=null] - The cell formatter. Should return an HTML.
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setHeaderCellFormatter = function (formatter) {
	    /**
	     * @private
	     * @field {Function} headerCellFormatter */
	    this.o.headerCellFormatter = formatter || function (val) {
	        return val;
	    };

	    return this;
	};

	/**
	 * @public
	 * @expose
	 * @param {function(row:Object,args:Object):Boolean|null} [filterFunc=null] - The filter function to work with filters. Default is a by-colum filter.
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
	    var that = this,
	        p = that.p,
	        filterFunc = that.o.filter || _by_column_filter2['default'];

	    // Deprecated use of older by-column filter
	    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
	        args = {
	            column: arguments[0],
	            keyword: arguments[1],
	            caseSensitive: arguments[2]
	        };
	    }

	    var hadFilter = !!p.filteredRows;
	    if (p.filteredRows) {
	        p.filteredRows = null; // Allow releasing array memory now
	    }

	    // Shallow-clone the args, as the filter function may want to modify it for keeping state
	    p.filterArgs = (typeof args === 'undefined' ? 'undefined' : _typeof(args)) === 'object' && !Array.isArray(args) ? $.extend({}, args) : args;
	    p.filteredRows = p.rows.filteredCollection(filterFunc, args);

	    if (hadFilter || p.filteredRows) {
	        this.clearAndRender();
	        this.trigger('filter', args);
	    }

	    return this;
	};

	/**
	 * @private
	 * @returns {DGTable} self
	 */
	DGTable.prototype._refilter = function () {
	    var that = this,
	        p = that.p;

	    if (p.filteredRows && p.filterArgs) {
	        var filterFunc = that.o.filter || _by_column_filter2['default'];
	        p.filteredRows = p.rows.filteredCollection(filterFunc, p.filterArgs);
	    }
	    return this;
	};

	/**
	 * Set a new label to a column
	 * @public
	 * @expose
	 * @param {String} column Name of the column
	 * @param {String} label New label for the column
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setColumnLabel = function (column, label) {
	    var that = this,
	        p = that.p,
	        col = p.columns.get(column);

	    if (col) {
	        col.label = label === undefined ? col.name : label;

	        if (col.element) {
	            for (var i = 0, node; i < col.element[0].firstChild.childNodes.length; i++) {
	                node = col.element[0].firstChild.childNodes[i];

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
	 * @param {String|Number} src Name or position of the column to be moved
	 * @param {String|Number} dest Name of the column currently in the desired position, or the position itself
	 * @returns {DGTable} self
	 */
	DGTable.prototype.moveColumn = function (src, dest) {
	    var that = this,
	        o = that.o,
	        p = that.p,
	        columns = p.columns,
	        col,
	        destCol;

	    if (typeof src === 'string') {
	        col = columns.get(src);
	    } else if (typeof src === 'number') {
	        col = p.visibleColumns[src];
	    }
	    if (typeof dest === 'string') {
	        destCol = columns.get(dest);
	    } else if (typeof dest === 'number') {
	        destCol = p.visibleColumns[dest];
	    }

	    if (col && destCol && src !== dest) {
	        var srcOrder = col.order,
	            destOrder = destCol.order;

	        p.visibleColumns = columns.moveColumn(col, destCol).getVisibleColumns();
	        this._ensureVisibleColumns();

	        if (o.virtualTable) {
	            this.clearAndRender()._updateLastCellWidthFromScrollbar(true);
	        } else {
	            var headerCell = p.$headerRow.find('>div.' + o.tableClassName + '-header-cell'),
	                beforePos = srcOrder < destOrder ? destOrder + 1 : destOrder,
	                fromPos = srcOrder;

	            headerCell[0].parentNode.insertBefore(headerCell[fromPos], headerCell[beforePos]);

	            var srcWidth = p.visibleColumns[srcOrder];
	            srcWidth = (srcWidth.actualWidthConsideringScrollbarWidth || srcWidth.actualWidth) + 'px';
	            var destWidth = p.visibleColumns[destOrder];
	            destWidth = (destWidth.actualWidthConsideringScrollbarWidth || destWidth.actualWidth) + 'px';

	            for (var tbodyChildren = p.$tbody[0].childNodes, i = 0, count = tbodyChildren.length, row; i < count; i++) {
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
	};

	/**
	 * Sort the table
	 * @public
	 * @expose
	 * @param {String?} column Name of the column to sort on (or null to remove sort arrow)
	 * @param {Boolean=} descending Sort in descending order
	 * @param {Boolean} [add=false] Should this sort be on top of the existing sort? (For multiple column sort)
	 * @returns {DGTable} self
	 */
	DGTable.prototype.sort = function (column, descending, add) {
	    var that = this,
	        o = that.o,
	        p = that.p,
	        columns = p.columns,
	        col = columns.get(column),
	        i,
	        currentSort = p.rows.sortColumn;

	    if (col) {

	        if (currentSort.length && currentSort[currentSort.length - 1].column == column) {
	            // Recognize current descending mode, if currently sorting by this column
	            descending = descending === undefined ? !currentSort[currentSort.length - 1].descending : descending;
	        }

	        if (add) {
	            // Add the sort to current sort stack

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
	            if (o.sortableColumns > 0 /* allow manual sort when disabled */ && currentSort.length >= o.sortableColumns || currentSort.length >= p.visibleColumns.length) {
	                currentSort.length = 0;
	            }
	        } else {
	            // Sort only by this column
	            currentSort.length = 0;
	        }

	        // Default to ascending
	        descending = descending === undefined ? false : descending;

	        // Set the required column in the front of the stack
	        currentSort.push({
	            column: col.name,
	            comparePath: col.comparePath,
	            descending: !!descending
	        });
	    } else {
	        currentSort.length = 0;
	    }

	    this._clearSortArrows();

	    for (i = 0; i < currentSort.length; i++) {
	        this._showSortArrow(currentSort[i].column, currentSort[i].descending);
	    }

	    if (o.adjustColumnWidthForSortArrow && !o._tableSkeletonNeedsRendering) {
	        this.tableWidthChanged(true);
	    }

	    if (o.virtualTable) {
	        while (p.tbody && p.tbody.firstChild) {
	            this.trigger('rowdestroy', p.tbody.firstChild);
	            this._unbindCellEventsForRow(p.tbody.firstChild);
	            p.tbody.removeChild(p.tbody.firstChild);
	        }
	    } else {
	        p.tableSkeletonNeedsRendering = true;
	    }

	    p.rows.sortColumn = currentSort;

	    if (currentSort.length) {
	        p.rows.sort(!!p.filteredRows);
	        if (p.filteredRows) {
	            p.filteredRows.sort(!!p.filteredRows);
	        }
	    }

	    // Build output for event, with option names that will survive compilers
	    var sorts = [];
	    for (i = 0; i < currentSort.length; i++) {
	        sorts.push({ column: currentSort[i].column, descending: currentSort[i].descending });
	    }
	    this.trigger('sort', sorts);

	    return this;
	};

	/**
	 * Re-sort the table using current sort specifiers
	 * @public
	 * @expose
	 * @returns {DGTable} self
	 */
	DGTable.prototype.resort = function () {
	    var that = this,
	        p = that.p,
	        columns = p.columns,
	        currentSort = p.rows.sortColumn;

	    if (currentSort.length) {

	        for (var i = 0; i < currentSort.length; i++) {
	            if (!columns.get(currentSort[i].column)) {
	                currentSort.splice(i--, 1);
	            }
	        }

	        p.rows.sortColumn = currentSort;
	        if (currentSort.length) {
	            p.rows.sort(!!p.filteredRows);
	            if (p.filteredRows) {
	                p.filteredRows.sort(!!p.filteredRows);
	            }
	        }

	        // Build output for event, with option names that will survive compilers
	        var sorts = [];
	        for (i = 0; i < currentSort.length; i++) {
	            sorts.push({ column: currentSort[i].column, descending: currentSort[i].descending });
	        }
	        this.trigger('sort', sorts);
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
	    var that = this,
	        p = that.p;

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
	 * @param {String} column Unique column name
	 * @param {Boolean} visible New visibility mode for the column
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setColumnVisible = function (column, visible) {
	    var that = this,
	        p = that.p,
	        col = p.columns.get(column);

	    //noinspection PointlessBooleanExpressionJS
	    visible = !!visible;

	    if (col && !!col.visible != visible) {
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
	 * @returns {Boolean} true if visible
	 */
	DGTable.prototype.isColumnVisible = function (column) {
	    var that = this,
	        p = that.p,
	        col = p.columns.get(column);

	    if (col) {
	        return col.visible;
	    }
	    return false;
	};

	/**
	 * Globally set the minimum column width
	 * @public
	 * @expose
	 * @param {Number} minColumnWidth Minimum column width
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setMinColumnWidth = function (minColumnWidth) {
	    var o = this.o;
	    minColumnWidth = Math.max(minColumnWidth, 0);
	    if (o.minColumnWidth != minColumnWidth) {
	        o.minColumnWidth = minColumnWidth;
	        this.tableWidthChanged(true);
	    }
	    return this;
	};

	/**
	 * Get the current minimum column width
	 * @public
	 * @expose
	 * @returns {Number} Minimum column width
	 */
	DGTable.prototype.getMinColumnWidth = function () {
	    return this.o.minColumnWidth;
	};

	/**
	 * Set the limit on concurrent columns sorted
	 * @public
	 * @expose
	 * @param {Number} sortableColumns How many sortable columns to allow?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setSortableColumns = function (sortableColumns) {
	    var o = this.o;
	    if (o.sortableColumns != sortableColumns) {
	        o.sortableColumns = sortableColumns;
	        if (p.$table) {
	            for (var headerCell = p.$headerRow.find('>div.' + o.tableClassName + '-header-cell'), i = 0; i < headerCell.length; i++) {
	                $(headerCell[0])[o.sortableColumns > 0 && p.visibleColumns[i].sortable ? 'addClass' : 'removeClass']('sortable');
	            }
	        }
	    }
	    return this;
	};

	/**
	 * Get the limit on concurrent columns sorted
	 * @public
	 * @expose
	 * @returns {Number} How many sortable columns are allowed?
	 */
	DGTable.prototype.getSortableColumns = function () {
	    return this.o.sortableColumns;
	};

	/**
	 * @public
	 * @expose
	 * @param {Boolean?} movableColumns=true are the columns movable?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setMovableColumns = function (movableColumns) {
	    var o = this.o;
	    //noinspection PointlessBooleanExpressionJS
	    movableColumns = movableColumns === undefined ? true : !!movableColumns;
	    if (o.movableColumns != movableColumns) {
	        o.movableColumns = movableColumns;
	    }
	    return this;
	};

	/**
	 * @public
	 * @expose
	 * @returns {Boolean} are the columns movable?
	 */
	DGTable.prototype.getMovableColumns = function () {
	    return this.o.movableColumns;
	};

	/**
	 * @public
	 * @expose
	 * @param {Boolean} resizableColumns=true are the columns resizable?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setResizableColumns = function (resizableColumns) {
	    var o = this.o;
	    //noinspection PointlessBooleanExpressionJS
	    resizableColumns = resizableColumns === undefined ? true : !!resizableColumns;
	    if (o.resizableColumns != resizableColumns) {
	        o.resizableColumns = resizableColumns;
	    }
	    return this;
	};

	/**
	 * @public
	 * @expose
	 * @returns {Boolean} are the columns resizable?
	 */
	DGTable.prototype.getResizableColumns = function () {
	    return this.o.resizableColumns;
	};

	/**
	 * @public
	 * @expose
	 * @param {{function(string,boolean):{function(a:*,b:*):boolean}}} comparatorCallback a callback function that returns the comparator for a specific column
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setComparatorCallback = function (comparatorCallback) {
	    var o = this.o;
	    if (o.onComparatorRequired != comparatorCallback) {
	        o.onComparatorRequired = comparatorCallback;
	    }
	    return this;
	};

	/**
	 * Set a new width to a column
	 * @public
	 * @expose
	 * @param {String} column name of the column to resize
	 * @param {Number|String} width new column as pixels, or relative size (0.5, 50%)
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setColumnWidth = function (column, width) {

	    var that = this,
	        p = that.p,
	        col = p.columns.get(column),
	        parsedWidth = this._parseColumnWidth(width, col.ignoreMin ? 0 : this.o.minColumnWidth);

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
	};

	/**
	 * @public
	 * @expose
	 * @param {String} column name of the column
	 * @returns {String|null} the serialized width of the specified column, or null if column not found
	 */
	DGTable.prototype.getColumnWidth = function (column) {
	    var that = this,
	        p = that.p,
	        col = p.columns.get(column);

	    if (col) {
	        return this._serializeColumnWidth(col);
	    }
	    return null;
	};

	/**
	 * @public
	 * @expose
	 * @param {String} column name of the column
	 * @returns {SERIALIZED_COLUMN|null} configuration for all columns
	 */
	DGTable.prototype.getColumnConfig = function (column) {
	    var that = this,
	        p = that.p,
	        col = p.columns.get(column);

	    if (col) {
	        return {
	            order: col.order,
	            width: this._serializeColumnWidth(col),
	            visible: col.visible,
	            label: col.label
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
	    for (var that = this, p = that.p, config = {}, i = 0; i < p.columns.length; i++) {
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
	    for (var that = this, p = that.p, sorted = [], i = 0, sort; i < p.rows.sortColumn.length; i++) {
	        sort = p.rows.sortColumn[i];
	        sorted.push({ column: sort.column, descending: sort.descending });
	    }
	    return sorted;
	};

	/**
	 * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
	 * @public
	 * @expose
	 * @param {Number} row - index of the row
	 * @param {String} columnName - name of the column
	 * @returns {String} HTML string for the specified cell
	 */
	DGTable.prototype.getHtmlForCell = function (row, columnName) {
	    var that = this,
	        p = that.p;

	    if (row < 0 || row > p.rows.length - 1) return null;
	    var column = p.columns.get(columnName);
	    if (!column) return null;

	    for (var rowData = p.rows[row], dataPath = column.dataPath, colValue = rowData[dataPath[0]], dataPathIndex = 1; dataPathIndex < dataPath.length; dataPathIndex++) {
	        colValue = colValue[dataPath[dataPathIndex]];
	    }

	    var content = this.o.cellFormatter(colValue, column.name, rowData);
	    if (content === undefined) {
	        content = '';
	    }
	    return content;
	};

	/**
	 * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
	 * @public
	 * @expose
	 * @param {Object} rowData - row data
	 * @param {Object} column - column data
	 * @returns {String} HTML string for the specified cell
	 */
	DGTable.prototype._getHtmlForCell = function (rowData, column) {
	    for (var that = this, dataPath = column.dataPath, colValue = rowData[dataPath[0]], dataPathIndex = 1; dataPathIndex < dataPath.length; dataPathIndex++) {
	        if (colValue == null) break;
	        colValue = colValue && colValue[dataPath[dataPathIndex]];
	    }

	    var content = this.o.cellFormatter(colValue, column.name, rowData);
	    if (content === undefined) {
	        content = '';
	    }

	    return content;
	};

	/**
	 * Returns the y pos of a row by index
	 * @public
	 * @expose
	 * @param {Number} rowIndex - index of the row
	 * @returns {Number|null} Y pos
	 */
	DGTable.prototype.getRowYPos = function (rowIndex) {
	    var that = this,
	        p = that.p;

	    if (that.o.virtualTable) {
	        return rowIndex > 0 ? p.virtualRowHeightFirst + (rowIndex - 1) * p.virtualRowHeight : 0;
	    } else {
	        var row = p.tbody.childNodes[rowIndex];
	        return row ? row.offsetTop : null;
	    }
	};

	/**
	 * Returns the row data for a specific row
	 * @public
	 * @expose
	 * @param {Number} row index of the row
	 * @returns {Object} Row data
	 */
	DGTable.prototype.getDataForRow = function (row) {
	    var that = this,
	        p = that.p;

	    if (row < 0 || row > p.rows.length - 1) return null;
	    return p.rows[row];
	};

	/**
	 * Gets the number of rows
	 * @public
	 * @expose
	 * @returns {Number} Row count
	 */
	DGTable.prototype.getRowCount = function () {
	    var that = this,
	        p = that.p;
	    return p.rows ? p.rows.length : 0;
	};

	/**
	 * Returns the physical row index for specific row
	 * @public
	 * @expose
	 * @param {Object} rowData - Row data to find
	 * @returns {Number} Row index
	 */
	DGTable.prototype.getIndexForRow = function (rowData) {
	    var that = this,
	        p = that.p;
	    return p.rows.indexOf(rowData);
	};

	/**
	 * Gets the number of filtered rows
	 * @public
	 * @expose
	 * @returns {Number} Filtered row count
	 */
	DGTable.prototype.getFilteredRowCount = function () {
	    var that = this,
	        p = that.p;
	    return (p.filteredRows || p.rows).length;
	};

	/**
	 * Returns the filtered row index for specific row
	 * @public
	 * @expose
	 * @param {Object} rowData - Row data to find
	 * @returns {Number} Row index
	 */
	DGTable.prototype.getIndexForFilteredRow = function (rowData) {
	    var that = this,
	        p = that.p;
	    return (p.filteredRows || p.rows).indexOf(rowData);
	};

	/**
	 * Returns the row data for a specific row
	 * @public
	 * @expose
	 * @param {Number} row index of the filtered row
	 * @returns {Object} Row data
	 */
	DGTable.prototype.getDataForFilteredRow = function (row) {
	    var that = this,
	        p = that.p;
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
	 * @returns {Number} width
	 */
	DGTable.prototype._horizontalPadding = function (el) {
	    return (parseFloat($.css(el, 'padding-left')) || 0) + (parseFloat($.css(el, 'padding-right')) || 0);
	};

	/**
	 * @private
	 * @param {Element} el
	 * @returns {Number} width
	 */
	DGTable.prototype._horizontalBorderWidth = function (el) {
	    return (parseFloat($.css(el, 'border-left')) || 0) + (parseFloat($.css(el, 'border-right')) || 0);
	};

	/**
	 * @private
	 * @returns {Number} width
	 */
	DGTable.prototype._calculateWidthAvailableForColumns = function () {
	    var that = this,
	        o = that.o,
	        p = that.p,
	        oldDisplay,
	        lastScrollTop,
	        lastScrollLeft;

	    // Changing display mode briefly, to prevent taking in account the  parent's scrollbar width when we are the cause for it

	    if (p.$table) {
	        lastScrollTop = p.table ? p.table.scrollTop : 0;
	        lastScrollLeft = p.table ? p.table.scrollLeft : 0;

	        if (o.virtualTable) {
	            oldDisplay = p.$table[0].style.display;
	            p.$table[0].style.display = 'none';
	        }
	    }

	    var detectedWidth = _css_util2['default'].width(this.$el);

	    if (p.$table) {
	        if (o.virtualTable) {
	            p.$table[0].style.display = oldDisplay;
	        }

	        p.table.scrollTop = lastScrollTop;
	        p.table.scrollLeft = lastScrollLeft;
	        p.header.scrollLeft = lastScrollLeft;
	    }

	    for (var tableClassName = o.tableClassName, $thisWrapper = $('<div>').addClass(that.el.className).css({ "z-index": -1, position: 'absolute', left: '0', top: '-9999px' }), $header = $('<div>').addClass(tableClassName + '-header').appendTo($thisWrapper), $headerRow = $('<div>').addClass(tableClassName + '-header-row').appendTo($header), i = 0; i < p.visibleColumns.length; i++) {
	        $headerRow.append($('<div><div></div></div>').addClass(tableClassName + '-header-cell').addClass(p.visibleColumns[i].cellClasses || ''));
	    }
	    $thisWrapper.appendTo(document.body);

	    detectedWidth -= this._horizontalBorderWidth($headerRow[0]);

	    for (var $cells = $headerRow.find('>div.' + tableClassName + '-header-cell'), i = 0, $cell; i < $cells.length; i++) {
	        $cell = $($cells[i]);

	        var isBoxing = $cell.css('boxSizing') === 'border-box';
	        if (!isBoxing) {
	            detectedWidth -= (parseFloat($cell.css('border-right-width')) || 0) + (parseFloat($cell.css('border-left-width')) || 0) + this._horizontalPadding($cell[0]); // CELL's padding
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
	DGTable.prototype.tableWidthChanged = function () {

	    var getTextWidth = function getTextWidth(text) {
	        var tableClassName = this.o.tableClassName,
	            $cell,
	            $tableWrapper = $('<div>').addClass(this.$el).append($('<div>').addClass(tableClassName + '-header').append($('<div>').addClass(tableClassName + '-header-row').append($cell = $('<div>').addClass(tableClassName + '-header-cell').append($('<div>').text(text))))).css({ position: 'absolute', top: '-9999px', visibility: 'hidden' });

	        $tableWrapper.appendTo(document.body);

	        var width = _css_util2['default'].width($cell);

	        $tableWrapper.remove();

	        return width;
	    },
	        lastDetectedWidth = null;

	    /**
	     * @public
	     * @expose
	     * @param {Boolean} [forceUpdate=false]
	     * @param {Boolean} [renderColumns=true]
	     * @returns {DGTable} self
	     */
	    return function (forceUpdate, renderColumns) {

	        var that = this,
	            o = that.o,
	            p = that.p,
	            detectedWidth = this._calculateWidthAvailableForColumns(),
	            sizeLeft = detectedWidth,
	            relatives = 0;

	        renderColumns = renderColumns === undefined || renderColumns;

	        var tableWidthBeforeCalculations = 0;

	        if (!p.tbody) {
	            renderColumns = false;
	        }

	        if (renderColumns) {
	            tableWidthBeforeCalculations = parseFloat(p.tbody.style.minWidth) || 0;
	        }

	        if (sizeLeft != lastDetectedWidth || forceUpdate) {
	            lastDetectedWidth = detectedWidth;

	            var width,
	                absWidthTotal = 0,
	                changedColumnIndexes = [],
	                i,
	                col,
	                totalRelativePercentage = 0;

	            for (i = 0; i < p.columns.length; i++) {
	                p.columns[i].actualWidthConsideringScrollbarWidth = null;
	            }

	            for (i = 0; i < p.visibleColumns.length; i++) {
	                col = p.visibleColumns[i];
	                if (col.widthMode === ColumnWidthMode.ABSOLUTE) {
	                    width = col.width;
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
	                    width = getTextWidth.call(this, col.label) + 20;
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
	                for (i = 0; i < p.visibleColumns.length; i++) {
	                    col = p.visibleColumns[i];
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
	            if (relatives && (totalRelativePercentage < 1 && o.relativeWidthGrowsToFillWidth || totalRelativePercentage > 1 && o.relativeWidthShrinksToFillWidth)) {
	                for (i = 0; i < p.visibleColumns.length; i++) {
	                    col = p.visibleColumns[i];
	                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
	                        col.width /= totalRelativePercentage;
	                    }
	                }
	            }

	            var sizeLeftForRelative = Math.max(0, sizeLeft); // Use this as the space to take the relative widths out of
	            if (sizeLeftForRelative === 0) {
	                sizeLeftForRelative = p.table.clientWidth;
	            }

	            var minColumnWidthRelative = o.minColumnWidth / sizeLeftForRelative;
	            if (isNaN(minColumnWidthRelative)) {
	                minColumnWidthRelative = 0;
	            }
	            if (minColumnWidthRelative > 0) {
	                var extraRelative = 0,
	                    delta;

	                // First pass - make sure they are all constrained to the minimum width
	                for (i = 0; i < p.visibleColumns.length; i++) {
	                    col = p.visibleColumns[i];
	                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
	                        if (!col.ignoreMin && col.width < minColumnWidthRelative) {
	                            extraRelative += minColumnWidthRelative - col.width;
	                            col.width = minColumnWidthRelative;
	                        }
	                    }
	                }

	                // Second pass - try to take the extra width out of the other columns to compensate
	                for (i = 0; i < p.visibleColumns.length; i++) {
	                    col = p.visibleColumns[i];
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
	                var nonResizableTotal = 0,
	                    sizeLeftToFill = sizeLeft;


	                for (i = 0; i < p.visibleColumns.length; i++) {
	                    col = p.visibleColumns[i];
	                    if (!col.resizable && col.widthMode === ColumnWidthMode.ABSOLUTE) nonResizableTotal += col.width;

	                    if (col.widthMode === ColumnWidthMode.RELATIVE) sizeLeftToFill -= Math.round(sizeLeftForRelative * col.width);
	                }

	                var conv = (detectedWidth - nonResizableTotal) / (detectedWidth - sizeLeftToFill - nonResizableTotal) || NaN;
	                for (i = 0; i < p.visibleColumns.length && sizeLeftToFill > 0; i++) {
	                    col = p.visibleColumns[i];
	                    if (!col.resizable && col.widthMode === ColumnWidthMode.ABSOLUTE) continue;

	                    if (col.widthMode === ColumnWidthMode.RELATIVE) {
	                        col.width *= conv;
	                    } else {
	                        var width = col.actualWidth * conv;
	                        if (col.actualWidth !== width) {
	                            col.actualWidth = width;
	                            if (changedColumnIndexes.indexOf(i) === -1) changedColumnIndexes.push(i);
	                        }
	                    }
	                }
	            }

	            // Materialize relative sizes
	            for (i = 0; i < p.visibleColumns.length; i++) {
	                col = p.visibleColumns[i];
	                if (col.widthMode === ColumnWidthMode.RELATIVE) {
	                    width = Math.round(sizeLeftForRelative * col.width);
	                    sizeLeft -= width;
	                    relatives--;

	                    // Take care of rounding errors
	                    if (relatives === 0 && sizeLeft === 1) {
	                        // Take care of rounding errors
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
	                p.visibleColumns[p.visibleColumns.length - 1].actualWidthConsideringScrollbarWidth = p.visibleColumns[p.visibleColumns.length - 1].actualWidth - (p.scrollbarWidth || 0);
	            }

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
	}();

	/**
	 * Notify the table that its height has changed
	 * @public
	 * @expose
	 * @returns {DGTable} self
	 */
	DGTable.prototype.tableHeightChanged = function () {
	    var that = this,
	        o = that.o,
	        p = that.p;

	    if (!p.$table) {
	        return that;
	    }

	    var height = _css_util2['default'].innerHeight(that.$el) - (parseFloat(p.$table.css('border-top-width')) || 0) // Subtract top border of inner element
	    - (parseFloat(p.$table.css('border-bottom-width')) || 0); // Subtract bottom border of inner element

	    if (height != o.height) {

	        o.height = height;

	        if (p.tbody) {
	            // At least 1 pixel - to show scrollers correctly.
	            p.tbody.style.height = Math.max(o.height - _css_util2['default'].outerHeight(p.$headerRow), 1) + 'px';
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
	 * @param {Number} [at=-1] - where to add the rows at
	 * @param {Boolean} [resort=false] - should resort all rows?
	 * @param {Boolean} [render=true]
	 * @returns {DGTable} self
	 */
	DGTable.prototype.addRows = function (data, at, resort, render) {
	    var that = this,
	        p = that.p;

	    if (typeof at === 'boolean') {
	        render = resort;
	        resort = at;
	        at = -1;
	    }

	    if (typeof at !== 'number') at = -1;

	    if (at < 0 || at > p.rows.length) at = p.rows.length;

	    render = render === undefined ? true : !!render;

	    if (data) {
	        p.rows.add(data, at);

	        if (p.filteredRows || resort && p.rows.sortColumn.length) {

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
	            var childNodes = p.tbody.childNodes;

	            if (that.o.virtualTable) {

	                while (p.tbody.firstChild) {
	                    this.trigger('rowdestroy', p.tbody.firstChild);
	                    this._unbindCellEventsForRow(p.tbody.firstChild);
	                    p.tbody.removeChild(p.tbody.firstChild);
	                }

	                this._calculateVirtualHeight() // Calculate virtual height
	                ._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height
	                .render()._updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar
	            } else if (p.$tbody) {

	                var firstRow = at,
	                    lastRow = at + data.length - 1,
	                    renderedRows = that.renderRows(firstRow, lastRow);

	                p.tbody.insertBefore(renderedRows, childNodes[at] || null);

	                for (var i = lastRow + 1, row; i < childNodes.length; i++) {
	                    row = childNodes[i];

	                    row['rowIndex'] += data.length;
	                    row['physicalRowIndex'] += data.length;
	                }

	                this.render()._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height, and update existing last cells
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
	 * @param {Number} physicalRowIndex - index
	 * @param {Number} count - how many rows to remove
	 * @param {Boolean=true} render
	 * @returns {DGTable} self
	 */
	DGTable.prototype.removeRows = function (physicalRowIndex, count, render) {
	    var that = this,
	        p = that.p;

	    if (typeof count !== 'number' || count <= 0) return this;

	    if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return this;

	    p.rows.splice(physicalRowIndex, count);
	    render = render === undefined ? true : !!render;

	    if (p.filteredRows) {

	        this._refilter();

	        p.tableSkeletonNeedsRendering = true;

	        if (render) {
	            // Render the skeleton with all rows from scratch
	            this.render();
	        }
	    } else if (render) {

	        var childNodes = p.tbody.childNodes;

	        if (this.o.virtualTable) {

	            while (p.tbody.firstChild) {
	                this.trigger('rowdestroy', p.tbody.firstChild);
	                this._unbindCellEventsForRow(p.tbody.firstChild);
	                p.tbody.removeChild(p.tbody.firstChild);
	            }

	            this._calculateVirtualHeight()._updateLastCellWidthFromScrollbar().render()._updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar

	        } else {

	            for (var countRemoved = 0, lastRowIndex = physicalRowIndex + count - 1, i = 0; i < childNodes.length; i++) {
	                var row = childNodes[i],
	                    index = row['physicalRowIndex'];


	                if (index >= physicalRowIndex) {
	                    if (index <= lastRowIndex) {
	                        this.trigger('rowdestroy', row);
	                        this._unbindCellEventsForRow(row);
	                        p.tbody.removeChild(row);
	                        i--;
	                    } else {
	                        row['physicalRowIndex'] -= count;
	                    }
	                } else {
	                    row['rowIndex'] = i;
	                }
	            }

	            this.render()._updateLastCellWidthFromScrollbar()._updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar
	        }
	    }

	    return this;
	};

	/**
	 * Removes a row from the table
	 * @public
	 * @expose
	 * @param {Number} physicalRowIndex - index
	 * @param {Boolean=true} render
	 * @returns {DGTable} self
	 */
	DGTable.prototype.removeRow = function (physicalRowIndex, render) {
	    return this.removeRows(physicalRowIndex, 1, render);
	};

	/**
	 * Refreshes the row specified
	 * @public
	 * @expose
	 * @param {Number} physicalRowIndex index
	 * @returns {DGTable} self
	 */
	DGTable.prototype.refreshRow = function (physicalRowIndex) {
	    var that = this,
	        p = that.p;

	    if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return this;

	    // Find out if the row is in the rendered dataset
	    var rowIndex = -1;
	    if (p.filteredRows && (rowIndex = (0, _util.indexOf)(p.filteredRows, p.rows[physicalRowIndex])) === -1) return this;

	    if (rowIndex === -1) {
	        rowIndex = physicalRowIndex;
	    }

	    var childNodes = p.tbody.childNodes;

	    if (this.o.virtualTable) {
	        for (var isRowVisible = false, i = 0; i < childNodes.length; i++) {
	            if (childNodes[i]['physicalRowIndex'] === physicalRowIndex) {
	                isRowVisible = true;
	                this.trigger('rowdestroy', childNodes[i]);
	                this._unbindCellEventsForRow(childNodes[i]);
	                p.tbody.removeChild(childNodes[i]);
	                break;
	            }
	        }
	        // Now make sure that the row actually rendered, as this is a virtual table

	        if (isRowVisible) {
	            var renderedRow = this.renderRows(rowIndex, rowIndex);
	            p.tbody.insertBefore(renderedRow, childNodes[i] || null);
	        }
	    } else {
	        this.trigger('rowdestroy', childNodes[rowIndex]);
	        this._unbindCellEventsForRow(childNodes[rowIndex]);
	        p.tbody.removeChild(childNodes[rowIndex]);
	        var renderedRow = this.renderRows(rowIndex, rowIndex);
	        p.tbody.insertBefore(renderedRow, childNodes[rowIndex] || null);
	    }

	    return this;
	};

	/**
	 * Get the DOM element for the specified row, if it exists
	 * @public
	 * @expose
	 * @param {Number} physicalRowIndex index
	 * @returns {Element?} row or null
	 */
	DGTable.prototype.getRowElement = function (physicalRowIndex) {
	    var that = this,
	        p = that.p;

	    if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return null;

	    // Find out if the row is in the rendered dataset
	    var rowIndex = -1;
	    if (p.filteredRows && (rowIndex = (0, _util.indexOf)(p.filteredRows, p.rows[physicalRowIndex])) === -1) return this;

	    if (rowIndex === -1) {
	        rowIndex = physicalRowIndex;
	    }

	    var childNodes = p.tbody.childNodes;

	    if (this.o.virtualTable) {
	        // Now make sure that the row actually rendered, as this is a virtual table
	        for (var i = 0; i < childNodes.length; i++) {
	            if (childNodes[i]['physicalRowIndex'] === physicalRowIndex) {
	                return childNodes[i];
	            }
	        }
	    } else {
	        return childNodes[rowIndex];
	    }

	    return null;
	};

	/**
	 * Refreshes all virtual rows
	 * @public
	 * @expose
	 * @returns {DGTable} self
	 */
	DGTable.prototype.refreshAllVirtualRows = function () {

	    var that = this,
	        p = that.p;

	    if (this.o.virtualTable) {
	        for (var rowsToRender = [], childNodes = p.tbody.childNodes, i = 0, rowCount = childNodes.length; i < rowCount; i++) {
	            rowsToRender.push(childNodes[i]['physicalRowIndex']);
	            this.trigger('rowdestroy', childNodes[i]);
	            this._unbindCellEventsForRow(childNodes[i]);
	            p.tbody.removeChild(childNodes[i]);
	            i--;
	            rowCount--;
	        }
	        // Now make sure that the row actually rendered, as this is a virtual table

	        for (var i = 0, renderedRow; i < rowsToRender.length; i++) {
	            renderedRow = this.renderRows(rowsToRender[i], rowsToRender[i]);

	            p.tbody.appendChild(renderedRow);
	        }
	    }

	    return this;
	};

	/**
	 * Replace the whole dataset
	 * @public
	 * @expose
	 * @param {Object[]} data array of rows to add to the table
	 * @param {Boolean} [resort=false] should resort all rows?
	 * @returns {DGTable} self
	 */
	DGTable.prototype.setRows = function (data, resort) {
	    var that = this,
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
	 * @returns {String|null} the url, or null if not supported
	 */
	DGTable.prototype.getUrlForElementContent = function (id) {
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
	};

	/**
	 * @public
	 * @expose
	 * @returns {Boolean} A value indicating whether Web Workers are supported
	 */
	DGTable.prototype.isWorkerSupported = function () {
	    return global['Worker'] instanceof Function;
	};

	/**
	 * Creates a Web Worker for updating the table.
	 * @public
	 * @expose
	 * @param {string} url Url to the script for the Web Worker
	 * @param {Boolean=true} start if true, starts the Worker immediately
	 * @returns {Worker?} the Web Worker, or null if not supported
	 */
	DGTable.prototype.createWebWorker = function (url, start, resort) {
	    if (this.isWorkerSupported()) {
	        var that = this,
	            p = that.p,
	            worker = new Worker(url),
	            listener = function listener(evt) {
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
	    var that = this,
	        p = that.p;

	    if (p.workerListeners) {
	        for (var j = 0; j < p.workerListeners.length; j++) {
	            if (p.workerListeners[j].worker == worker) {
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
	DGTable.prototype.abortCellPreview = function () {
	    this.hideCellPreview();
	    return this;
	};

	/**
	 * Cancel a resize in progress
	 * @expose
	 * @private
	 * @returns {DGTable} self
	 */
	DGTable.prototype.cancelColumnResize = function () {
	    var that = this,
	        p = that.p;

	    if (p.$resizer) {
	        p.$resizer.remove();
	        p.$resizer = null;
	        $(document).off('mousemove.dgtable', p.onMouseMoveResizeAreaBound).off('mouseup.dgtable', p.onEndDragColumnHeaderBound);
	    }

	    return this;
	};

	/**
	 * @param {jQuery_Event} event
	 */
	DGTable.prototype._onVirtualTableScrolled = function (event) {
	    this.render();
	};

	/**
	 * @param {jQuery_Event} event
	 */
	DGTable.prototype._onTableScrolledHorizontally = function (event) {
	    var that = this,
	        p = that.p;

	    p.header.scrollLeft = p.table.scrollLeft;
	};

	/**previousElementSibling
	 * Reverse-calculate the column to resize from mouse position
	 * @private
	 * @param {jQuery_Event} e jQuery mouse event
	 * @returns {String} name of the column which the mouse is over, or null if the mouse is not in resize position
	 */
	DGTable.prototype._getColumnByResizePosition = function (e) {

	    var that = this,
	        o = that.o,
	        p = that.p,
	        rtl = this._isTableRtl(),
	        $headerCell = $(e.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName),
	        headerCell = $headerCell[0];

	    if (headerCell['__cell']) {
	        headerCell = headerCell['__cell'];
	        $headerCell = $(headerCell);
	    }

	    var previousElementSibling = $headerCell[0].previousSibling;
	    while (previousElementSibling && previousElementSibling.nodeType != 1) {
	        previousElementSibling = previousElementSibling.previousSibling;
	    }

	    var firstCol = !previousElementSibling,
	        mouseX = ((e.pageX != null ? e.pageX : e.originalEvent.pageX) || e.originalEvent.clientX) - $headerCell.offset().left;

	    if (rtl) {
	        if (!firstCol && _css_util2['default'].outerWidth($headerCell) - mouseX <= o.resizeAreaWidth / 2) {
	            return previousElementSibling['columnName'];
	        } else if (mouseX <= o.resizeAreaWidth / 2) {
	            return headerCell['columnName'];
	        }
	    } else {
	        if (!firstCol && mouseX <= o.resizeAreaWidth / 2) {
	            return previousElementSibling['columnName'];
	        } else if (_css_util2['default'].outerWidth($headerCell) - mouseX <= o.resizeAreaWidth / 2) {
	            return headerCell['columnName'];
	        }
	    }

	    return null;
	};

	/**
	 * @param {jQuery_Event} event
	 */
	DGTable.prototype._onTouchStartColumnHeader = function (event) {
	    var that = this,
	        p = that.p;

	    if (p.currentTouchId) return;

	    var startTouch = event.originalEvent.changedTouches[0];
	    p.currentTouchId = startTouch.identifier;

	    var $eventTarget = $(event.currentTarget),
	        startPos = { x: startTouch.pageX, y: startTouch.pageY },
	        currentPos = startPos,
	        distanceTreshold = 9,
	        unbind = function unbind() {
	        p.currentTouchId = null;
	        $eventTarget.off('touchend').off('touchcancel');
	        clearTimeout(tapAndHoldTimeout);
	    },
	        fakeEvent = function fakeEvent(name) {
	        var fakeEvent = $.Event(name),
	            extendObjects = Array.prototype.slice.call(arguments, 1);

	        $.each(['target', 'clientX', 'clientY', 'offsetX', 'offsetY', 'screenX', 'screenY', 'pageX', 'pageY', 'which'], function () {
	            fakeEvent[this] = event[this];
	            for (var i = 0; i < extendObjects.length; i++) {
	                if (extendObjects[i][this] != null) {
	                    fakeEvent[this] = extendObjects[i][this];
	                }
	            }
	        });
	        return fakeEvent;
	    };

	    $eventTarget.trigger(fakeEvent('mousedown', event.originalEvent.changedTouches[0], { which: 1 }));

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
	            that.cancelColumnResize();
	            $eventTarget.trigger(fakeEvent('mouseup', event.originalEvent.changedTouches[0], { which: 3 }));
	        }
	    }, 500);

	    $eventTarget.on('touchend', function (event) {
	        var touch = (0, _util.find)(event.originalEvent.changedTouches, function (touch) {
	            return touch.identifier === p.currentTouchId;
	        });
	        if (!touch) return;

	        unbind();

	        event.preventDefault(); // Prevent simulated mouse events

	        currentPos = { x: touch.pageX, y: touch.pageY };
	        var distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

	        if (distanceTravelled < distanceTreshold || p.$resizer) {
	            $eventTarget.trigger(fakeEvent('mouseup', touch, { which: 1 }));
	            $eventTarget.trigger(fakeEvent('click', touch, { which: 1 }));
	        }
	    }).on('touchcancel', function () {
	        unbind();
	    }).on('touchmove', function (event) {
	        var touch = (0, _util.find)(event.originalEvent.changedTouches, function (touch) {
	            return touch.identifier === p.currentTouchId;
	        });
	        if (!touch) return;

	        // Keep track of current position, so we know if we need to cancel the tap-and-hold
	        currentPos = { x: touch.pageX, y: touch.pageY };

	        if (p.$resizer) {
	            event.preventDefault();

	            $eventTarget.trigger(fakeEvent('mousemove', touch));
	        }
	    });
	};

	/**
	 * @param {jQuery_Event} e event
	 */
	DGTable.prototype._onMouseDownColumnHeader = function (event) {
	    if (event.which !== 1) return this; // Only treat left-clicks

	    var that = this,
	        o = that.o,
	        p = that.p,
	        col = this._getColumnByResizePosition(event);

	    if (col) {
	        var column = p.columns.get(col);
	        if (!o.resizableColumns || !column || !column.resizable) {
	            return false;
	        }

	        var rtl = this._isTableRtl();

	        if (p.$resizer) {
	            $(p.$resizer).remove();
	        }
	        p.$resizer = $('<div></div>').addClass(o.resizerClassName).css({
	            position: 'absolute',
	            display: 'block',
	            "z-index": -1,
	            visibility: 'hidden',
	            width: '2px',
	            background: '#000',
	            opacity: 0.7
	        }).appendTo(this.$el);

	        var selectedHeaderCell = column.element,
	            commonAncestor = p.$resizer.parent(),
	            posCol = selectedHeaderCell.offset(),
	            posRelative = commonAncestor.offset();

	        if (ieVersion === 8) {
	            posCol = selectedHeaderCell.offset(); // IE8 bug, first time it receives zeros...
	        }
	        posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
	        posRelative.top += parseFloat(commonAncestor.css('border-top-width')) || 0;
	        posCol.left -= posRelative.left;
	        posCol.top -= posRelative.top;
	        posCol.top -= parseFloat(selectedHeaderCell.css('border-top-width')) || 0;
	        var resizerWidth = _css_util2['default'].outerWidth(p.$resizer);
	        if (rtl) {
	            posCol.left -= Math.ceil((parseFloat(selectedHeaderCell.css('border-left-width')) || 0) / 2);
	            posCol.left -= Math.ceil(resizerWidth / 2);
	        } else {
	            posCol.left += _css_util2['default'].outerWidth(selectedHeaderCell);
	            posCol.left += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
	            posCol.left -= Math.ceil(resizerWidth / 2);
	        }

	        p.$resizer.css({
	            "z-index": '10',
	            visibility: 'visible',
	            left: posCol.left,
	            top: posCol.top,
	            height: _css_util2['default'].height(this.$el)
	        })[0]['columnName'] = selectedHeaderCell[0]['columnName'];
	        try {
	            p.$resizer[0].style.zIndex = '';
	        } catch (err) {}

	        $(document).on('mousemove.dgtable', p.onMouseMoveResizeAreaBound);
	        $(document).on('mouseup.dgtable', p.onEndDragColumnHeaderBound);

	        event.preventDefault();
	    }
	};

	/**
	 * @param {jQuery_Event} event event
	 */
	DGTable.prototype._onMouseMoveColumnHeader = function (event) {

	    var that = this,
	        o = that.o,
	        p = that.p;

	    if (o.resizableColumns) {
	        var col = this._getColumnByResizePosition(event),
	            headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];

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
	        var o = this.o,
	            $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName),
	            bounds = $headerCell.offset();

	        bounds['width'] = _css_util2['default'].outerWidth($headerCell);
	        bounds['height'] = _css_util2['default'].outerHeight($headerCell);
	        this.trigger('headercontextmenu', $headerCell[0]['columnName'], event.pageX, event.pageY, bounds);
	    }
	    return this;
	};

	/**
	 * @private
	 * @param {jQuery_Event} event event
	 */
	DGTable.prototype._onMouseLeaveColumnHeader = function (event) {
	    var o = this.o,
	        headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];

	    headerCell.style.cursor = '';
	};

	/**
	 * @private
	 * @param {jQuery_Event} event event
	 */
	DGTable.prototype._onClickColumnHeader = function (event) {
	    if (!this._getColumnByResizePosition(event)) {

	        var that = this,
	            o = that.o,
	            p = that.p,
	            headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];

	        if (o.sortableColumns) {
	            var column = p.columns.get(headerCell['columnName']);
	            if (column && column.sortable) {
	                this.sort(headerCell['columnName'], undefined, true).render();
	            }
	        }
	    }
	};

	/**
	 * @private
	 * @param {jQuery_Event} event event
	 */
	DGTable.prototype._onStartDragColumnHeader = function (event) {

	    var that = this,
	        o = that.o,
	        p = that.p;

	    if (o.movableColumns) {

	        var $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName),
	            column = p.columns.get($headerCell[0]['columnName']);

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

	    var that = this,
	        p = that.p,
	        column = p.columns.get(p.$resizer[0]['columnName']),
	        rtl = this._isTableRtl(),
	        selectedHeaderCell = column.element,
	        commonAncestor = p.$resizer.parent(),
	        posCol = selectedHeaderCell.offset(),
	        posRelative = commonAncestor.offset();

	    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
	    posCol.left -= posRelative.left;
	    var resizerWidth = _css_util2['default'].outerWidth(p.$resizer),
	        isBoxing = selectedHeaderCell.css('box-sizing') === 'border-box',
	        actualX = event.pageX - posRelative.left,
	        minX = posCol.left;

	    minX -= Math.ceil(resizerWidth / 2);

	    if (rtl) {
	        minX += _css_util2['default'].outerWidth(selectedHeaderCell);
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

	    var that = this,
	        o = that.o,
	        p = that.p;

	    if (!p.$resizer) {
	        event.target.style.opacity = null;
	    } else {
	        $(document).off('mousemove.dgtable', p.onMouseMoveResizeAreaBound).off('mouseup.dgtable', p.onEndDragColumnHeaderBound);

	        var column = p.columns.get(p.$resizer[0]['columnName']),
	            rtl = this._isTableRtl(),
	            selectedHeaderCell = column.element,
	            commonAncestor = p.$resizer.parent(),
	            posCol = selectedHeaderCell.offset(),
	            posRelative = commonAncestor.offset();

	        posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
	        posCol.left -= posRelative.left;
	        var resizerWidth = _css_util2['default'].outerWidth(p.$resizer),
	            isBoxing = selectedHeaderCell.css('box-sizing') === 'border-box',
	            actualX = event.pageX - posRelative.left,
	            baseX = posCol.left,
	            minX = posCol.left,
	            width = 0;

	        baseX -= Math.ceil(resizerWidth / 2);

	        if (rtl) {

	            if (!isBoxing) {
	                actualX += this._horizontalPadding(selectedHeaderCell[0]);
	                actualX += parseFloat(selectedHeaderCell.css('border-left-width')) || 0;
	                actualX += parseFloat(selectedHeaderCell.css('border-right-width')) || 0;
	            }

	            baseX += _css_util2['default'].outerWidth(selectedHeaderCell);

	            minX = baseX - (column.ignoreMin ? 0 : this.o.minColumnWidth);
	            if (actualX > minX) {
	                actualX = minX;
	            }

	            width = baseX - actualX;
	        } else {

	            if (!isBoxing) {
	                actualX -= this._horizontalPadding(selectedHeaderCell[0]);
	                actualX -= parseFloat(selectedHeaderCell.css('border-left-width')) || 0;
	                actualX -= parseFloat(selectedHeaderCell.css('border-right-width')) || 0;
	            }

	            minX = baseX + (column.ignoreMin ? 0 : this.o.minColumnWidth);
	            if (actualX < minX) {
	                actualX = minX;
	            }

	            width = actualX - baseX;
	        }

	        p.$resizer.remove();
	        p.$resizer = null;

	        var sizeToSet = width;

	        if (column.widthMode === ColumnWidthMode.RELATIVE) {
	            //sizeLeft -= p.table.offsetWidth - p.table.clientWidth;

	            for (var detectedWidth = this._calculateWidthAvailableForColumns(), sizeLeft = detectedWidth, totalRelativePercentage = 0, relatives = 0, i = 0, col; i < p.visibleColumns.length; i++) {
	                col = p.visibleColumns[i];
	                if (col.name === column.name) continue;

	                if (col.widthMode == ColumnWidthMode.RELATIVE) {
	                    totalRelativePercentage += col.width;
	                    relatives++;
	                } else {
	                    sizeLeft -= col.actualWidth;
	                }
	            }

	            sizeLeft = Math.max(1, sizeLeft);
	            sizeToSet = width / sizeLeft;

	            if (relatives > 0) {
	                // When there's more than one relative overall,
	                //   we can do relative enlarging/shrinking.
	                // Otherwise, we can end up having a 0 width.

	                var unNormalizedSizeToSet = sizeToSet / ((1 - sizeToSet) / totalRelativePercentage);

	                totalRelativePercentage += sizeToSet;

	                // Account for relative widths scaling later
	                if (totalRelativePercentage < 1 && o.relativeWidthGrowsToFillWidth || totalRelativePercentage > 1 && o.relativeWidthShrinksToFillWidth) {
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
	    var that = this,
	        o = that.o,
	        p = that.p;

	    if (o.movableColumns) {
	        var dataTransferred = event.originalEvent.dataTransfer.getData('text');
	        if (dataTransferred) {
	            dataTransferred = JSON.parse(dataTransferred);
	        } else {
	            dataTransferred = null; // WebKit does not provide the dataTransfer on dragenter?..
	        }

	        var $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
	        if (!dataTransferred || p.dragId == dataTransferred.dragId && $headerCell['columnName'] !== dataTransferred.column) {

	            var column = p.columns.get($headerCell[0]['columnName']);
	            if (column && (column.movable || column != p.visibleColumns[0])) {
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
	    var o = this.o,
	        $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);

	    if (!$($headerCell[0].firstChild).has(event.originalEvent.relatedTarget).length) {
	        $headerCell.removeClass('drag-over');
	    }
	};

	/**
	 * @private
	 * @param {jQuery_Event} event event
	 */
	DGTable.prototype._onDropColumnHeader = function (event) {
	    event.preventDefault();

	    var that = this,
	        o = that.o,
	        p = that.p,
	        dataTransferred = JSON.parse(event.originalEvent.dataTransfer.getData('text')),
	        $headerCell = $(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);

	    if (o.movableColumns && dataTransferred.dragId == p.dragId) {
	        var srcColName = dataTransferred.column,
	            destColName = $headerCell[0]['columnName'],
	            srcCol = p.columns.get(srcColName),
	            destCol = p.columns.get(destColName);
	        if (srcCol && destCol && srcCol.movable && (destCol.movable || destCol != p.visibleColumns[0])) {
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

	    var that = this,
	        p = that.p;

	    if (p.$table) {
	        var tableClassName = this.o.tableClassName,
	            sortedColumns = p.$headerRow.find('>div.' + tableClassName + '-header-cell.sorted'),
	            arrows = sortedColumns.find('>div>.sort-arrow');

	        (0, _util.forEach)(arrows, (0, _util.bind)(function (arrow) {
	            var col = p.columns.get(arrow.parentNode.parentNode['columnName']);
	            if (col) {
	                col.arrowProposedWidth = 0;
	            }
	        }, this));
	        arrows.remove();
	        sortedColumns.removeClass('sorted').removeClass('desc');
	    }
	    return this;
	};

	/**
	 * @private
	 * @param {String} column the name of the sort column
	 * @param {Boolean} descending table is sorted descending
	 * @returns {DGTable} self
	 */
	DGTable.prototype._showSortArrow = function (column, descending) {

	    var that = this,
	        p = that.p,
	        col = p.columns.get(column);

	    if (!col) return false;

	    var arrow = createElement('span');
	    arrow.className = 'sort-arrow';

	    if (col.element) {
	        col.element.addClass(descending ? 'sorted desc' : 'sorted');
	        col.element[0].firstChild.insertBefore(arrow, col.element[0].firstChild.firstChild);
	    }

	    if (col.widthMode != ColumnWidthMode.RELATIVE && this.o.adjustColumnWidthForSortArrow) {
	        col.arrowProposedWidth = arrow.scrollWidth + (parseFloat($(arrow).css('margin-right')) || 0) + (parseFloat($(arrow).css('margin-left')) || 0);
	    }

	    return this;
	};

	/**
	 * @private
	 * @param {Number} cellIndex index of the column in the DOM
	 * @returns {DGTable} self
	 */
	DGTable.prototype._resizeColumnElements = function (cellIndex) {

	    var that = this,
	        p = that.p,
	        headerCells = p.$headerRow.find('div.' + this.o.tableClassName + '-header-cell'),
	        col = p.columns.get(headerCells[cellIndex]['columnName']);

	    if (col) {
	        headerCells[cellIndex].style.width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';

	        for (var width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px', tbodyChildren = p.$tbody[0].childNodes, i = 0, count = tbodyChildren.length, headerRow; i < count; i++) {
	            headerRow = tbodyChildren[i];
	            if (headerRow.nodeType !== 1) continue;
	            headerRow.childNodes[cellIndex].style.width = width;
	        }
	    }

	    return this;
	};

	/**
	 * @returns {DGTable} self
	 * */
	DGTable.prototype._destroyHeaderCells = function () {

	    var that = this,
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
	    var that = this,
	        p = that.p,
	        o = that.o;

	    // Clean up old elements

	    if (p.$table && o.virtualTable) {
	        p.$table.remove();
	        if (p.$tbody) {
	            for (var rows = p.$tbody[0].childNodes, i = 0, len = rows.length; i < len; i++) {
	                that.trigger('rowdestroy', rows[i]);
	                that._unbindCellEventsForRow(rows[i]);
	            }
	        }
	        p.$table = p.table = p.$tbody = p.tbody = null;
	    }

	    that._destroyHeaderCells();
	    p.currentTouchId = null;
	    if (p.$header) {
	        p.$header.remove();
	    }

	    // Create new base elements
	    var tableClassName = o.tableClassName,
	        headerCellClassName = tableClassName + '-header-cell',
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

	    if (o.width == DGTable.Width.SCROLL) {
	        this.el.style.overflow = 'hidden';
	    } else {
	        this.el.style.overflow = '';
	    }

	    if (!o.height && o.virtualTable) {
	        o.height = _css_util2['default'].innerHeight(this.$el);
	    }

	    return this;
	};

	/**
	 * @private
	 * @returns {DGTable} self
	 */
	DGTable.prototype._renderSkeletonHeaderCells = function () {
	    var that = this,
	        p = that.p,
	        o = that.o,
	        allowCellPreview = o.allowCellPreview,
	        allowHeaderCellPreview = o.allowHeaderCellPreview,
	        tableClassName = o.tableClassName,
	        headerCellClassName = tableClassName + '-header-cell',
	        header = p.header,
	        $header = p.$header,
	        headerRow = p.headerRow,
	        $headerRow = p.$headerRow,
	        ieDragDropHandler;

	    if (hasIeDragAndDropBug) {
	        ieDragDropHandler = function ieDragDropHandler(evt) {
	            evt.preventDefault();
	            this.dragDrop();
	            return false;
	        };
	    }

	    // Create header cells
	    for (var preventDefault = function preventDefault(event) {
	        event.preventDefault();
	    }, i = 0, column, cell, cellInside, $cell; i < p.visibleColumns.length; i++) {
	        column = p.visibleColumns[i];
	        if (column.visible) {
	            cell = createElement('div');
	            $cell = $(cell);
	            cell.draggable = true;
	            cell.className = headerCellClassName;
	            cell.style.width = column.actualWidth + 'px';
	            if (o.sortableColumns && column.sortable) {
	                cell.className += ' sortable';
	            }
	            cell['columnName'] = column.name;
	            cell.setAttribute('data-column', column.name);
	            cellInside = createElement('div');
	            cellInside.innerHTML = o.headerCellFormatter(column.label, column.name);
	            cell.appendChild(cellInside);
	            if (allowCellPreview && allowHeaderCellPreview) {
	                p._bindCellHoverIn(cell);
	            }
	            headerRow.appendChild(cell);

	            p.visibleColumns[i].element = $cell;

	            $cell.on('mousedown.dgtable', (0, _util.bind)(that._onMouseDownColumnHeader, that)).on('mousemove.dgtable', (0, _util.bind)(that._onMouseMoveColumnHeader, that)).on('mouseup.dgtable', (0, _util.bind)(that._onMouseUpColumnHeader, that)).on('mouseleave.dgtable', (0, _util.bind)(that._onMouseLeaveColumnHeader, that)).on('touchstart.dgtable', (0, _util.bind)(that._onTouchStartColumnHeader, that)).on('dragstart.dgtable', (0, _util.bind)(that._onStartDragColumnHeader, that)).on('click.dgtable', (0, _util.bind)(that._onClickColumnHeader, that)).on('contextmenu.dgtable', preventDefault);
	            $(cellInside).on('dragenter.dgtable', (0, _util.bind)(that._onDragEnterColumnHeader, that)).on('dragover.dgtable', (0, _util.bind)(that._onDragOverColumnHeader, that)).on('dragleave.dgtable', (0, _util.bind)(that._onDragLeaveColumnHeader, that)).on('drop.dgtable', (0, _util.bind)(that._onDropColumnHeader, that));

	            if (hasIeDragAndDropBug) {
	                $cell.on('selectstart.dgtable', (0, _util.bind)(ieDragDropHandler, cell));
	            }

	            // Disable these to allow our own context menu events without interruption
	            $cell.css({ "-webkit-touch-callout": 'none', "-webkit-user-select": 'none', "-moz-user-select": 'none', "-ms-user-select": 'none', "-o-user-select": 'none', "user-select": 'none' });
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
	    var that = this,
	        p = that.p,
	        o = that.o,
	        tableClassName = o.tableClassName;

	    // Calculate virtual row heights
	    if (o.virtualTable && !p.virtualRowHeight) {
	        var createDummyRow = function createDummyRow() {
	            var row = createElement('div'),
	                cell = row.appendChild(createElement('div')),
	                cellInner = cell.appendChild(createElement('div'));
	            row.className = tableClassName + '-row';
	            cell.className = tableClassName + '-cell';
	            cellInner.innerHTML = '0';
	            row.style.visibility = 'hidden';
	            row.style.position = 'absolute';
	            return row;
	        },
	            $dummyTbody,
	            $dummyWrapper = $('<div>').addClass(that.el.className).css({ "z-index": -1, position: 'absolute', left: '0', top: '-9999px', width: '1px', overflow: 'hidden' }).append($('<div>').addClass(tableClassName).append($dummyTbody = $('<div>').addClass(tableClassName + '-body').css('width', 99999)));

	        $dummyWrapper.appendTo(document.body);

	        var row1 = createDummyRow(),
	            row2 = createDummyRow(),
	            row3 = createDummyRow();
	        $dummyTbody.append(row1, row2, row3);

	        p.virtualRowHeightFirst = _css_util2['default'].outerHeight(row1);
	        p.virtualRowHeight = _css_util2['default'].outerHeight(row2);
	        p.virtualRowHeightLast = _css_util2['default'].outerHeight(row3);

	        p.virtualRowHeightMin = Math.min(Math.min(p.virtualRowHeightFirst, p.virtualRowHeight), p.virtualRowHeightLast);
	        p.virtualRowHeightMax = Math.max(Math.max(p.virtualRowHeightFirst, p.virtualRowHeight), p.virtualRowHeightLast);

	        $dummyWrapper.remove();
	    }

	    // Create inner table and tbody
	    if (!p.$table) {

	        var fragment = document.createDocumentFragment(),
	            table = createElement('div'),
	            $table = $(table);

	        // Create the inner table element

	        table.className = tableClassName;

	        if (o.virtualTable) {
	            table.className += ' virtual';
	        }

	        var tableHeight = o.height - _css_util2['default'].outerHeight(p.$headerRow);
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
	        table.style.overflowX = o.width == DGTable.Width.SCROLL ? 'auto' : 'hidden';
	        fragment.appendChild(table);

	        // Create the "tbody" element
	        var tbody = createElement('div'),
	            $tbody = $(tbody);

	        tbody.className = o.tableClassName + '-body';
	        p.table = table;
	        p.tbody = tbody;
	        p.$table = $table;
	        p.$tbody = $tbody;

	        if (o.virtualTable) {
	            p.virtualVisibleRows = Math.ceil(p.visibleHeight / p.virtualRowHeightMin);
	        }

	        that._calculateVirtualHeight();

	        relativizeElement($tbody);
	        relativizeElement($table);

	        table.appendChild(tbody);
	        that.el.appendChild(fragment);
	    }

	    return this;
	};

	/**
	 * @private
	 * @returns {DGTable} self
	 */
	DGTable.prototype._renderSkeleton = function () {
	    var that = this,
	        p = that.p;
	    return that;
	};

	/**
	 * @private
	 * @returns {DGTable} self
	 */
	DGTable.prototype._updateLastCellWidthFromScrollbar = function (force) {

	    var that = this,
	        p = that.p,
	        scrollbarWidth = p.table.offsetWidth - p.table.clientWidth;

	    // Calculate scrollbar's width and reduce from lat column's width

	    if (scrollbarWidth != p.scrollbarWidth || force) {
	        p.scrollbarWidth = scrollbarWidth;
	        for (var i = 0; i < p.columns.length; i++) {
	            p.columns[i].actualWidthConsideringScrollbarWidth = null;
	        }

	        if (p.scrollbarWidth > 0 && p.visibleColumns.length > 0) {
	            // (There should always be at least 1 column visible, but just in case)
	            var lastColIndex = p.visibleColumns.length - 1;

	            p.visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth = p.visibleColumns[lastColIndex].actualWidth - p.scrollbarWidth;

	            for (var lastColWidth = p.visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth + 'px', tbodyChildren = p.tbody.childNodes, i = 0, count = tbodyChildren.length, row; i < count; i++) {
	                row = tbodyChildren[i];
	                if (row.nodeType !== 1) continue;
	                row.childNodes[lastColIndex].style.width = lastColWidth;
	            }

	            p.headerRow.childNodes[lastColIndex].style.width = lastColWidth;
	        }
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
	    var that = this,
	        o = that.o,
	        p = that.p,
	        width = this._calculateTbodyWidth();

	    p.tbody.style.minWidth = width + 'px';
	    p.headerRow.style.minWidth = width + (p.scrollbarWidth || 0) + 'px';

	    p.$table.off('scroll', p.onTableScrolledHorizontallyBound);

	    if (o.width == DGTable.Width.AUTO) {
	        // Update wrapper element's size to fully contain the table body

	        _css_util2['default'].width(p.$table, _css_util2['default'].outerWidth(p.$tbody));
	        _css_util2['default'].width(this.$el, _css_util2['default'].outerWidth(p.$table));
	    } else if (o.width == DGTable.Width.SCROLL) {

	        if (parentSizeMayHaveChanged) {
	            var lastScrollTop = p.table ? p.table.scrollTop : 0,
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
	 * @returns {Boolean}
	 */
	DGTable.prototype._isTableRtl = function () {
	    return this.p.$table.css('direction') === 'rtl';
	};

	/**
	 * @private
	 * @param {Object} column column object
	 * @returns {String}
	 */
	DGTable.prototype._serializeColumnWidth = function (column) {
	    return column.widthMode === ColumnWidthMode.AUTO ? 'auto' : column.widthMode === ColumnWidthMode.RELATIVE ? column.width * 100 + '%' : column.width;
	};

	/**
	 * @private
	 * @param {HTMLElement} el
	 */
	DGTable.prototype._cellMouseOverEvent = function (el) {
	    var that = this,
	        o = that.o,
	        p = that.p,
	        elInner = el.firstChild;

	    if (elInner.scrollWidth - elInner.clientWidth > 1 || elInner.scrollHeight - elInner.clientHeight > 1) {

	        that.hideCellPreview();
	        p.abortCellPreview = false;

	        var $el = $(el),
	            $elInner = $(elInner),
	            previewCell = createElement('div'),
	            $previewCell = $(previewCell);

	        previewCell.innerHTML = el.innerHTML;
	        previewCell.className = o.cellPreviewClassName;

	        var isHeaderCell = $el.hasClass(o.tableClassName + '-header-cell');
	        if (isHeaderCell) {
	            previewCell.className += ' header';
	            if ($el.hasClass('sortable')) {
	                previewCell.className += ' sortable';
	            }

	            previewCell.draggable = true;

	            $(previewCell).on('mousedown', (0, _util.bind)(that._onMouseDownColumnHeader, that)).on('mousemove', (0, _util.bind)(that._onMouseMoveColumnHeader, that)).on('mouseup', (0, _util.bind)(that._onMouseUpColumnHeader, that)).on('mouseleave', (0, _util.bind)(that._onMouseLeaveColumnHeader, that)).on('touchstart', (0, _util.bind)(that._onTouchStartColumnHeader, that)).on('dragstart', (0, _util.bind)(that._onStartDragColumnHeader, that)).on('click', (0, _util.bind)(that._onClickColumnHeader, that)).on('contextmenu.dgtable', function (event) {
	                event.preventDefault();
	            });
	            $(previewCell.firstChild).on('dragenter', (0, _util.bind)(that._onDragEnterColumnHeader, that)).on('dragover', (0, _util.bind)(that._onDragOverColumnHeader, that)).on('dragleave', (0, _util.bind)(that._onDragLeaveColumnHeader, that)).on('drop', (0, _util.bind)(that._onDropColumnHeader, that));

	            if (hasIeDragAndDropBug) {
	                $(previewCell).on('selectstart', (0, _util.bind)(function (evt) {
	                    evt.preventDefault();
	                    this.dragDrop();
	                    return false;
	                }, previewCell));
	            }
	        }

	        var paddingL = parseFloat($el.css('padding-left')) || 0,
	            paddingR = parseFloat($el.css('padding-right')) || 0,
	            paddingT = parseFloat($el.css('padding-top')) || 0,
	            paddingB = parseFloat($el.css('padding-bottom')) || 0,
	            requiredWidth = elInner.scrollWidth + (el.clientWidth - elInner.offsetWidth),
	            borderBox = $el.css('box-sizing') === 'border-box';

	        if (borderBox) {
	            $previewCell.css('box-sizing', 'border-box');
	        } else {
	            requiredWidth -= paddingL + paddingR;
	            $previewCell.css('margin-top', parseFloat($(el).css('border-top-width')) || 0);
	        }

	        if (!p.transparentBgColor1) {
	            // Detect browser's transparent spec
	            var tempDiv = document.createElement('div');
	            tempDiv.style.backgroundColor = 'transparent';
	            p.transparentBgColor1 = $(tempDiv).css('background-color');
	            tempDiv.style.backgroundColor = 'rgba(0,0,0,0)';
	            p.transparentBgColor2 = $(tempDiv).css('background-color');
	        }

	        var css = {
	            "box-sizing": borderBox ? 'border-box' : 'content-box',
	            width: requiredWidth,
	            "min-height": _css_util2['default'].height($el),
	            "padding-left": paddingL,
	            "padding-right": paddingR,
	            "padding-top": paddingT,
	            "padding-bottom": paddingB,
	            overflow: 'hidden',
	            position: 'absolute',
	            "z-index": '-1',
	            left: '0',
	            top: '0',
	            cursor: 'default'
	        };

	        if (css) {
	            var bgColor = $(el).css('background-color');
	            if (bgColor === p.transparentBgColor1 || bgColor === p.transparentBgColor2) {
	                bgColor = $(el.parentNode).css('background-color');
	            }
	            if (bgColor === p.transparentBgColor1 || bgColor === p.transparentBgColor2) {
	                bgColor = '#fff';
	            }
	            css['background-color'] = bgColor;
	        }

	        $previewCell.css(css);

	        that.el.appendChild(previewCell);

	        $(previewCell.firstChild).css({
	            direction: $elInner.css('direction'),
	            "white-space": $elInner.css('white-space')
	        });

	        if (isHeaderCell) {
	            // Disable these to allow our own context menu events without interruption
	            $previewCell.css({
	                "-webkit-touch-callout": 'none',
	                "-webkit-user-select": 'none',
	                "-moz-user-select": 'none',
	                "-ms-user-select": 'none',
	                "-o-user-select": 'none',
	                "user-select": 'none'
	            });
	        }

	        previewCell['rowIndex'] = el.parentNode['rowIndex'];
	        var physicalRowIndex = previewCell['physicalRowIndex'] = el.parentNode['physicalRowIndex'];
	        previewCell['columnName'] = p.visibleColumns[(0, _util.indexOf)(el.parentNode.childNodes, el)].name;

	        try {
	            var selection = _selection_helper2['default'].saveSelection(el);
	            if (selection) _selection_helper2['default'].restoreSelection(previewCell, selection);
	        } catch (ex) {}

	        that.trigger('cellpreview', previewCell.firstChild, physicalRowIndex == null ? null : physicalRowIndex, previewCell['columnName'], physicalRowIndex == null ? null : p.rows[physicalRowIndex], el);

	        if (p.abortCellPreview) {
	            $previewCell.remove();
	            return;
	        }

	        var $parent = that.$el,
	            $scrollParent = $parent[0] === window ? $(document) : $parent,
	            offset = $el.offset(),
	            parentOffset = $parent.offset(),
	            rtl = $el.css('float') === 'right',
	            prop = rtl ? 'right' : 'left';


	        // Handle RTL, go from the other side
	        if (rtl) {
	            var windowWidth = $(window).width();
	            offset.right = windowWidth - (offset.left + _css_util2['default'].outerWidth($el));
	            parentOffset.right = windowWidth - (parentOffset.left + _css_util2['default'].outerWidth($parent));
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
	        var minHorz = 0,
	            maxHorz = $parent - _css_util2['default'].outerWidth($previewCell);
	        offset[prop] = offset[prop] < minHorz ? minHorz : offset[prop] > maxHorz ? maxHorz : offset[prop];

	        // Constrain vertically
	        var totalHeight = _css_util2['default'].outerHeight($el),
	            maxTop = $scrollParent.scrollTop() + _css_util2['default'].innerHeight($parent) - totalHeight;

	        if (offset.top > maxTop) {
	            offset.top = Math.max(0, maxTop);
	        }

	        // Apply css to preview cell
	        var previewCss = {
	            top: offset.top,
	            "z-index": 9999
	        };
	        previewCss[prop] = offset[prop];

	        $previewCell.css(previewCss);

	        previewCell['__cell'] = el;
	        p.$cellPreviewCell = $previewCell;
	        el['__previewCell'] = previewCell;

	        p._bindCellHoverOut(el);
	        p._bindCellHoverOut(previewCell);

	        $previewCell.on('mousewheel', function (event) {
	            var originalEvent = event.originalEvent,
	                xy = originalEvent.wheelDelta || -originalEvent.detail,
	                x = originalEvent.wheelDeltaX || (originalEvent.axis == 1 ? xy : 0),
	                y = originalEvent.wheelDeltaY || (originalEvent.axis == 2 ? xy : 0);


	            if (xy) {
	                that.hideCellPreview();
	            }

	            if (y && p.table.scrollHeight > p.table.clientHeight) {
	                var scrollTop = y * -1 + p.$table.scrollTop();
	                p.$table.scrollTop(scrollTop);
	            }

	            if (x && p.table.scrollWidth > p.table.clientWidth) {
	                var scrollLeft = x * -1 + p.$table.scrollLeft();
	                p.$table.scrollLeft(scrollLeft);
	            }
	        });
	    }
	};

	/**
	 * @private
	 * @param {HTMLElement} el
	 */
	DGTable.prototype._cellMouseOutEvent = function (el) {
	    this.hideCellPreview();
	};

	/**
	 * Hides the current cell preview,
	 * or prevents the one that is currently trying to show (in the 'cellpreview' event)
	 * @public
	 * @expose
	 * @returns {DGTable} self
	 */
	DGTable.prototype.hideCellPreview = function () {
	    var that = this,
	        p = that.p;

	    if (p.$cellPreviewCell) {
	        var previewCell = p.$cellPreviewCell[0],
	            origCell = previewCell['__cell'],
	            selection;


	        try {
	            selection = _selection_helper2['default'].saveSelection(previewCell);
	        } catch (ex) {}

	        p.$cellPreviewCell.remove();
	        p._unbindCellHoverOut(origCell);
	        p._unbindCellHoverOut(previewCell);

	        try {
	            if (selection) _selection_helper2['default'].restoreSelection(origCell, selection);
	        } catch (ex) {}

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
	 * @property {Number|null|undefined} [order=0]
	 * @property {String|null|undefined} [width='auto']
	 * @property {Boolean|null|undefined} [visible=true]
	 * */

	/**
	 * @typedef {Object} SERIALIZED_COLUMN_SORT
	 * @property {String|null|undefined} [column='']
	 * @property {Boolean|null|undefined} [descending=false]
	 * */

	/**
	 * @enum {ColumnWidthMode|number|undefined}
	 * @const
	 * @typedef {ColumnWidthMode}
	 */
	var ColumnWidthMode = {
	    /** @const*/AUTO: 0,
	    /** @const*/ABSOLUTE: 1,
	    /** @const*/RELATIVE: 2
	};

	/**
	 * @enum {DGTable.Width|String|undefined}
	 * @const
	 * @typedef {DGTable.Width}
	 */
	DGTable.Width = {
	    /** @const*/NONE: 'none',
	    /** @const*/AUTO: 'auto',
	    /** @const*/SCROLL: 'scroll'
	};

	/**
	 * @expose
	 * @typedef {Object} COLUMN_SORT_OPTIONS
	 * @property {String|null|undefined} column
	 * @property {Boolean|null|undefined} [descending=false]
	 * */

	/**
	 * @expose
	 * @typedef {Object} COLUMN_OPTIONS
	 * @property {String|null|undefined} width
	 * @property {String|null|undefined} name
	 * @property {String|null|undefined} label
	 * @property {String|null|undefined} dataPath - defaults to `name`
	 * @property {String|null|undefined} comparePath - defaults to `dataPath`
	 * @property {Number|String|null|undefined} comparePath
	 * @property {Boolean|null|undefined} [resizable=true]
	 * @property {Boolean|null|undefined} [movable=true]
	 * @property {Boolean|null|undefined} [sortable=true]
	 * @property {Boolean|null|undefined} [visible=true]
	 * @property {String|null|undefined} [cellClasses]
	 * @property {Boolean|null|undefined} [ignoreMin=false]
	 * */

	/**
	 * @typedef {Object} DGTable.Options
	 * @property {COLUMN_OPTIONS[]} [columns]
	 * @property {Number} [height]
	 * @property {DGTable.Width} [width]
	 * @property {Boolean|null|undefined} [virtualTable=true]
	 * @property {Boolean|null|undefined} [resizableColumns=true]
	 * @property {Boolean|null|undefined} [movableColumns=true]
	 * @property {Number|null|undefined} [sortableColumns=1]
	 * @property {Boolean|null|undefined} [adjustColumnWidthForSortArrow=true]
	 * @property {Boolean|null|undefined} [relativeWidthGrowsToFillWidth=true]
	 * @property {Boolean|null|undefined} [relativeWidthShrinksToFillWidth=false]
	 * @property {Boolean|null|undefined} [convertColumnWidthsToRelative=false]
	 * @property {Boolean|null|undefined} [autoFillTableWidth=false]
	 * @property {String|null|undefined} [cellClasses]
	 * @property {String|String[]|COLUMN_SORT_OPTIONS|COLUMN_SORT_OPTIONS[]} [sortColumn]
	 * @property {Function|null|undefined} [cellFormatter=null]
	 * @property {Function|null|undefined} [headerCellFormatter=null]
	 * @property {Number|null|undefined} [rowsBufferSize=10]
	 * @property {Number|null|undefined} [minColumnWidth=35]
	 * @property {Number|null|undefined} [resizeAreaWidth=8]
	 * @property {{function(string,boolean):{function(a:*,b:*):boolean}}} [onComparatorRequired]
	 * @property {String|null|undefined} [resizerClassName=undefined]
	 * @property {String|null|undefined} [tableClassName=undefined]
	 * @property {Boolean|null|undefined} [allowCellPreview=true]
	 * @property {Boolean|null|undefined} [allowHeaderCellPreview=true]
	 * @property {String|null|undefined} [cellPreviewClassName=undefined]
	 * @property {Boolean|null|undefined} [cellPreviewAutoBackground=true]
	 * @property {Element|null|undefined} [el=undefined]
	 * @property {String|null|undefined} [className=undefined]
	 * @property {Function|null|undefined} [filter=undefined]
	 * */

	/**
	 * @typedef {{
	     *  currentTarget: Element,
	     *  data: Object.<string, *>,
	     *  delegateTarget: Element,
	     *  isDefaultPrevented: Boolean,
	     *  isImmediatePropagationStopped: Boolean,
	     *  isPropagationStopped: Boolean,
	     *  namespace: string,
	     *  originalEvent: MouseEvent|TouchEvent|Event,
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
	     * }} jQuery_Event
	 * */

	if (!$.controls) {
	    $.controls = {};
	}

	$.controls.dgtable = DGTable;

	exports['default'] = DGTable;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var nativeBind = Function.prototype.bind;

	var bind = exports.bind = function bind(what, oThis) {

	    if (nativeBind) {
	        return what.bind(oThis);
	    }

	    if (typeof this !== 'function') {
	        // closest thing possible to the ECMAScript 5
	        // internal IsCallable function
	        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
	    }

	    var aArgs = Array.prototype.slice.call(arguments, 1),
	        fToBind = this,
	        fNOP = function fNOP() {},
	        fBound = function fBound() {
	        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
	    };

	    if (this.prototype) {
	        // Function.prototype doesn't have a prototype property
	        fNOP.prototype = this.prototype;
	    }

	    fBound.prototype = new fNOP();

	    return fBound;
	};

	var nativeIndexOf = Function.prototype.indexOf;

	var indexOf = exports.indexOf = function indexOf(array, searchElement, fromIndex) {

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

	var contains = exports.contains = function contains(array, item) {
	    return indexOf(array, item) >= 0;
	};

	var find = exports.find = function find(array, predicate) {

	    for (var i = 0, len = array.length; i >= 0 && i < len; i += 1) {
	        if (predicate(array[i], i, array)) return array[i];
	    }
	};

	var nativeForEach = Function.prototype.forEach;

	var forEach = exports.forEach = function forEach(array, callback, thisArg) {

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

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1, source; i < arguments.length; i++) { source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _util = __webpack_require__(2);

	// Define class RowCollection
	function RowCollection() {

	    // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
	    // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
	    var collection = [];

	    // Synthetically set the 'prototype'
	    _extends(collection, RowCollection.prototype);

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
	    var isArray = 'splice' in rows && 'length' in rows,
	        i,
	        len;
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
	 * @param {Function} filterFunc - Filtering function
	 * @param {Object|null} args? - Options to pass to the function
	 * @returns {RowCollection} success result
	 */
	RowCollection.prototype.filteredCollection = function (filterFunc, args) {
	    if (filterFunc && args) {

	        for (var rows = new RowCollection({ sortColumn: this.sortColumn }), i = 0, len = this.length, row; i < len; i++) {
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

	var nativeSort = RowCollection.prototype.sort;

	function getDefaultComparator(column, descending) {
	    var columnName = column.column,
	        comparePath = column.comparePath || columnName;

	    if (typeof comparePath === 'string') {
	        comparePath = comparePath.split('.');
	    }
	    var pathLength = comparePath.length,
	        hasPath = pathLength > 1,
	        i,
	        lessVal = descending ? 1 : -1,
	        moreVal = descending ? -1 : 1;

	    return function (leftRow, rightRow) {
	        var leftVal = leftRow[comparePath[0]],
	            rightVal = rightRow[comparePath[0]];
	        if (hasPath) {
	            for (i = 1; i < pathLength; i++) {
	                leftVal = leftVal && leftVal[comparePath[i]];
	                rightVal = rightVal && rightVal[comparePath[i]];
	            }
	        }
	        if (leftVal === rightVal) return 0;
	        if (leftVal == null) return lessVal;
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
	        var comparators = [],
	            i,
	            comparator;

	        for (i = 0; i < this.sortColumn.length; i++) {
	            comparator = null;
	            if (this.onComparatorRequired) {
	                comparator = this.onComparatorRequired(this.sortColumn[i].column, this.sortColumn[i].descending);
	            }
	            if (!comparator) {
	                comparator = getDefaultComparator(this.sortColumn[i], this.sortColumn[i].descending);
	            }
	            comparators.push((0, _util.bind)(comparator, this));
	        }

	        if (comparators.length === 1) {
	            nativeSort.call(this, comparators[0]);
	        } else {
	            var len = comparators.length,
	                value;

	            comparator = function comparator(leftRow, rightRow) {
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

	exports['default'] = RowCollection;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';

	// Define class RowCollection

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1, source; i < arguments.length; i++) { source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function ColumnCollection() {

	    // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
	    // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
	    var collection = [];

	    // Synthetically set the 'prototype'
	    _extends(collection, ColumnCollection.prototype);

	    // Call initializer
	    collection.initialize.apply(collection, arguments);

	    return collection;
	}

	// Inherit Array
	ColumnCollection.prototype = [];

	ColumnCollection.prototype.initialize = function () {};

	/**
	 * Get the column by this name
	 * @param {String} column column name
	 * @returns {Object} the column object
	 */
	ColumnCollection.prototype.get = function (column) {
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
	ColumnCollection.prototype.indexOf = function (column) {
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
	ColumnCollection.prototype.getByOrder = function (order) {
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
	ColumnCollection.prototype.normalizeOrder = function () {
	    var ordered = [],
	        i;
	    for (i = 0; i < this.length; i++) {
	        ordered.push(this[i]);
	    }
	    ordered.sort(function (col1, col2) {
	        return col1.order < col2.order ? -1 : col1.order > col2.order ? 1 : 0;
	    });
	    for (i = 0; i < ordered.length; i++) {
	        ordered[i].order = i;
	    }
	    return this;
	};

	/**
	 * Get the array of visible columns, order by the order property
	 * @returns {Array<Object>} ordered array of visible columns
	 */
	ColumnCollection.prototype.getVisibleColumns = function () {
	    for (var visible = [], i = 0, column; i < this.length; i++) {
	        column = this[i];
	        if (column.visible) {
	            visible.push(column);
	        }
	    }
	    visible.sort(function (col1, col2) {
	        return col1.order < col2.order ? -1 : col1.order > col2.order ? 1 : 0;
	    });
	    return visible;
	};

	/**
	 * @returns {int} maximum order currently in the array
	 */
	ColumnCollection.prototype.getMaxOrder = function () {
	    for (var order = 0, i = 0, column; i < this.length; i++) {
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
	        var srcOrder = src.order,
	            destOrder = dest.order,
	            i,
	            col;
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

	exports['default'] = ColumnCollection;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _jquery = __webpack_require__(1),
	    _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	for (var $ = _jquery2['default'], hasComputedStyle = document.defaultView && document.defaultView.getComputedStyle, jQuerySupportsFractions = $ && $.fn.jquery >= '3', cssExpands = {
	    width: ['Left', 'Right', 'Width'],
	    height: ['Top', 'Bottom', 'Height']
	}, sizeKeys = ['width', 'height'], CssUtil = {}, generateSizeFunction = function generateSizeFunction(key, cssExpand, inner, outer) {

	    return function () {
	        var el = arguments[0],
	            value = arguments[1];


	        if (el && !(el instanceof Element) && ('length' in el)) {
	            el = el[0];
	        }

	        if (!el) {
	            return null;
	        }

	        var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle,
	            isBoxing = style['boxSizing'] === 'border-box',
	            size,
	            border,
	            padding,
	            includeMargins = outer && arguments[2] === true || arguments[1] === true;


	        if (isBoxing || outer || inner) {
	            border = parseFloat(style['border' + cssExpand[0] + 'Width'] || 0) + parseFloat(style['border' + cssExpand[1] + 'Width'] || 0);

	            padding = parseFloat(style['padding' + cssExpand[0]] || 0) + parseFloat(style['padding' + cssExpand[1]] || 0);
	        }

	        var margin = includeMargins ? parseFloat(style['margin' + cssExpand[0]] || 0) + parseFloat(style['margin' + cssExpand[1]] || 0) : 0;

	        if (value == undefined) {
	            size = parseFloat(style[key]);

	            if (isBoxing) {

	                if (padding + border > size) {
	                    size = padding + border;
	                }

	                if (outer) {
	                    if (includeMargins) {
	                        size += margin;
	                    }
	                } else if (inner) {
	                    size -= border;
	                } else {
	                    size -= padding + border;
	                }
	            } else {

	                if (outer) {
	                    size += padding + border;

	                    if (includeMargins) {
	                        size += margin;
	                    }
	                } else if (inner) {
	                    size += padding;
	                }
	            }

	            return size;
	        } else {
	            value = value || 0;
	            size = value;

	            if (isBoxing) {

	                if (outer) {
	                    if (includeMargins) {
	                        size -= margin;
	                    }
	                } else if (inner) {
	                    size += border;
	                } else {
	                    size += padding + border;
	                }
	            } else {

	                if (outer) {
	                    size -= padding + border;

	                    if (includeMargins) {
	                        size -= margin;
	                    }
	                } else if (inner) {
	                    size -= padding;
	                }

	                if (size < 0) {
	                    size = 0;
	                }
	            }

	            el.style[key] = size + 'px';

	            return value;
	        }
	    };
	}, generatejQueryFunction = function generatejQueryFunction(key) {
	    return function () {
	        var collection = arguments[0];
	        if (!$.isArray(collection) && !(collection instanceof $)) {
	            collection = [collection];
	        }

	        var ret = $.fn[key].apply(collection, Array.prototype.slice.call(arguments, 1));

	        if (arguments.length > 1) {
	            return this;
	        }

	        return ret;
	    };
	}, i = 0; i < sizeKeys.length; i++) {
	    var key = sizeKeys[i],
	        cssExpand = cssExpands[key];


	    if (jQuerySupportsFractions) {

	        CssUtil[key] = generatejQueryFunction(key);
	        CssUtil['inner' + cssExpand[2]] = generatejQueryFunction('inner' + cssExpand[2]);
	        CssUtil['outer' + cssExpand[2]] = generatejQueryFunction('outer' + cssExpand[2]);
	    } else {

	        CssUtil[key] = generateSizeFunction(key, cssExpand, false, false);
	        CssUtil['inner' + cssExpand[2]] = generateSizeFunction(key, cssExpand, true, false);
	        CssUtil['outer' + cssExpand[2]] = generateSizeFunction(key, cssExpand, false, true);
	    }
	}

	// Remove that huge function from memory
	generateSizeFunction = null;

	exports['default'] = CssUtil;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	// saveSelection/restoreSelection courtesy of Tim Down, with my improvements
	// https://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0, descriptor; i < props.length; i++) { descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function isChildOf(child, parent) {
	    while ((child = child.parentNode) && child !== parent) {}
	    return !!child;
	}

	var SelectionHelper = function () {
	    function SelectionHelper() {
	        _classCallCheck(this, SelectionHelper);
	    }

	    _createClass(SelectionHelper, null, [{
	        key: 'saveSelection',
	        value: function saveSelection(el) {
	            var range = window.getSelection().getRangeAt(0);

	            if (el !== range.commonAncestorContainer && !isChildOf(range.commonAncestorContainer, el)) return null;

	            var preSelectionRange = range.cloneRange();
	            preSelectionRange.selectNodeContents(el);
	            preSelectionRange.setEnd(range.startContainer, range.startOffset);
	            var start = preSelectionRange.toString().length;

	            return {
	                start: start,
	                end: start + range.toString().length
	            };
	        }
	    }, {
	        key: 'restoreSelection',
	        value: function restoreSelection(el, savedSel) {
	            var charIndex = 0,
	                nodeStack = [el],
	                node = void 0,
	                foundStart = false,
	                stop = false,
	                range = document.createRange();

	            range.setStart(el, 0);
	            range.collapse(true);

	            while (!stop && (node = nodeStack.pop())) {
	                if (node.nodeType == 3) {
	                    var nextCharIndex = charIndex + node.length;
	                    if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
	                        range.setStart(node, savedSel.start - charIndex);
	                        foundStart = true;
	                    }
	                    if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
	                        range.setEnd(node, savedSel.end - charIndex);
	                        stop = true;
	                    }
	                    charIndex = nextCharIndex;
	                } else {
	                    var i = node.childNodes.length;
	                    while (i--) {
	                        nodeStack.push(node.childNodes[i]);
	                    }
	                }
	            }

	            var sel = window.getSelection();
	            sel.removeAllRanges();
	            sel.addRange(range);
	        }
	    }]);

	    return SelectionHelper;
	}();

	exports['default'] = SelectionHelper;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function ByColumnFilter(row, args) {

	    var column = args.column,
	        keyword = args.keyword == null ? '' : args.keyword.toString();


	    if (!keyword || !column) return true;

	    var actualVal = row[column];
	    if (actualVal == null) {
	        return false;
	    }

	    actualVal = actualVal.toString();

	    if (!args.caseSensitive) {
	        actualVal = actualVal.toLowerCase();
	        keyword = keyword.toLowerCase();
	    }

	    return actualVal.indexOf(keyword) !== -1;
	}

	exports['default'] = ByColumnFilter;

/***/ })
/******/ ])
});
;