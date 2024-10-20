import { log, logh } from "@/utils/log";
import { NumSeq } from "@/utils/seq";

export const hasPerfectRootSeqExample = () => {
	{
		logh("Has perfect Sixth root");

		const round = (x: number, n: number) => {
			const pow = Math.pow(10, n);
			return Math.round(x * pow) / pow;
		};

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

	{
		logh("Has perfect Cube root mod 7");
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
};
