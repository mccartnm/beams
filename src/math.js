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
 * Run-of-the-mill point object
 */
class Point
{
    constructor(x, y) { this.x = x; this.y = y; }
};
Beams.Point = Point;
Beams.point = function() {
    if (arguments.length == 1)
    {
        if (Array.isArray(arguments[0]))
            return new Point(arguments[0][0], arguments[0][1]);

        // Assume we're doing a copy
        return new Point(arguments.x, arguments.y);
    }
    return new Point(arguments[0], arguments[1]);
}

Beams.math = {
    point_add(a, b) {
        return new Point(a.x + b.x, a.y + b.y);
    },

    point_sub(a, b) {
        return new Point(a.x - b.x, a.y - b.y);
    },

    point_mul(a, b) {
        return new Point(a.x * b.x, a.y * b.y);
    },

    point_div(a, b) {
        return new Point(a.x / b.x, a.y / b.y);
    },

    point_rotate(point, radians, origin) {
        origin = origin || Beams.point(0, 0);
        const pad = this.point_sub(point, origin);

        return Beams.point(
            (pad.x * Math.cos(radians)) - (pad.y * Math.sin(radians)) + origin.x,
            (pad.y * Math.cos(radians)) + (pad.x * Math.sin(radians)) + origin.y
        );
    },

    point_scale(point, ratio, origin) {
        origin = origin || Beams.point(0, 0);
        const offset = this.point_sub(point, origin);

        return this.point_add(
            Beams.point(
                offset.x * ratio,
                offset.y * ratio
            ),
            origin
        );
    },

    fuzzy_float(a, b, epsilon) {
        if (epsilon === undefined)
            epsilon = 0.0002;
        return Math.abs(a - b) <= epsilon;
    },
};


})();