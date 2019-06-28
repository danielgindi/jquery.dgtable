/* eslint-env browser */

'use strict';

// saveSelection/restoreSelection courtesy of Tim Down, with my improvements
// https://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376

function isChildOf(child, parent) {
  while ((child = child.parentNode) && child !== parent); 
  return !!child; 
}

class SelectionHelper {
    
    static saveSelection(el) {
        let range = window.getSelection().getRangeAt(0);
        
        if (el !== range.commonAncestorContainer && !isChildOf(range.commonAncestorContainer, el))
            return null;
        
        let preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(el);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        let start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length,
        };
    }
    
    static restoreSelection(el, savedSel) {
        let charIndex = 0;
        let nodeStack = [el], node, foundStart = false, stop = false;
        let range = document.createRange();
        range.setStart(el, 0);
        range.collapse(true);
        
        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                let nextCharIndex = charIndex + node.length;
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
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

export default SelectionHelper;
