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
 * Piece of a PieChart
 */
class PieData extends Beams.Data
{
    constructor(options) {
        options = options || {};
        super(options);
        this.label = options.label || 'Data';
        this.value = options.value || value;
        this.color = options.color || null;

        // -- Render Components (built during the normalize()
        //    phase of the PieChart)
        this._path = null;
        this.edge_center = null;
        this.rads = 0;
        this.isTotal = false;

        // Legend data
        this._chip = null;
        this._hoverLine = null;
        this._label = null;
    }

    // Implement Beams.Data
    legend_render(legend, snap, option) {
        // Create a small rect for the color:
        const color = Beams.utils.color.rgbColors(
            1, 0.3, option.total
        )[option.index];

        if (!this._chip)
        {
            this._chip = snap.rect();

            const event = {
                snap: snap,
                element: this._chip,
                data: new Proxy(this, data_interceptor(legend.chart))
            };

            this._chip.hover(
                // Hover In
                () => {
                    legend.chart.emit('section:hover', event);
                },

                // Hover Out
                () => {
                    legend.chart.emit('section:leave', event);
                }
            );
        }

        const p = option.topleft;
        const size = legend.style.chipSize;

        this._chip.attr({
            x: p.x,
            y: p.y,
            width: size,
            height: size,
            fill: this.color || color,
            stroke: legend.style.chipStroke
        });

        if (!this._label)
            this._label = snap.text();

        this._label.attr({
            text: legend.chart.formatLabel(this.label, this.value),
            x: p.x + size + 6,
            y: p.y + (size / 2),
            fill: legend.style.labelColor,
            'font-size': legend.style.labelSize,
            'font-family': legend.style.labelFont,
            'text-anchor': 'start',
            'dominant-baseline':'middle'
        });

        if (!this._hoverLine)
        {
            this._hoverLine = snap.line();
            this._hoverLine.attr({
                stroke: 'white'
            })
        }

        const lblbbox = this._label.getBBox();

        if (this.hovered) {
            this._hoverLine.attr({
                x1: p.x + size + 6,
                y1: p.y + size,
                x2: p.x + size + lblbbox.w,
                y2: p.y + size,
                opacity: '1',
            });
        }
        else {
            this._hoverLine.attr({ opacity: '0' });
        }

        if (legend.direction == Beams.Vertical)
            return size;

        return lblbbox.w + size;
    }

    get path() { return this._path; }
    set path(p) { this._path = p; }
};


/**
 * Proxy interceptor for catching changes to our data and
 * applying it to the chart.
 */
const data_interceptor = function(chart) {
    return {
        set(obj, prop, value) {
            obj[prop] = value;
            chart.normalize();
            chart.render();
        }
    }
}


/**
 * Implementation of a Pie Chart
 */
class PieChart extends Beams.Chart
{
    constructor(options)
    {
        options = options || {};
        super(Beams.Types.Pie, options);

        this.norm = new Beams.utils.Norm();
        this._data = [];
        this._elements = [];
        this._origin = Beams.point(0, 0);

        // Labeling (simple legend)
        this.formatLabel = options.formatLabel || ((l, v) => l);
        this.drawLabels = options.drawLabels || false;
        this._lines = [];

        this._loader = null;

        this.inject(options.inject);
        this.created(this.snap);
    }

    /* Implement Beams.Chart */
    get data() { return [...this._data]; }
    set data(values) {
        this._data = [];
        for (var i = 0; i < values.length; i++)
        {
            if (! (values[i] instanceof PieData)) {
                this._data.push(new PieData(values[i]));
            } else {
                this._data.push(values[i]);
            }
        }
        this.normalize();
        this.render();
    }

