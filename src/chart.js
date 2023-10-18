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
 * Style system for charts
 */
class ChartStyle extends Beams.Style
{
    defaults() {
        return {
            backgroundColor: 'none',
            axisColor: 'white',
            tickLabelStyle: {
                'font-size': '9px',
                'font-family': 'monospace',
                'fill': 'white',
            }
        };
    }
};
Beams.ChartStyle = ChartStyle;

/**
 * Base class to provide common chart components
 */
class Chart extends Beams.Interface
{
    constructor(type, options) {
        options = options || {};
        super(options);
        this.type = type;

        // Optional routine callbacks
        this.created = options.created || (() => {});
    }

    StyleClass() { return ChartStyle; }

    /* -- Virtual interface --  */

    get data() { throw Error('data getter is requried!'); }
    set data(data) { throw Error('data setter is requried!'); }
};
Beams.Chart = Chart;

})();