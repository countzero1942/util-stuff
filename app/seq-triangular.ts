import { log, logh } from "@/utils/log";
import { round } from "@/utils/math";
import { MathSumSeq, NumSeq, Seq } from "@/utils/seq";

const format = (x: number) => {
	return Intl.NumberFormat().format(x);
};

const sumOfDigits = (x: number) => {
	const s = x.toString();
	let sum = 0;
	for (const sd of s) {
		sum += Number(sd);
	}

	if (sum < 10) {
		return sum;
	}
	return sumOfDigits(sum);
};

const isPerfectSquare = (x: number) => {
	const r = round(Math.sqrt(x), 12);
	return r === Math.floor(r);
};

const isPerfectCube = (x: number) => {
	const r = round(Math.cbrt(x), 12);
	return r === Math.floor(r);
};

export const triangularsSeq = (count: number) => {
	const seq = MathSumSeq.from(x => x)
		.take(count)
		.imap((i, sum) => {
			const num = i + 1;
			const digitsum = sumOfDigits(sum);
			return { num, sum: format(sum), digitsum };
		});
	return seq;
};

export const squareNumTriangularSeq = (count: number) => {
	const seq = MathSumSeq.from(x => x)
		.take(count)
		.imap((i, sum) => {
			const num = i + 1;
			return { num, sum };
		})
		.filter(x => isPerfectSquare(x.num))
		.map(x => {
			const { num, sum } = x;
			const root = Math.sqrt(num);
			const digitsum = sumOfDigits(sum);
			return { num, root, sum: format(sum), digitsum };
		});
	return seq;
};

export const squareSumTriangularSeq = (count: number) => {
	const seq = MathSumSeq.from(x => x)
		.take(count)
		.imap((i, sum) => {
			const num = i + 1;
			return { num, sum };
		})
		.filter(x => isPerfectSquare(x.sum))
		.map(x => {
			const { num, sum } = x;
			const root = Math.sqrt(sum);
			const digitsum = sumOfDigits(sum);
			return { num, sum: format(sum), root, digitsum };
		});
	return seq;
};

export const cubicNumTriangularSeq = (count: number) => {
	const seq = MathSumSeq.from(x => x)
		.take(count)
		.imap((i, sum) => {
			const num = i + 1;
			return { num, sum };
		})
		.filter(x => isPerfectCube(x.num))
		.map(x => {
			const { num, sum } = x;
			const root = Math.cbrt(num);
			const digitsum = sumOfDigits(sum);
			return { num, root, sum: format(sum), digitsum };
		});
	return seq;
};

export const cubicSumTriangularSeq = (count: number) => {
	const seq = MathSumSeq.from(x => x)
		.take(count)
		.imap((i, sum) => {
			const num = i + 1;
			return { num, sum };
		})
		.filter(x => isPerfectCube(x.sum))
		.map(x => {
			const { num, sum } = x;
			const root = Math.sqrt(sum);
			const digitsum = sumOfDigits(sum);
			return { num, sum: format(sum), root, digitsum };
		});
	return seq;
};

const div = () => {
	log(40);
};

export const logTriangularSeq = (count: number) => {
	const sc = Intl.NumberFormat().format(count);
	logh(`Triangular Numbers: count: ${sc}`);

	const seq = triangularsSeq(count);

	seq.foreach(x => log(x));
	div();
	const last = seq.last();
	log("Last:");
	log(last);
	div();
	log(`Element count: ${seq.count()}`);
	div();
};

export const logSquareNumTriangularSeq = (count: number) => {
	const sc = Intl.NumberFormat().format(count);
	logh(`Square-Num Triangular Numbers: count: ${sc}`);

	const seq = squareNumTriangularSeq(count);

	seq.foreach(x => log(x));
	div();
	const last = seq.last();
	log("Last:");
	log(last);
	div();
	log(`Element count: ${seq.count()}`);
	div();
};

export const logSquareSumTriangularSeq = (count: number) => {
	const sc = Intl.NumberFormat().format(count);
	logh(`Square-Sum Triangular Numbers: count: ${sc}`);

	const seq = squareSumTriangularSeq(count);

	seq.foreach(x => log(x));
	div();
};

export const logCubicNumTriangularSeq = (count: number) => {
	const sc = Intl.NumberFormat().format(count);
	logh(`Cubic-Num Triangular Numbers: count: ${sc}`);

	const seq = cubicNumTriangularSeq(count);

	seq.foreach(x => log(x));
	div();
};
