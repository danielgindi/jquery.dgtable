DGTable.js
==========

This is a table View for Backbone + jQuery, which is meant to be high-performance, and allow simple user interactions with the UI, such as:
* Sorting
* Sorting by more than one column
* Moving columns
* Resizing columns
* Full cell preview when hovering
* Native RTL support

Other features implemented are:
* Mix absolute column widths with relative column widths
* Virtual table mode (to supply high performance with hundreds of thousands of rows). This is the default.
* Non-virtual table mode is fully supported, but for giant amounts of data it is not recommended.
* Option to set a fixed width for the table so resizing (relative) columns will still make sure the table will not be less (and/or more) than the specified width.
* Option to have both scrollbars inside the table. (set `width: DGTable.Width.SCROLL`)

A few notes:
* TODO: Have a simple and accurate API documentation here in the readme
* Currently in virtual table mode - I cannot handle variable height rows.

## Dev environment

* Using grunt over Node.js to automate validating and building.
* After installing Node.js, use `npm install`, and `npm install -g grunt-cli` to prepare building environment.
* Use `grunt style` to just test for correct styling.
* Use `grunt build` or just `grunt` to compile for release.
* I am using Google Closure Compiler, because UglifyJS does not work with the JSDoc, and there's a major difference in size & performance of the output code.
* Some features of jshint are disabled because it does not work well with JSDoc which is used for Google Closue Compiler.
* Indentations in my editor are set to 4 spaces, and jshint validates that.

## Me
* Hi! I am Daniel Cohen Gindi. Or in short- Daniel.
* danielgindi@gmail.com is my email address.
* That's all you need to know.

## Help

I have invested, and investing, a lot of time in this project.
If you want to help, you could:
* Actually code, and issue pull requests
* Test the library under different conditions and browsers
* Create more demo pages
* Spread the word
* 
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=G22LPLJ79NBYQ)

## API

To create a new table, just use `var myTable = new DGTable(INIT_OPTIONS)`.

#### `INIT_OPTIONS`

* **columns**: `COLUMN_OPTIONS[]` (Array of COLUMN_OPTIONS objects)
  * **name**: `String` Name of the column
  * **label**: `String=name` Used for the header of this column
  * **width**: `Number|String`
    * A simple number (i.e `10`, `30`, `50`) will set an absolute width for the column.
    * A percentage (i.e `'30%'`) or a 0-1 decimal value (i.e `0.2`, `0.7`) will set a relative width for the column, out of the full table's width.
    * Any other value, like `0`, `null` etc. will set an automatic width mode, base of the header's content length.
  * **resizable**: `Boolean=true` Is this column resizable?
  * **sortable**: `Boolean=true` Is this column sortable?
  * **movable**: `Boolean=true` Is this column movable?
  * **visible**: `Boolean=true` Is this column visible?
  * **cellClasses**: `String` Classes to add to the DOM element of this cell
  * **ignoreMin**: `Boolean=false` Should this column ignore the minimum width specified for the table columns?
* **height**: `Number` Suggested height for the table
* **width**: `DGTable.Width=DGTable.Width.NONE` The way that the width of the table will be handled
  * `DGTable.Width.NONE`: No special handling
  * `DGTable.Width.AUTO`: Sets the width automatically
  * `DGTable.Width.SCROLL`: Creates a horizontal scroll when required
* **virtualTable**: `Boolean=true` When set, the table will work in virtual mode, which means only the visible rows are rendered. Rows must have fixed height in this mode.
* **resizableColumns**: `Boolean=true` Turns on or off the resizable columns globally.
* **movableColumns**: `Boolean=true` Turns on or off the movable columns globally.
* **sortableColumns**: `Number=1` How many columns can you sort by, one after another?
* **adjustColumnWidthForSortArrow**: `Boolean=true` When set, the columns will automatically grow to accommodate for the sort arrow.
* **relativeWidthGrowsToFillWidth**: `Boolean=true` When set, relative width columns automatically grow to fill the table's width.
* **relativeWidthShrinksToFillWidth**: `Boolean=false` When set, relative width columns automatically shrink to fill the table's width.
* **convertColumnWidthsToRelative**: `Boolean=false` When set, auto-width columns are automatically converted to relatives.
* **cellClasses**: `String` Classes to add to the DOM element of all cells
* **sortColumn**: `String|String[]|COLUMN_SORT_OPTIONS|COLUMN_SORT_OPTIONS[]` Columns to sort by
  * Can be a column or an array of columns.
  * Each column is a `String` or a `COLUMN_SORT_OPTIONS`:
  * **column**: `String` Column name
  * **descending**: `Boolean=false` Is this column sorted in descending order?
