import prompts from "prompts";
import { cls, log, logh } from "./log";
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

export const writeExamplesMenu = (
	menuName: string,
	items: ExamplesMenuItem[]
) => {
	logh(`Choose an example for ${menuName}:`);
	log();
	let index = 1;
	for (const item of items) {
		log(
			`${chalk.magentaBright(index)}: ${chalk.cyan(item.name)}`
		);
		log();
		if (item.description) {
			for (const line of item.description) {
				log(`   ${chalk.gray(line)}`);
			}
		}
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