    render()
    {
        const box = this.bbox;

        if (!this.rect)
            this.rect = this.snap.rect(box.x, box.y, box.w, box.h);

        this.rect.attr({
            x: box.x,
            y: box.y,
            width: box.w,
            height: box.h,
            fill: this.style.backgroundColor
        });

        const colors = Beams.utils.color.rgbColors(
            1, 0.3, this._data.length
        );
        const colorsBright = Beams.utils.color.rgbColors(
            1, 0.5, this._data.length
        );

        var index = 0;
        const og = `${this._origin.x},${this._origin.y}`

        if (this._data.length == 1)
        {
            // We have a single element...
            var circ;
            if (this._elements.length < 1 || this._elements[0].type !== 'circle')
            {
                Beams.utils.destroy(this._elements);
                this._elements = [];

                circ = this.snap.circle(
                    this._origin.x, this._origin.y, this._radius
                );
                this._elements.push(circ);
            }
            else {
                circ = this._elements[0];
            }

            circ.attr({
                fill: this._data[0].color || colors[index],
            });
        }
        else
        {
            for (var i = 0; i < this._data.length; i++)
            {
                const pd = this._data[i];

                var path;
                if (this._elements.length <= i)
                {
                    // We need a new element
                    path = this.snap.path();
                    this._elements.push(path);

                    // Events, use the index rather than the instance
                    // to make sure we pull the correct element
                    let idx = i;
                    path.hover(
                        // Hover in
                        () => {
                            this._data[idx].hovered = true;
                            this.emit('section:hover', {
                                snap: this.snap,
                                element: path,
                                data: new Proxy(this._data[idx], data_interceptor(this))
                            })
                        },
                        // Hover Out
                        () => {
                            this._data[idx].hovered = false;
                            this.emit('section:leave', {
                                snap: this.snap,
                                element: path,
                                data: new Proxy(this._data[idx], data_interceptor(this))
                            });
                        }
                    );

                    path.click(
                        () => {
                            this.emit('section:click', {
                                snap: this.snap,
                                element: path,
                                data: new Proxy(this._data[idx], data_interceptor(this))
                            });
                        }
                    );

                    path.dblclick(
                        () => {
                            this.emit('section:dblclick', {
                                snap: this.snap,
                                element: path,
                                data: new Proxy(this._data[idx], data_interceptor(this))
                            });
                        }
                    );
                }
                else
                    path = this._elements[i];

                path.attr({
                    d: pd.path,
                    fill: pd.color || colors[index],
                    stroke: pd.color || colorsBright[index],
                    strokeWidth: '2px',
                });
                index += 1;
            }
        }

        for (var i = this._elements.length; i > this._data.length; i--)
        {
            this._elements[i].remove();
        }
        this._elements.length = this._data.length;

        // TODO - math isn't there yet. Needed to move on
        // path.animate({
        //     transform: `r${pd.rotation},${og}`},
        //     500
        // );

        Beams.utils.destroy(this._lines);
        this._lines = [];

        if (this.drawLabels)
        {
            this._data.forEach(pd => {

                if (pd.rads < (1 * (Math.PI/180)))
                    return; // Too small?

                const p1 = Beams.math.point_scale(
                    pd.edge_center, 0.8, this._origin
                );

                const p2 = Beams.math.point_scale(
                    pd.edge_center, 1.2, this._origin
                );

                var textpad = 2;
                var offset = 5;
                var left = false;
                if (p2.x < this._origin.x)
                {
                    left = true;
                    offset = -offset;
                    textpad = -textpad;
                }

                const p3 = Beams.point(p2.x + offset, p2.y);

                var linepath = this.snap.path(
                    Beams.utils.points_to_path(
                        [p1, p2, p3]
                    )
                );

                linepath.attr({
                    fill: 'none',
                    stroke: 'white'
                });
                this._lines.push(linepath);

                const lbl = this.formatLabel(pd.label, pd.value);

                var text = this.snap.text(
                    p3.x + textpad, p3.y, lbl
                );

                var style = chart.style.tickLabelStyle;
                Object.assign(style, {
                    'text-anchor': left ? 'end' : 'start',
                    'dominant-baseline':'middle'
                })
                text.attr(style);
                this._lines.push(text);

                // var circ = this.snap.circle(
                //     p.x, p.y, 2
                // );
                // circ.attr({ fill: 'white' })
                // this._elements.push(circ);
            });

        }

        this.emit('rendered');
    }

    /**
     * Generate the correct pie path data based on the current
     * settings and prep them for rendering
     */
    normalize()
    {
        this.norm = new Beams.utils.Norm();
        const full = this.bbox;

        // Build the sum
        this._data.forEach(pd => {
            this.norm.include(pd.value);
        });

        this._origin = full.center();

        this._radius = Math.min(full.w, full.h) / 2;

        if (this.drawLabels)
            this._radius -= 50;

        let sumDeg = 0;

        // Generate ratios (with a minimum slice size)
        var ratios = [];
        this._data.forEach(pd => {
            ratios.push(Math.abs(pd.value) / this.norm.total);
        });

        for (var i = 0; i < ratios.length; i++)
        {
            const pd = this._data[i];
            const ratio = ratios[i];
            const rads = ratio * 2 * Math.PI;

            // In the event we have a _massive_ value e.g. 99.999...%
            // ratio), we want to give the others a minimal buffer to
            // at least render _something_ while not causing the
            // solver to explode.
            if (Beams.math.fuzzy_float(rads, 0))
            {
                // Take from the largest
                const large = Math.max(...ratios);
                ratios[i] = 0.001;
                const idx  = ratios.indexOf(large)
                ratios[idx] -= 0.001;
            }
        }

        for (var i = 0; i < this._data.length; i++)
        {
            const o = this._origin; const r = this._radius;

            const pd = this._data[i];
            const ratio = ratios[i];

            if (ratio < 1)
            {
                const rads = ratio * 2 * Math.PI;

                const point2 = Beams.math.point_rotate(
                    Beams.point(o.x + r, o.y), sumDeg, o
                );

                pd.edge_center = Beams.math.point_rotate(
                    point2, rads / 2, o
                )

                const point3 = Beams.math.point_rotate(
                    point2, rads, o
                );

                const f1 = rads > Math.PI ? 1:0;
                const f2 = rads < Math.PI ? 0:1;

                // Origin
                var path = `M${o.x} ${o.y}`;

                // To Edge
                path += `L${point2.x} ${point2.y}`;
                // path += `L${point3.x} ${point3.y}`;

                // Arc Around
                path += `A${r} ${r} 0 ${f1} 1 ${point3.x} ${point3.y}`;

                // Return To Origin
                path += `Z`;

                // Filll in the component data
                pd.isTotal = false;
                pd.path = path;
                pd.rads = rads;

                sumDeg += rads;
            }
            else
            {
                // Cover the entire component
                pd.isTotal = true;
                pd.edge_center = Beams.point(
                    o.x + r, o.y
                );
                pd.rad = 6.28319; // Full circle
            }
        }
    }
};
Beams.PieChart = PieChart;
Beams.Types.Pie = 'Pie';

})();