* **cellFormatter**: `Function(String value, String columnName, Object rowData)String` *(optional)* A formatter function which will return the HTML for the cell. By default the formatter is a plain HTML formatter.
* **headerCellFormatter**: `Function(String value, String columnName)String` *(optional)* A formatter function which will return the HTML for the cell's header. By default the formatter is a plain HTML formatter.
* **rowsBufferSize**: `Number=10` The size of the rows buffer, for virtual table
* **minColumnWidth**: `Number=35` In pixels, the minimum width for a column
* **resizeAreaWidth**: `Number=8` The size of the area where you can drag to resize.
* **comparatorCallback**: `Function(String columnName, Boolean descending):{Function(a,b):boolean}` A callback that can pass a comparator function for each column and mode as required.
* **resizerClassName**: `String='dgtable-resize'` Class name for the dragged resizing element (showing when resizing a column)
* **tableClassName**: `String='dgtable'` Class name for the table
* **allowCellPreview**: `Boolean=true` When set, hovering on truncated cells will show a preview of the full content.
* **allowHeaderCellPreview**: `Boolean=true` Allow for toggling off **allowCellPreview** for headers specifically.
* **cellPreviewClassName**: `String='dgtable-cell-preview'` Class name for the cell preview element
* **className**: `String='dgtable-wrapper'` Backbone's wrapper element class name.
* **tagName**: `String='div'` Backbone's wrapper element tag name.

#### Events triggered by DGTable:

* `renderskeleton`: The table is re-drawing it's base elements, including headers. Will always be followed by a `render` event.
* `render`: The table has finished rendering (after adding rows etc.).
* `cellpreview`: We are about to show a cell preview.
  * 1st argument: Preview's DOM element
  * 2nd argument: Row's index - or null for header
  * 3rd argument: Column's name
  * 4th argument: Row's data - if applicable
  * At this stage you can prevent showing the preview, by calling `table.abortCellPreview`
* `cellpreviewdestroy`: Cell preview element is about to be destroyed after hiding
  * 1st argument: Preview's DOM element
  * 2nd argument: Row's index
  * 3rd argument: Column's name
  * You can use this event to release any resources that you may have used in `cellPreview` event.
* `headerrowcreate`: The header row has just been created
  * 1st argument: Row's DOM element
* `headerrowdestroy`: Called just before removing the physical header row element from the table
  * 1st argument: Row's DOM element
* `rowcreate`: A row has just been created
  * 1st argument: Row's index in the currently filtered data set
  * 2nd argument: Row's index in the data set
  * 3nd argument: Row's DOM element
  * 4th argument: Row's data
* `rowdestroy`: Called just before removing a physical row element from the table
  * 1st argument: Row's DOM element
* `addrows`: Data rows have been added to the table
  * 1st argument: How many rows
  * 2nd argument: Is this a replace? In other word, were the old rows removed?
* `addcolumn`: A column was added
  * 1st argument: The column's name
* `removecolumn`: A column was removed
  * 1st argument: The column's name
* `movecolumn`: A column was moved
  * 1st argument: The column's name
  * 2nd argument: From index
  * 3nd argument: To index
* `showcolumn`: A column was shown
  * 1st argument: The column's name
* `hidecolumn`: A column was hidden
  * 1st argument: The column's name
* `columnwidth`: A column was resized
  * 1st argument: The column's name
  * 2nd argument: Old width
  * 3nd argument: New width
* `filter`: A filter was applied
  * 1st argument: The column's name
  * 2nd argument: The filter keyword
  * 3nd argument: Case sensitive?
* `sort`: The data was sorted
  * 1st argument: Array of sort constructs `[{ "column": "column's name", "descending": true/false }, ...]`
* `headercontextmenu`: A context menu should be shown for a header cell
  * 1st argument: The column's name
  * 2nd argument: pageX of the pointer event
  * 3rd argument: pageY of the pointer event
  * 4th argument: the bounds of the header cell on the page `{"left": offset().left, "top": offset().top, "width": outerWidth(), "height": outerHeight()}`

- Member functions:
* `clearAndRender`: Forces a full render of the table
* `addColumn({COLUMN_OPTIONS} columnData, {String|Number} before = -1) {DGTable}`: Add a column to the table
  * **columnData**: Column properties. Same manner as in the **columns** options when initializing the DGTable
  * **before**: Column name or order to be inserted before.
  * *returns* Self, to allow for call chaining.
* `removeColumn({String} column) {DGTable}`: Remove a column from the table
  * **column**: Column name
  * *returns* Self, to allow for call chaining.
* `filter({String} column, {String} filter, {Boolean} caseSensitive=false) {DGTable}`: Remove a column from the table
  * **column**: Name of the column to filter on
  * **filter**: Check specified column for existence of this string
  * **caseSensitive**: Use caseSensitive filtering
  * *returns* Self, to allow for call chaining.
