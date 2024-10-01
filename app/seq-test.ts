import { log, logln } from "@/utils/log";
import { round } from "@/utils/math";
import { NumberFilterSeq, NumSeq } from "@/utils/seq";

const div = () => {
	logln(30);
};

const logHead = (head: string) => {
	div();
	log(head);
	div();
};

export const testNumbers = async (): Promise<void> =>
	new Promise(resolve => {
		{
			logHead("Has perfect Cube root");
			const hasPerfectCubeRoot = (x: number): boolean => {
				const cr = Math.cbrt(x);
				return cr === Math.floor(cr);
			};
			const arr = NumSeq.count(1_000_000)
				.filter(hasPerfectCubeRoot)
				.toArray();
			log(arr);
		}

		{
			logHead("Has perfect Cube root mod 7");
			const hasPerfectCubeRoot = (x: number): boolean => {
				const cr = Math.cbrt(x);
				return cr === Math.floor(cr);
			};
			const arr = NumSeq.count(1_000_000)
				.filter(x => hasPerfectCubeRoot(x))
				.map(x => {
					return { x, cbrt: Math.cbrt(x) };
				})
				.filter(o => o.x % 7 === 0)
				.toArray();
			log(arr);
		}
		{
			logHead("Has perfect Sixth root");

			const getRoot = (x: number) => {
				return round(Math.pow(x, 1.0 / 6.0), 12);
			};

			const hasPerfectRoot = (x: number): boolean => {
				const r = getRoot(x);
				return r === Math.floor(r);
			};
			const arr = NumSeq.count(100_000_000)
				.filter(x => hasPerfectRoot(x))
				.map(x => {
					return { x, root: getRoot(x) };
				})
				.toArray();
			log(arr);
			log(`count: ${arr.length}`);
		}

		resolve();
	});

export const testLongNumberSeq = async (
	count: number
): Promise<void> =>
	new Promise(resolve => {
		{
			logHead("Test Long NumberSeq: perfect 6th root");
			log(`count: ${Intl.NumberFormat().format(count)}`);
			div();

			const getRoot = (x: number) => {
				return round(Math.pow(x, 1.0 / 6.0), 12);
			};

			const hasPerfectRoot = (x: number): boolean => {
				const r = getRoot(x);
				return r === Math.floor(r);
			};
			const arr = NumSeq.count(count)
				.filter(x => hasPerfectRoot(x))
				.map(x => {
					return { x, root: getRoot(x) };
				})
				.toArray();
			log(arr);
			log(`count: ${arr.length}`);
		}

		resolve();
	});

export const testNumberFilterSeq = async (
	count: number
): Promise<void> =>
	new Promise(resolve => {
		{
			logHead("Test Long NumberFilterSeq: perfect 6th root");
			log(`count: ${Intl.NumberFormat().format(count)}`);
			div();

			const getRoot = (x: number) => {
				return round(Math.pow(x, 1.0 / 6.0), 12);
			};

			const hasPerfectRoot = (x: number): boolean => {
				const r = getRoot(x);
				return r === Math.floor(r);
			};
			const arr = new NumberFilterSeq(1, count, x =>
				hasPerfectRoot(x)
			)
				.map(x => {
					return { x, root: getRoot(x) };
				})

				.toArray();
			log(arr);
			log(`count: ${arr.length}`);
		}

		resolve();
	});

export const testLongNumberDirect = async (
	count: number
): Promise<void> =>
	new Promise(resolve => {
		logHead("Test Long for loop: perfect 6th root");
		log(`count: ${Intl.NumberFormat().format(count)}`);
		div();

		const getRoot = (x: number) => {
			return round(Math.pow(x, 1.0 / 6.0), 12);
		};

		const hasPerfectRoot = (x: number): boolean => {
			const r = getRoot(x);
			return r === Math.floor(r);
		};

		const arr: { x: number; root: number }[] = [];

		for (let n = 1; n <= count; n++) {
			if (hasPerfectRoot(n)) {
				arr.push({ x: n, root: getRoot(n) });
			}
		}
		log(arr);

		resolve();
	});
