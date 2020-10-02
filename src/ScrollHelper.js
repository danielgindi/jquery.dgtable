/* eslint-env browser */

let rtlScrollType;

const detectRtlScrollType = () => {
    const definer = document.createElement('div');
    definer.dir = 'rtl';
    Object.assign(definer.style, {
        direction: 'rtl',
        fontSize: '14px',
        width: '1px',
        height: '1px',
        position: 'absolute',
        top: '-1000px',
        overflow: 'scroll',
    });
    definer.textContent = 'A';
    document.body.appendChild(definer);

    let type = 'reverse';

    if (definer.scrollLeft > 0) {
        type = 'default';
    } else {
        definer.scrollLeft = 1;
        if (definer.scrollLeft === 0) {
            type = 'negative';
        }
    }

    definer.parentNode.removeChild(definer);

    return type;
};

class ScrollHelper {

    /**
     * @param {HTMLElement} el
     * @param {boolean|undefined} [rtl]
     * @returns {number}
     */
    static normalizeScrollLeft(el, rtl) {
        if (rtl === undefined) {
            rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
        }

        if (rtl === true && rtlScrollType === undefined) {
            rtlScrollType = detectRtlScrollType();
        }

        if (rtl) {
            switch (rtlScrollType) {
                case 'negative':
                    return el.scrollLeft + el.scrollWidth - el.clientWidth;

                case 'reverse':
                    return el.scrollWidth - el.scrollLeft - el.clientWidth;

                default:
                    return el.scrollLeft;
            }
        } else {
            return el.scrollLeft;
        }
    }

    /**
     * @param {HTMLElement} el
     * @param {boolean|undefined} [rtl]
     * @param {number} value
     * @returns {number}
     */
    static denormalizeScrollLeft(el, rtl, value) {
        if (rtl === undefined) {
            rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
        }

        if (rtl === true && rtlScrollType === undefined) {
            rtlScrollType = detectRtlScrollType();
        }

        if (rtl) {
            switch (rtlScrollType) {
                case 'negative':
                    return value - el.scrollWidth + el.clientWidth;

                case 'reverse':
                    return el.scrollWidth - value - el.clientWidth;

                default:
                    return value;
            }
        } else {
            return value;
        }
    }

    static scrollLeftNormalized(el, x) {
        if (x === undefined) {
            return ScrollHelper.normalizeScrollLeft(el, undefined);
        } else {
            el.scrollLeft = ScrollHelper.denormalizeScrollLeft(el, undefined, x);
        }
    }

    /**
     * @param {HTMLElement} el
     * @param {boolean|undefined} [rtl]
     * @returns {number}
     */
    static normalizeScrollHorz(el, rtl) {
        if (rtl === undefined) {
            rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
        }
        if (rtl) {
            return el.scrollWidth - el.clientWidth - ScrollHelper.normalizeScrollLeft(el, rtl);
        } else {
            return ScrollHelper.normalizeScrollLeft(el, rtl);
        }
    }

    /**
     * @param {HTMLElement} el
     * @param {boolean|undefined} [rtl]
     * @param {number} value
     * @returns {number}
     */
    static denormalizeScrollHorz(el, rtl, value) {
        if (rtl === undefined) {
            rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
        }

        if (rtl) {
            return ScrollHelper.denormalizeScrollLeft(el, rtl, el.scrollWidth - el.clientWidth - value);
        } else {
            return ScrollHelper.denormalizeScrollLeft(el, rtl, value);
        }
    }

    /**
     * @param {HTMLElement} el
     * @param {number|undefined} [x]
     * @returns {number|undefined}
     */
    static scrollHorzNormalized(el, x) {
        if (x === undefined) {
            return ScrollHelper.normalizeScrollHorz(el);
        } else {
            el.scrollLeft = ScrollHelper.denormalizeScrollHorz(el, undefined, x);
        }
    }
}

export default ScrollHelper;