* `setColumnLabel({String} column, {String} label) {DGTable}`: Set a new label to a column
  * **column**: Name of the column
  * **label**: New label for the column
  * *returns* Self, to allow for call chaining.
* `moveColumn({String|Number} src, {String|Number} dest) {DGTable}`: Move a column to a new position
  * **src**: Name or position of the column to be moved
  * **dest**: Name of the column currently in the desired position, or the position itself
  * *returns* Self, to allow for call chaining.
* `sort({String} column, {Boolean=} descending, {Boolean=false} add) {DGTable}`: Re-sort the table
  * **src**: Name of the column to sort on
  * **descending**: Sort in descending order (if not specified, defaults to false or reverses current descending mode if sorting by same column)
  * **add**: Should this sort be on top of the existing sort? (For multiple column sort)
  * *returns* Self, to allow for call chaining.
* `setColumnVisible({String} column, {Boolean} visible) {DGTable}`: Show or hide a column
  * **column**: Unique column name
  * **visible**: New visibility mode for the column
  * *returns* Self, to allow for call chaining.
* `isColumnVisible({String} column, {Boolean} visible) {Boolean}`: Get the visibility mode of a column
  * *returns* True if visible
* `setMinColumnWidth({Number} minColumnWidth) {DGTable}`: Globally set the minimum column width
  * **minColumnWidth**: Minimum column width
  * *returns* Self, to allow for call chaining.
* `getMinColumnWidth() {Number}`: Get the current minimum column width
  * *returns* Minimum column width
* `setSortableColumns({Number} sortableColumns) {DGTable}`: Set the limit on concurrent columns sortedh
  * **sortableColumns**: Minimum column width
  * *returns* Self, to allow for call chaining.
* `getSortableColumns() {Number}`: Get the limit on concurrent columns sorted
  * *returns* How many sortable columns are allowed?
* `getHeaderRowElement() {Element}`: Get the DOM element of the header row
  * *returns* a DOM element
* `setMovableColumns({Boolean} movableColumns) {DGTable}`: *Undocumented yet*
* `getMovableColumns() {Boolean}`: *Undocumented yet*
* `setResizableColumns({Boolean} resizableColumns) {DGTable}`: *Undocumented yet*
* `getResizableColumns() {Boolean}`: *Undocumented yet*
* `setComparatorCallback({Function(String,Boolean)Function(a,b)Boolean} comparatorCallback) {DGTable}`: *Undocumented yet*
* `setColumnWidth({String} column, {Number|String} width) {DGTable}`: *Undocumented yet*
* `getColumnWidth({String} column) {String|null}`: *Undocumented yet*
* `getColumnConfig({String} column name) {SERIALIZED_COLUMN}`: *Undocumented yet*
* `getColumnsConfig() {Object}`: *Undocumented yet*
* `getSortedColumns() {Array.<SERIALIZED_COLUMN_SORT>}`: *Undocumented yet*
* `getHtmlForCell({Number} row, {String} column) {String}`: *Undocumented yet*
* `getDataForRow({Number} row) {Object}`: Gets the row data for a specific row
  * *returns* row data of the row at physical index **row**
* `getRowCount() {Number}`: Gets the number of rows
  * *returns* the number of rows
* `getDataForFilteredRow({Number} row) {Object}`: *Undocumented yet*
* `tableWidthChanged() {DGTable}`: *Undocumented yet*
* `tableHeightChanged() {DGTable}`: *Undocumented yet*
* `addRows({Object[]} data) {DGTable}`: *Undocumented yet*
* `removeRow({Number} physicalRowIndex, {Boolean=true} render) {DGTable}`: *Undocumented yet*
* `refreshRow({Number} physicalRowIndex) {DGTable}`: *Undocumented yet*
* `setRows({Object[]} data) {DGTable}`: *Undocumented yet*
* `getUrlForElementContent({string} id) {string?}`: *Undocumented yet*
* `isWorkerSupported() {Boolean}`: *Undocumented yet*
* `createWebWorker({string} url) {Worker?}`: *Undocumented yet*
* `unbindWebWorker({Worker} worker) {DGTable}`: *Undocumented yet*
* `abortCellPreview() {DGTable}`: *Undocumented yet*
* `close()`: Destroy the table and free all of its memory.

## License

All the code here is under MIT license. Which means you could do virtually anything with the code.
I will appreciate it very much if you keep an attribution where appropriate.

    The MIT License (MIT)
    
    Copyright (c) 2013 Daniel Cohen Gindi (danielgindi@gmail.com)
    
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
