// BarChart.js
import React from 'react';
import {
    XYPlot,
    XAxis, // Shows the values on x axis
    YAxis, // Shows the values on y axis
    VerticalBarSeries,
    LabelSeries
} from 'react-vis';
import PropTypes from "prop-types";

class BarChart extends React.Component {

    static propTypes = {
        barChartJson: PropTypes.instanceOf(Array),
    };

    static defaultProps = {
        data: [],
    };

    constructor(props) {
        super(props);

        this.state = {
            data: props.data
        };
    }
    render() {
        const data = this.props.data;
        const chartWidth = 400;
        const chartHeight = 350;
        const chartDomain = [0, 350];
        return (
            <XYPlot
                xType="ordinal"
                width={chartWidth}
                height={chartHeight}
                yDomain={chartDomain}
            > https://uber.github.io/react-vis/documentation/series-reference/bar-series
                <XAxis />
                <YAxis />
                <VerticalBarSeries
                    data={data}
                />
                <LabelSeries
                    data={data.map(obj => {
                        return { ...obj, label: obj.y.toString() }
                    })}
                    labelAnchorX="middle"
                    labelAnchorY="text-after-edge"
                />
            </XYPlot>
        );
    }
}
export default BarChart;