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


class LineData extends Beams.Data
{
    constructor(options) {
        options = options || {};
        super(options);
        this.points = options.data;
        this.color = options.color || 'lightgreen';
    }
};
Beams.LineData = LineData;

/**
 * A Line Chart 
 */
class LineChart extends Beams.Chart
{
    constructor(options)
    {
        options = options || {};
        super(Beams.Types.Line, options);

        this.xaxis = options.x || new Axis();
        this.xaxis.set_axis(Beams.Axis.X);
        this.xaxis.on('changed', this.render.bind(this));

        this.yaxis = options.y || new Axis();
        this.yaxis.set_axis(Beams.Axis.Y);
        this.yaxis.on('changed', this.render.bind(this));

        this._point_sort = options.sort || null;

        this._data = [];   //< Raw Point Data
        this._elements = []; //< Snap elements
        this._draw_positions = []; //< Real positions

        this.x_norm = new Beams.utils.Norm();
        this.y_norm = new Beams.utils.Norm();

        this.inject(options.inject);
        this.created(this.snap);
    }

    get x() { return new Proxy(this.xaxis, Beams.axis_interceptor); }
    get y() { return new Proxy(this.yaxis, Beams.axis_interceptor); }

    /* Implement Beams.Chart */
    get data() { return [...this._data]; }
    set data(data)
    {
        if (data instanceof LineData)
            this._data = [data];
        else if (Array.isArray(data))
        {
            this._data = [];
            data.forEach(p => {
                if (p instanceof LineData)
                    this._data.push(p);
                else
                    this._data.push(new LineData(p))
            });
        }
        else
            this._data = [new LineData(data)];

        this.normalize();
        this.render();
    }

    /**
     * Render the graph. This will reconstruct the svg elements
     * to give us a clean space to work in. Perhaps in a future
     * pass this could reuse elements to support animation or
     * caching but for now this should be fine.
     */
    render()
    {
        // Render the path:
        // ...
        Beams.utils.destroy(this._elements);
        this._elements = [];

        const sizes = this.bboxes();
        var r = this.snap.rect(sizes.data.x, sizes.data.y, sizes.data.w, sizes.data.h);
        r.attr({ fill: this.style.backgroundColor });
        this._elements.push(r);

        for (var i = 0; i < this._data.length; i++)
        {
            const path = Beams.utils.points_to_path(this._draw_positions[i]);

            var line = this.snap.path(path);
            line.attr({
                fill: 'none',
                stroke: this._data[i].color,
                strokeWidth: '2px',
            });
            this._elements.push(line);

        }

        // Render each Axis
        this.xaxis.render(this, this.snap);
        this.yaxis.render(this, this.snap);


        // Render points (include anything special?)
        // for (var i = 0; i < this._draw_positions.length; i++)
        // {
        //     const point = this._draw_positions[i];
        //     var circ = this.snap.circle(
        //         point.x, point.y, 4
        //     );

        //     circ.attr({
        //         fill: 'lightgreen',
        //         stroke: 'white',
        //         strokeWidth: '1px'
        //     })

        //     // ::TODO::
        //     // const x = i;
        //     // circ.hover(() => {
        //     //     console.log("here", this._data[x]);
        //     // });

        //     this._elements.push(circ);
        // }
        this.emit('rendered');
    }

    /**
     * Create a set of bounding boxes that make up the chart
     * 
     *    \/ yaxis
     *  +--------------------------------+
     *  |   |                            |
     *  |   |                            | < data
     *  |   |                            |
     *  |   |                            |
     *  +---+----------------------------+
     *  .   |                            | < xaxis
     *  ....+----------------------------+
     *  \_________________ _____________/
     *                  full
     * 
     * {
     *   'xaxis': { x, y, w, h },
     *   'yaxis': { x, y, w, h },
     *   'data': { x, y, w, h },
     *   'full': { x, y, w, h },
     *   'margins': { x, y }
     * }
     */
    bboxes()
    {
        var full = this.bbox;

        const output = {
            margins: {
                x: this.margins.x,
                y: this.margins.y
            },

            full,

            xaxis: {
                x: full.x + this.y.buffer,
                y: full.h - this.x.buffer,
                w: full.w - this.y.buffer,
                h: this.x.buffer
            },

            yaxis: {
                x: full.x,
                y: full.y,
                w: this.y.buffer,
                h: full.h - this.x.buffer - this.margins.y
            },

            data: {
                x: full.x + this.y.buffer,
                y: full.y,
                w: full.w - this.y.buffer,
                h: full.h - this.x.buffer - this.margins.y
            }
        };
        return output;
    }

    /**
     * Given the data points, build the normalization parameters
     * to fit the graph in our view
     */
    normalize()
    {
        // Normals [low, high]
        this.x_norm = new Beams.utils.Norm();
        this.y_norm = new Beams.utils.Norm();
        this._draw_positions = [];

        this._data.forEach(ld => {

            if (this._point_sort)
                ld.points.sort(this._point_sort)

            ld.points.forEach(point => {
                this.x_norm.include(point[0]);
                this.y_norm.include(point[1]);
            });

            this._draw_positions.push([]);
        });

        // Use the available space to generate 
        const sizes = this.bboxes();
        for (var i = 0; i < this._data.length; i++)
        {
            const lineData = this._data[i];
            var positions = this._draw_positions[i];

            lineData.points.forEach(point => {
                positions.push(Beams.point(
                    this.x_norm.calculate(
                        sizes.data.x + this.x.padding,
                        sizes.data.w - this.x.padding * 2,
                        point[0]
                    ),

                    // We use the y margin 
                    this.y_norm.calculate(
                        sizes.data.y + this.y.padding,
                        sizes.data.h - this.y.padding * 2,
                        point[1],
                        true
                    )
                ));
            });
        }
    }
};
Beams.LineChart = LineChart;
Beams.Types.Line = 'Line';

})();
