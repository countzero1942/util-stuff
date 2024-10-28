import {
	log,
	logh,
	div,
	loggn,
	ddivl,
	logn,
	divl,
	ddivln,
	loghn,
} from "@/utils/log";
import {
	NNum,
	RFixed,
	RPrec,
	TypeBase,
	WNum,
	ZNum,
} from "@/parser/types/type-types";
import { TypeMap } from "@/parser/types/type-map";
import { getFullType } from "@/utils/types";

export const testRPrec = () => {
	const logRT = (name: string, rt: TypeBase) => {
		log(`${name}:`);
		log(rt);
		log();
	};
	loghn("test RPrec");

	const typeMap = new TypeMap();

	const rt = new RPrec();
	const rt1 = typeMap.addOrGet(rt);
	const rt2 = typeMap.addOrGet(new RPrec());
	const rt3 = typeMap.addOrGet(new RPrec(6));
	div();

	loggn("rt", rt);
	loggn("rt1", rt1);
	loggn("rt2", rt2);
	loggn("rt3", rt3);
	div();

	log(typeMap);
	div();
	log(`has rt: ${typeMap.has(rt)}`);
	log(`has rt1: ${typeMap.has(rt1)}`);
	log(`has rt2: ${typeMap.has(rt2)}`);
	log(`has rt3: ${typeMap.has(rt3)}`);
	log(`rt === rt1: ${rt === rt1}`);
	log(`rt === rt2: ${rt === rt2}`);
	log(`rt !== rt3: ${rt !== rt3}`);
	log(`rt !== new RPrec(): ${rt !== new RPrec()}`);
};

export const testRFixed = () => {
	loghn("test RFixed");

	const typeMap = new TypeMap();

	const rt = new RFixed();
	const rt1 = typeMap.addOrGet(rt);
	const rt2 = typeMap.addOrGet(new RFixed());
	const rt3 = typeMap.addOrGet(new RFixed(4));
	div();

	loggn("rt", rt);
	loggn("rt1", rt1);
	loggn("rt2", rt2);
	loggn("rt3", rt3);
	div();

	log(typeMap);
	div();
	log(`has rt: ${typeMap.has(rt)}`);
	log(`has rt1: ${typeMap.has(rt1)}`);
	log(`has rt2: ${typeMap.has(rt2)}`);
	log(`has rt3: ${typeMap.has(rt3)}`);
	log(`rt === rt1: ${rt === rt1}`);
	log(`rt === rt2: ${rt === rt2}`);
	log(`rt !== rt3: ${rt !== rt3}`);
	log(`rt !== new RFixed(): ${rt !== new RFixed()}`);
};

export const testZTypes = () => {
	const logZT = (name: string, zt: TypeBase) => {
		const fullType = getFullType(zt);
		loggn(`${name}: <${fullType.name}>`, zt);
	};

	loghn("test ZTypes");

	const typeMap = new TypeMap();

	const zt = new ZNum();
	const zt1 = typeMap.addOrGet(zt);
	const zt2 = typeMap.addOrGet(new ZNum());
	const nt1 = typeMap.addOrGet(new NNum());
	const wt1 = typeMap.addOrGet(new WNum());

	div();

	logZT("zt", zt);
	logZT("zt1", zt1);
	logZT("zt2", zt2);
	logZT("nt1", nt1);
	logZT("wt1", wt1);
	div();

	log(typeMap);
	div();
	log(`has zt: ${typeMap.has(zt)}`);
	log(`has zt1: ${typeMap.has(zt1)}`);
	log(`has zt2: ${typeMap.has(zt2)}`);
	log(`has nt1: ${typeMap.has(nt1)}`);
	log(`has wt1: ${typeMap.has(wt1)}`);
	log(`zt === zt1: ${zt === zt1}`);
	log(`zt === zt2: ${zt === zt2}`);
	log(`zt !== nt1: ${zt !== nt1}`);
	log(`zt !== wt1: ${zt !== wt1}`);
	log(`zt !== new ZNum(): ${zt !== new ZNum()}`);
};