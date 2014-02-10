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
