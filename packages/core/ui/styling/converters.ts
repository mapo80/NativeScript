import { Enums } from '../enums';

const STYLE_CURVE_MAP = Object.freeze({
	ease: Enums.AnimationCurve.ease,
	linear: Enums.AnimationCurve.linear,
	'ease-in': Enums.AnimationCurve.easeIn,
	'ease-out': Enums.AnimationCurve.easeOut,
	'ease-in-out': Enums.AnimationCurve.easeInOut,
	spring: Enums.AnimationCurve.spring,
});

export function timeConverter(value: string): number {
	let result = parseFloat(value);
	if (value.indexOf('ms') === -1) {
		result = result * 1000;
	}

	return Math.max(0.0, result);
}

export function animationTimingFunctionConverter(value: string): any {
	return value ? STYLE_CURVE_MAP[value] || parseCubicBezierCurve(value) : Enums.AnimationCurve.ease;
}

function parseCubicBezierCurve(value: string) {
	const coordsString = /\((.*?)\)/.exec(value);
	const coords = coordsString && coordsString[1].split(',').map(stringToBezieCoords);

	if (value.startsWith('cubic-bezier') && coordsString && coords.length === 4) {
		const [x1, x2, y1, y2] = [...coords];

		return Enums.AnimationCurve.cubicBezier(x1, x2, y1, y2);
	} else {
		throw new Error(`Invalid value for animation: ${value}`);
	}
}

function stringToBezieCoords(value: string): number {
	let result = parseFloat(value);
	if (result < 0) {
		return 0;
	} else if (result > 1) {
		return 1;
	}

	return result;
}
