import { NumSeq } from "@/utils/seq";
import { log } from "console";

export const logZipTwoSeq = () => {
	const seq1 = NumSeq.count(20);
	const seq2 = seq1.map(x => x.toString());
	const seq3 = seq1.map(x => x ** 2);

	const seqZip = seq1
		.zip([seq2], (count, toStr) => {
			return { count, toStr };
		})
		.filter(x => x.count % 2 === 0);

	log("seq1:");
	log(seq1.toArray());
	log("seq2:");
	log(seq2.toArray());
	log("Zip of seq1, seq2");
	log(seqZip.toArray());
};

export const logZipThreeSeq = () => {
	const seq1 = NumSeq.count(20);
	const seq2 = seq1.map(x => x.toString());
	const seq3 = seq1.map(x => x ** 2);

	const seqZip = seq1
		.zip([seq2, seq3], (count, toStr, square) => {
			return { count, toStr, square };
		})
		.filter(x => x.count % 2 === 0);

	log("seq1:");
	log(seq1.toArray());
	log("seq2:");
	log(seq2.toArray());
	log("seq3:");
	log(seq3.toArray());
	log("Zip of seq1, seq2, seq3");
	log(seqZip.toArray());
};
