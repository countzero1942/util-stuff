import prompts from "prompts";
import { cls, log, logh } from "./log";
import { getFullType, getType } from "./types";

export type TestMenuItem = {
	func: () => void;
	name: string;
	description?: string[];
	index?: number;
};

export const chooseAnOption = async (
	lastOption: number
): Promise<number> => {
	try {
		const response = await prompts({
			type: "number",
			name: "value",
			message: `Choose an option between 1 and ${lastOption} (enter to exit):`,
			validate: value =>
				value < 0 || value > lastOption
					? `Option is out of range`
					: true,
		});
		return typeof response.value === "number"
			? response.value
			: 0;
	} catch {
		return 0;
	}
};

export const pressEnterToContinue = async () => {
	const response = await prompts({
		type: "text",
		name: "value",
		message: `Press enter to continue...`,
	});

	return;
};

export const writeTestMenu = (items: TestMenuItem[]) => {
	logh("Choose a test");
	for (const item of items) {
		log(`${item.index}: ${item.name}`);
		log();
		if (item.description) {
			for (const line of item.description) {
				log(`   ${line}`);
			}
		}
		log();
	}
};

export const runTestMenu = async (
	testMenuItems: TestMenuItem[]
) => {
	while (true) {
		writeTestMenu(testMenuItems);
		const index = await chooseAnOption(
			testMenuItems.length
		);
		if (index === 0) {
			log("Exiting...\n");
			break;
		}
		const item = testMenuItems[index - 1];
		log();
		item.func();
		log();
		await pressEnterToContinue();
		cls();
	}
};
