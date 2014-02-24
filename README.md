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

## API

To create a new table, just use `var myTable = new DGTable(INIT_OPTIONS)`.

- INIT_OPTIONS
* columns: _COLUMN_OPTIONS[]_ (Array of COLUMN_OPTIONS objects)
* * name: _String_ Name of the column
* * label: _String=name_ Used for the header of this column
* * width: _Number|String_
* * * A simple number (i.e `10`, `30`, `50`) will set an absolute width for the column.
* * * A percentage (i.e `'30%'`) or a 0-1 decimal value (i.e `0.2`, `0.7`) will set a relative width for the column, out of the full table's width.
* * * Any other value, like `0`, `null` etc. will set an automatic width mode, base of the header's content length.
* * resizable: _Boolean=true_ Is this column resizable?
* * sortable: _Boolean=true_ Is this column sortable?
* * visible: _Boolean=true_ Is this column visible?
* * cellClasses: _String_ Classes to add to the TD of this cell
* height: _Number_ Suggested height for the table
* width: _DGTable.Width=DGTable.Width.NONE_ The way that the width of the table will be handled
* * DGTable.Width.NONE: No special handling
* * DGTable.Width.AUTO: Sets the width automatically
* * DGTable.Width.SCROLL: Creates a horizontal scroll when required
* virtualTable: _Boolean=true_ When set, the table will work in virtual mode, which means only the visible rows are rendered. Rows must have fixed height in this mode.
* resizableColumns: _Boolean=true_ Turns on or off the resizable columns globally.
* movableColumns: _Boolean=true_ Turns on or off the movable columns globally.
* sortableColumns: _Number=1_ How many columns can you sort by, one after another?
* adjustColumnWidthForSortArrow: _Boolean=true_ When set, the columns will automatically grow to accommodate for the sort arrow.
* relativeWidthGrowsToFillWidth: _Boolean=true_ When set, relative width columns automatically grow to fill the table's width.
* relativeWidthShrinksToFillWidth: _Boolean=true_ When set, relative width columns automatically shrink to fill the table's width.
* cellClasses: _String_ Classes to add to the TD of all cells
* sortColumn: _String|String[]|COLUMN_SORT_OPTIONS|COLUMN_SORT_OPTIONS[]_ Columns to sort by
* * Can be a column or an array of columns.
* * Each column is a _String_ or a _COLUMN_SORT_OPTIONS_:
* * column: _String_ Column name
* * descending: _Boolean=false_ Is this column sorted in descending order?
* cellFormatter: _Function(String value, String columnName)String_ *(optional)* A formatter function which will return the HTML for the cell. By default the formatter is a plain HTML formatter.
* headerCellFormatter: _Function(String value, String columnName)String_ *(optional)* A formatter function which will return the HTML for the cell's header. By default the formatter is a plain HTML formatter.
* rowsBufferSize: _Number=10_ The size of the rows buffer, for virtual table
* minColumnWidth: _Number=35_ In pixels, the minimum width for a column
* resizeAreaWidth: _Number=8_ The size of the area where you can drag to resize.
* comparatorCallback: _Function(String columnName, Boolean descending):{Function(a,b):boolean}_ A callback that can pass a comparator function for each column and mode as required.
* resizerClassName: _String='dgtable-resize'_ Class name for the dragged resizing element (showing when resizing a column)
* tableClassName: _String='dgtable'_ Class name for the table
* allowCellPreview: _Boolean=true_ When set, hovering on truncated cells will show a preview of the full content.
* cellPreviewClassName: _String='dgtable-cell-preview'_ Class name for the cell preview element
* className: _String='dgtable-wrapper'_ Backbone's wrapper element class name.
* tagName: _String='div'_ Backbone's wrapper element tag name.

- Events triggered by DGTable:
* `renderSkeleton`: The table is re-drawing it's base elements, including headers. Will always be followed by a `render` event.
* `render`: The table has finished rendering (after adding rows etc.).
* `cellPreview`: We are about to show a cell preview.
* * 1st argument: Preview's DOM element
* * 2nd argument: Row's index
* * 3rd argument: Column's name
* * At this stage you can prevent showing the preview, by calling `_table_.abortCellPreview`
* `cellPreviewDestroy`: Cell preview element is about to be destroyed after hiding
* * 1st argument: Preview's DOM element
* * 2nd argument: Row's index
* * 3rd argument: Column's name
* * You can use this event to release any resources that you may have used in `cellPreview` event.
* `rowCreate`: A row has just been created
* * 1st argument: Row's index in the currently filtered data set
* * 2st argument: Row's index in the data set
* * 3nd argument: Row's DOM TR element
* `rowDestroy`: Called just before removing a physical row element (TR) from the table
* * 1st argument: Row's DOM TR element
* `addRows`: Data rows have been added to the table
* * 1st argument: How many rows
* * 2nd argument: Is this a replace? In other word, were the old rows removed?

- Member functions:
* TODO:

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
