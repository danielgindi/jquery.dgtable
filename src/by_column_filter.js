'use strict';

function ByColumnFilter (row, args) {
    
    let column = args.column;
    let keyword = args.keyword == null ? '' : args.keyword.toString();
    
    if (!keyword || !column) return true;

    let actualVal = row[column];
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

export default ByColumnFilter;