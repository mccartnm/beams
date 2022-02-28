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
 * An Axis defines some factor of data that we want to visualize.
 * 
 * You provide two (X and Y) to the line chart below.
 */
class Axis extends Beams.EventInterface
{
    constructor(options)
    {
        super();

        options = options || {};
        this.label = options.label || 'Data';
        this.tickLabel = options.tickLabel || ((c, v) => v);
        this.labelClass = options.labelClass || '';
        this.labelVisible = options.labelVisible || false;
        this.buffer = options.buffer || 15;
        this.padding = options.padding || 5;

        this.tickCount = options.tickCount || 5;
        this.showTicks = options.showTicks || true;
        this.showTickLabels = options.showTickLabels;
        if (this.showTickLabels === undefined)
            this.showTickLabels = this.showTicks;

        this._elements = [];
        this._axis = null;
    }

    set_axis(axis)
    {
        this._axis = axis;
    }

    render(chart, snap)
    {
        Beams.utils.destroy(this._elements);
        this._elements = [];

        if (chart.type == Beams.Types.Line)
        {
            var bounds = chart.bboxes();
            var line;
            if (this._axis == Axis.X)
            {
                const bbox = bounds.xaxis;

                line = snap.line(
                    bbox.x, bbox.y,
                    bbox.x + bbox.w, bbox.y
                );

                // Ticks:
                if (this.showTicks || this.showTickLabels)
                {
                    var offset = this.padding;
                    const o = bbox.w - this.padding * 2;
                    const delta = o / Math.max(this.tickCount, 1);
                    for (var i = 0; i <= this.tickCount; i++)
                    {
                        const shift = offset + (delta * i);
                        if (this.showTicks)
                        {
                            var tick = snap.line(
                                bbox.x + shift,
                                bbox.y,
                                bbox.x + shift,
                                bbox.y + 5,
                            );
                            tick.attr({
                                stroke: chart.style.axisColor
                            });
                            this._elements.push(tick);
                        }

                        if (this.showTickLabels)
                        {
                            const text = this.tickLabel(
                                chart, chart.x_norm.value_at(
                                    i / this.tickCount)
                            );
                            var telement = snap.text(
                                bbox.x + shift,
                                bbox.y + 12,
                                text
                            );
                            var style = chart.style.tickLabelStyle;
                            Object.assign(style, {
                                'text-anchor': 'middle',
                                'dominant-baseline':'middle'
                            })
                            telement.attr(style);
                            this._elements.push(telement);
                        }
                    }
                }
            }
            else
            {
                const bbox = bounds.yaxis;

                line = snap.line(
                    bbox.x + bbox.w, bbox.y,
                    bbox.x + bbox.w, bbox.y + bbox.h
                );

                // Ticks:
                if (this.showTicks || this.showTickLabels)
                {
                    var offset = this.padding;
                    const delta = (bbox.h - this.padding * 2) / Math.max(this.tickCount, 1);
                    for (var i = this.tickCount; i >= 0; i--)
                    {
                        const shift = offset + (delta * i);
                        if (this.showTicks)
                        {
                            var tick = snap.line(
                                bbox.x + bbox.w - 5,
                                bbox.y + shift,
                                bbox.x + bbox.w,
                                bbox.y + shift,
                            );
                            tick.attr({
                                stroke: chart.style.axisColor
                            });
                            this._elements.push(tick);
                        }

                        if (this.showTickLabels)
                        {
                            const text = this.tickLabel(
                                chart, chart.y_norm.value_at(
                                    (this.tickCount - i) / this.tickCount)
                            );
                            var telement = snap.text(
                                bbox.x + bbox.w - 8,
                                bbox.y + shift,
                                text
                            );
                            var style = chart.style.tickLabelStyle;
                            Object.assign(style, {
                                'text-anchor': 'end',
                                'dominant-baseline':'middle'
                            })
                            telement.attr(style);
                            this._elements.push(telement);
                        }
                    }
                }
            }

            line.attr({
                stroke: chart.style.axisColor
            });
            this._elements.push(line);
        } // end LineChart rendering
    }
};
Axis.X = 'X';
Axis.Y = 'Y';

Beams.Axis = Axis;


/**
 * Proxy utility for a chart axis
 */
Beams.axis_interceptor = {
    set(obj, prop, value) {
        obj[prop] = value;
        obj.emit('changed');
    }
};


})();