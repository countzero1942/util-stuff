import prompts from "prompts";
import { cls, div, log, logh } from "./log";
import chalk from "chalk";

export type ExamplesMenuItem = {
	func: () => void;
	name: string;
	description?: string[];
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
		return typeof response.value === "number" ? response.value : 0;
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

const logMenuItem = (item: ExamplesMenuItem, itemNumber: number) => {
	log(`${chalk.magentaBright(itemNumber)}: ${chalk.cyan(item.name)}`);
	log();
	if (item.description) {
		for (const line of item.description) {
			log(`   ${chalk.gray(line)}`);
		}
	}
};

export const writeExamplesMenu = (
	menuName: string,
	items: ExamplesMenuItem[]
) => {
	logh(`Choose an example for ${menuName}:`);
	log();
	let index = 1;
	for (const item of items) {
		logMenuItem(item, index);
		log();
		index++;
	}
};

export const runExamplesMenu = async (
	menuName: string,
	testMenuItems: ExamplesMenuItem[]
) => {
	while (true) {
		writeExamplesMenu(menuName, testMenuItems);
		const itemNumber = await chooseAnOption(testMenuItems.length);
		if (itemNumber === 0) {
			log("Exiting...\n");
			break;
		}
		const index = itemNumber - 1;
		const item = testMenuItems[index];
		log();
		div();
		logMenuItem(item, itemNumber);
		item.func();
		log();
		await pressEnterToContinue();
		cls();
	}
};
