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

Beams.utils = {

    /**
     * Given an attay of Snap Elements, remove each one of
     * them from their parent
     * 
     * :param elements: ``Array[Element,]``
     */
    destroy(elements)
    {
        for (var i = 0; i < elements.length; i++)
            elements[i].remove();
    },

    /**
     * Giben a array of points, generate a path svg string
     * 
     * :param points: ``Array[Beams.Point,]``
     * :return: ``String``
     */
    points_to_path(points) {
        var path = '';
        for (var i = 0; i < points.length; i++)
        {
            var char = i == 0 ? 'M' : 'L';
            const point = points[i];
            path += `${char}${point.x} ${point.y}`
        }
        return path;
    },

    color: {
        rgbColors (saturation, lightness, amount) {
            let colors = [];
            let huedelta = Math.trunc(180 / amount);

            for (let i = 0; i < amount; i++) {
                let hue = i * huedelta
                const rgb = this.hsl2rgb(hue, saturation, lightness)
                colors.push(
                    `rgb(${rgb[0]*255},${rgb[1]*255},${rgb[2]*255})`
                );
            }

            return colors
        },

        hsl2rgb(h,s,l) 
        {
           let a=s*Math.min(l,1-l);
           let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
           return [f(0),f(8),f(4)];
        } 
    },
};

/**
 * Normalization tool for building charts that inspect a select
 * amount of space. Does basic calculations for the chart
 * management.
 */
class Norm
{
    constructor() {
        this.high = null;
        this.low = null;
        this.total = 0;
    }
    
    include(val)
    {
        this.high = (this.high === null ?
            val : Math.max(this.high, val)
        );
        this.low = (this.low === null ? 
            val : Math.min(this.low, val)
        );

        if (!isNaN(val))
            this.total += val;
    }

    get difference()
    {
        return Math.abs(this.high - this.low);
    }

    calculate(offset, size, value, oneminus)
    {
        var percent = (value - this.low) / Math.max(this.difference, 1);;

        var val;
        if (oneminus)
            val = offset + (1 - (size * percent) + size);
        else
            val = offset + (size * percent);

        return val;
    }

    value_at(percent)
    {
        return (percent * this.difference) + this.low;
    }
};
Beams.utils.Norm = Norm;

})();