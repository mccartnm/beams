/*
    Copyright (c) 2022 Michael McCartney

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
(function(){

/**
 * Root class for objects that provide some kind of rendering routine
 */
class Interface extends Beams.EventInterface
{
    constructor(options) {
        options = options || {};
        super(options);
     
        this._margins = Beams.point(options.margins || [0, 0]);
        this._snap = Snap();
    }

    get snap() { return this._snap; }
    get node() { return this._snap.node; }

    get margins() { return this._margins; }
    set margins(margins)
    {
        this._margins = Beams.point(margins);
        this.render();
    }

    /**
     * Bounding box for this element, accounting for the margins
     * { x, y, w, h }
     */
    get bbox() {
        return {
            x: this.margins.x,
            y: this.margins.y,
            w: this.node.clientWidth - (this.margins.x * 2),
            h: this.node.clientHeight - (this.margins.y * 2),

            center() {
                return Beams.point(
                    this.x + (this.w / 2),
                    this.y + (this.h / 2),
                );
            }
        }
    }

    /**
     * Give a snap interface, put it onto our DOM
     */
    inject(element) {
        if (element)
        {
            var place = element;
            if (typeof (element) === 'string')
            {
                var id = element.replace(/^#/, '');
                place = document.getElementById(id);
            }
            place.appendChild(this.node);
            this.render();
        }
    }

    /* -- Virtual Interface -- */

    render() {}
};
Beams.Interface = Interface;

})();