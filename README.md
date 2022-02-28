# beams
Another JavaScript Chart Rending Library.

This one uses Snap.svg to make life a bit easier.

[!basics](./images/basics.jpg)

## Example

```html
<body>
    <div id="put-chart-here"></div>
</body>
<script>

    // Create the chart. Define the Axis
    var lchart = new Beams.LineChart({
        inject: '#put-lchart-here',
        margins: [5, 5],

        x: new Beams.Axis({
            label: 'Time',
            labelVisible: false,
            buffer: 10,
            padding: 10,
            showTickLabels: false
        }),

        y: new Beams.Axis({
            label: 'Total',
            labelClass: 'label-title',
            labelVisible: true,
            buffer: 40,
            padding: 10,
            tickCount: 3
        }),
    });

    // Add a couple plots
    lchart.data = [
        new Beams.LineData({
            data: [
                [1, 231],
                [2, 22222],
                [3, 0],
                [4, 9200],
                [5, 39200],
                [6, 210000],
                [7, 0],
                [8, 0],
                [9, 20200],
                [10, 2230200],
                [11, 5233300],
            ],
            color: 'rgb(12, 12, 200)'
        }),
        new Beams.LineData({
            data: [
                [1, 0],
                [2, 0],
                [3, 1233000],
                [4, 2139200],
                [5, 4039200],
                [6, 900000],
                [7, 0],
                [8, 0],
                [9, 2039200],
                [10, 2230200],
                [11, 523300],
            ],
            color: 'lightgreen'
        }),
    ];

</script>
````
