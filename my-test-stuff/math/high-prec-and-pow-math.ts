import { div, log } from "@/utils/log";

const logSmallNumbers = (min = 307, max = 330) => {
	const baseStr = "9.999999999999e-";

	for (let i = min; i < max; i++) {
		const nStr = `${baseStr}${i.toString()}`;

		const n = Number(nStr);

		log(`nStr: ${nStr}, n: ${n}`);
	}
};

const logDeltaHighPrecNumbers = (
	min = -290,
	max = -330,
	prec: number = 15
) => {
	const calcExpected = (pow: number, precision: number) => {
		return pow - (precision - 1);
	};

	const midStr = "9".repeat(prec - 3);
	const baseStrA = "9.9" + midStr + "9e";
	const baseStrB = "9.9" + midStr + "8e";

	for (let i = min; i <= max; i++) {
		const aStr = `${baseStrA}${i.toString()}`;
		const a = Number(aStr);
		const bStr = `${baseStrB}${i.toString()}`;
		const b = Number(bStr);
		const d = a - b;
		const e = 10 ** calcExpected(i, prec);

		log(`aStr: ${aStr}, a: ${a}`);
		log(`bStr: ${bStr}, b: ${b}`);
		log("      1234567890123456        1234567890123456     ");
		log(`   a - b = ${d}`);
		log(`   a - b = ${d.toPrecision(1)}`);
		log(`expected:  ${e.toPrecision(1)}`);
		div();
	}
};

const logProdHighPrecNumbers = (
	min = -290,
	max = -330,
	prec: number = 15
) => {
	const midStr = "9".repeat(prec - 3);
	const baseStrA = "9.9" + midStr + "9e";
	const baseStrB = "9.9" + midStr + "8e";
	// const baseStrA = "9.99999999999999e";
	// const baseStrB = "9.99999999999998e";
	//                1 23456789012345

	for (let i = min; i <= max; i++) {
		const aStr = `${baseStrA}${i.toString()}`;
		const a = Number(aStr);
		const bStr = `${baseStrB}${i.toString()}`;
		const b = Number(bStr);
		const prod = a * b;
		const prodA = a * a;

		log(`aStr: ${aStr}, a: ${a}`);
		log(`bStr: ${bStr}, b: ${b}`);
		log("      1234567890123456        1234567890123456     ");
		log(`   a * a = ${prodA.toPrecision(prec)}`);
		log(`   a * b = ${prod.toPrecision(prec)}`);
		div();
	}
};

// div();
// logSmallNumbers();
// logDeltaHighPrecNumbers(-320, -290, 14);
// logProdHighPrecNumbers(-30, -20, 15);
