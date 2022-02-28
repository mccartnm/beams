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
 * Miniature structure for optionally disconnecting
 * callbacks later.
 */
class EventConnection
{
    constructor(name, callback) {
        this.name = name;
        this.callback = callback;
    }
};

/**
 * _Very_ simple event system to make it easier to work between
 * objects in Beams yay!
 */
class EventInterface
{
    constructor()
    {
        this._events = [];
    }

    on(event, callback)
    {
        var conn = new EventConnection(event, callback);
        this._events.push(conn);
        return conn;
    }

    emit(event, parameters)
    {
        this._events.forEach(e => {
            if (e.name == event)
            {
                try {
                    e.callback(parameters);
                } catch (e) {
                    console.log("Error on callback: ", e);
                }
            }
        });
    }

    disconnect(connection)
    {
        this._events = this._events.filter(
            conn => conn != connection
        );
    }
};

Beams.EventConnection = EventConnection;
Beams.EventInterface = EventInterface;

})();