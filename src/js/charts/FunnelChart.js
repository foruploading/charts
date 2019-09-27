import AggregationChart from './AggregationChart';
import { getOffset } from '../utils/dom';
import { getComponent } from '../objects/ChartComponents';
import { getEndpointsForTrapezoid } from '../utils/draw-utils'
import { FUNNEL_CHART_BASE_WIDTH } from '../utils/constants';

export default class FunnelChart extends AggregationChart {
	constructor(parent, args) {
		super(parent, args);
		this.type = 'funnel';
		window.funnel = this;
		this.setup();
	}

	calc() {
		super.calc();
		let s = this.state;
		// calculate width and height options
		const baseWidth = FUNNEL_CHART_BASE_WIDTH;
		const totalheight = (Math.sqrt(3) * baseWidth) / 2.0;

		// calculate total weightage
		// as height decreases, area decreases by the square of the reduction
		// hence, compensating by squaring the index value

		const reducer = (accumulator, currentValue, index) => accumulator + currentValue * (Math.pow(index+1, 2));
		const weightage = s.sliceTotals.reduce(reducer, 0.0);

		let slicePoints = [];
		let startPoint = [[0, 0], [FUNNEL_CHART_BASE_WIDTH, 0]]
		s.sliceTotals.forEach((d, i) => {
			let height = totalheight * d * Math.pow(i+1, 2) / weightage;
			let endPoint = getEndpointsForTrapezoid(startPoint, height);
			slicePoints.push([startPoint, endPoint]);
			startPoint = endPoint;
		})
		s.slicePoints = slicePoints;
	}

	setupComponents() {
		let s = this.state;

		let componentConfigs = [
			[
				'funnelSlices',
				{ },
				function() {
					return {
						slicePoints: s.slicePoints,
						colors: this.colors
					};
				}.bind(this)
			]
		];

		this.components = new Map(componentConfigs
			.map(args => {
				let component = getComponent(...args);
				return [args[0], component];
			}));
	}

	makeDataByIndex() { }

	bindTooltip() {
		// let s = this.state;
		// this.container.addEventListener('mousemove', (e) => {
		// 	let bars = this.components.get('percentageBars').store;
		// 	let bar = e.target;
		// 	if(bars.includes(bar)) {

		// 		let i = bars.indexOf(bar);
		// 		let gOff = getOffset(this.container), pOff = getOffset(bar);

		// 		let x = pOff.left - gOff.left + parseInt(bar.getAttribute('width'))/2;
		// 		let y = pOff.top - gOff.top;
		// 		let title = (this.formattedLabels && this.formattedLabels.length>0
		// 			? this.formattedLabels[i] : this.state.labels[i]) + ': ';
		// 		let fraction = s.sliceTotals[i]/s.grandTotal;

		// 		this.tip.setValues(x, y, {name: title, value: (fraction*100).toFixed(1) + "%"});
		// 		this.tip.showTip();
		// 	}
		// });
	}
}
