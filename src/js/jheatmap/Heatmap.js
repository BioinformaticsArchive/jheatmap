/**
 *
 * Heatmap interactive viewer
 *
 * @author Jordi Deu-Pons
 * @class
 */
jheatmap.Heatmap = function (options) {

    /**
     * User configuration
     *
     * @type {*|{}}
     */
    this.options = options || {};

    /**
     * Sets the controls visibility.
     *
     * @type {{shortcuts: boolean, filters: boolean, columnSelector: boolean, rowSelector: boolean, cellSelector: boolean}}
     */
    this.controls = {
        "shortcuts" : true,
        "filters": true,
        "columnSelector": true,
        "rowSelector": true,
        "cellSelector": true
    };

    /**
     * Size of the cells panel
     *
     * @type {jheatmap.HeatmapSize}
     */
    this.size = new jheatmap.HeatmapSize(this);

    /**
     * Position of the first cell on the top left corner
     *
     * @property {number}   top     - Position of the first row to show on the top of the heatmap
     * @property {number}   left    - Position of the first column to show on the left of the heatmap
     */
    this.offset = {
        top:0,
        left:0
    };

    /**
     * Current search string to highlight matching rows and columns.
     * Default 'null' means no search.
     */
    this.search = null;

    /**
     * Heatmap rows
     *
     * @type {jheatmap.HeatmapDimension}
     */
    this.rows = new jheatmap.HeatmapDimension(this);

    /**
     * Heatmap columns
     *
     * @type {jheatmap.HeatmapDimension}
     */
    this.cols = new jheatmap.HeatmapDimension(this);

    /**
     * Heatmap cells
     *
     * @type {jheatmap.HeatmapCells}
     */
    this.cells = new jheatmap.HeatmapCells(this);

    /**
     * Initialize the Heatmap
     */
    this.init = function () {

        this.rows.init();
        this.cols.init();
        this.cells.init();
        this.size.init();

        // Call user init function
        if (this.options.init != undefined) {
            this.options.init(this);
        }

        // Reindex configuration. Needed to let the user use position or header id interchangeably
        this.rows.reindex(this);
        this.cols.reindex(this);
        this.cells.reindex(this);

        // Filter
        this.rows.filters.filter(this, "rows");
        this.cols.filters.filter(this, "columns");

        // Sort
        this.rows.sorter.sort(this, "rows");
        this.cols.sorter.sort(this, "columns");

        // Build & paint
        var drawer = new jheatmap.HeatmapDrawer(this);
        drawer.build();
        drawer.paint();

    };

    /**
     * Paint the cell popup on click.
     *
     * @param row       selected row
     * @param col       selected col
     * @param heatmap   the heatmap object
     * @param boxTop    top position of the details div
     * @param boxLeft   left position of the details div
     * @param details   default details div
     */
    this.paintCellDetails = function(row, col, heatmap, boxTop, boxLeft, details) {

        var value = heatmap.cells.getValues(row, col);

        if (value != null) {

            var boxWidth;
            var boxHeight;

            var boxHtml = "<dl class='dl-horizontal'>";
            boxHtml += "<dt>Column</dt><dd>" + heatmap.cols.getValue(col, heatmap.cols.selectedValue) + "</dd>";
            boxHtml += "<dt>Row</dt><dd>" + heatmap.rows.getValue(row, heatmap.rows.selectedValue) + "</dd>";
            boxHtml += "<hr />";
            for (var i = 0; i < heatmap.cells.header.length; i++) {
                if (heatmap.cells.header[i] == undefined) {
                    continue;
                }
                boxHtml += "<dt>" + heatmap.cells.header[i] + ":</dt><dd>";
                var val = value[i];
                if (!isNaN(val) && (val % 1 != 0)) {
                    val = Number(val).toFixed(3);
                }
                boxHtml += val;
                boxHtml += "</dd>";
            }
            boxHtml += "</dl>";

            details.html(boxHtml);
            boxWidth = 300;
            boxHeight = 70 + (heatmap.cells.header.length * 25);


            var wHeight = $(document).height();
            var wWidth = $(document).width();

            if (boxTop + boxHeight > wHeight) {
                boxTop -= boxHeight;
            }

            if (boxLeft + boxWidth > wWidth) {
                boxLeft -= boxWidth;
            }

            details.css('left', boxLeft);
            details.css('top', boxTop);
            details.css('width', boxWidth);
            details.css('height', boxHeight);

            details.css('display', 'block');
            details.bind('click', function () {
                $(this).css('display', 'none');
            });
        } else {
            details.css('display', 'none');
        }
    };

};
