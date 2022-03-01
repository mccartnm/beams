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
(function() {

/**
 * A basic legend for displaying chart data plot information
 */
class Legend extends Beams.Interface
{
    constructor(options) {
        options = options || {};
        super(options);
        this._chart = options.chart || null;
        this._chart.on('rendered', this.render.bind(this));
        this._style = new Beams.LegendStyle(options.style);

        this.direction = options.direction || Beams.Vertical;

        this.inject(options.inject);
    }

    get chart() { return this._chart; }
    get style() { return new Proxy(this._style, Beams.style_interceptor); }

    render()
    {
        const d = this._chart.data;
        const box = this.bbox;

        var topleft = Beams.point(box.x, box.y);

        for (var i = 0; i < d.length; i++)
        {
            const option = {
                chart: this._chart,
                topleft: topleft,
                index: i,
                total: d.length
            };

            var offset = d[i].legend_render(
                this, this.snap, option
            );
            offset += this.style.spacing;

            if (this.direction == Beams.Vertical)
                topleft.y += offset;
            else
                topleft.x += offset;
        }
    }
};
Beams.Legend = Legend;

})();