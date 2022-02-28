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
 * Style system for charts
 */
class ChartStyle
{
    constructor(options)
    {
        options = options || {};

        this._data = {
            backgroundColor: 'none',
            axisColor: 'white',
            tickLabelStyle: {
                'font-size': '9px',
                'font-family': 'monospace',
                'fill': 'white',
            }
        };

        Object.assign(this._data, options);
    }
};
Beams.ChartStyle = ChartStyle;

/**
 * Style system for the Legends
 */
class LegendStyle
{
    constructor(options)
    {
        options = options || {};

        this._data = {
            backgroundColor: 'none',
            spacing: 8,

            labelColor: 'white',
            labelSize: '12px',
            labelFont: 'monospace',

            chipSize: 16,
            chipStroke: 'none',
            chipStrokeWidth: 'none',
        };

        Object.assign(this._data, options);
    }
};
Beams.LegendStyle = LegendStyle;


/**
 * Proxy object for use with the chart system. This
 * allows us to query the dynamic _data attribute of
 * a style in a natural pattern.
 */
Beams.style_interceptor = {
    get(obj, prop, receiver) {
        return obj._data[prop];
    }
};

})();