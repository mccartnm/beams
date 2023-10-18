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
     
        this._loader = null;
        this._loader_g = null;
        this._loading = options.loading || false;

        this._margins = Beams.point(options.margins || [0, 0]);
        this._snap = Snap();
        this._style = new (this.StyleClass())(options.style || {});

        if (this._loading)
            this.update_loader();
    }

    StyleClass() { throw Error('StyleClass() not implemented!'); }

    get snap() { return this._snap; }
    get node() { return this._snap.node; }

    get style() {
        return new Proxy(
            this._style, Beams.style_interceptor
        );
    }

    get margins() { return this._margins; }
    set margins(margins)
    {
        this._margins = Beams.point(margins);
        this.render();
    }

    get loading() { return this._loading; }
    set loading(isLoading) {
        this._loading = isLoading;
        this.update_loader();
        this.emit('state:loading', this._loading);
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

    update_loader() {
        if (!this.loading) {
            if (this._loader_g)
                this._loader_g.attr({'display': 'none'});
            return;
        }

        // Get the box before we start any animation... things get weird
        // otherwise. The transform of our object doesn't line up the way
        // it should
        const box = this._snap.getBBox();

        if (!this._loader) {
            this._loader_g = this.snap.g();

            this._loader = this._loader_g.path();
            this._loader.attr({
                d: `M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50`,
                fill: this.style.loaderColor
            });

            // Snap.svg rotation animation is busted. Need to do it ourselves.
            // Probably just need to add our own animation tool
            this._loader.node.innerHTML = `
                <animateTransform 
                 attributeName="transform" 
                 attributeType="XML" 
                 type="rotate"
                 dur="1s" 
                 from="0 50 50"
                 to="360 50 50" 
                 repeatCount="indefinite" />`;
        }

        const lbox = this._loader_g.getBBox();

        this._loader_g.paper.append(this._loader_g);
        this._loader_g.attr({
            display: undefined
        });

        const scale = this.style.loaderScale;

        this._loader_g.node.setAttribute(
            'transform', `
                matrix(
                    ${scale}, 0, 0, ${scale},
                    ${(box.cx) - 50 * scale},
                    ${(box.cy) - 50 * scale}
                )
            `
        );
    }

    /* -- Virtual Interface -- */

    render() {}
};
Beams.Interface = Interface;

})();