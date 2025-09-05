import { log } from "console";
import { StepNav } from "@/utils/operations";

const steps = [
	"First Match",
	"Content Match",
	"Last Match",
] as const;

type Step = (typeof steps)[number];

export const doStepNavTest = () => {
	const stepNav = new StepNav(steps);

	while (stepNav.isNotComplete) {
		switch (stepNav.step) {
			case "First Match":
				log(stepNav.step);
				stepNav.next();
				break;
			case "Content Match":
				log(stepNav.step);
				stepNav.next();
				break;
			case "Last Match":
				log(stepNav.step);
				stepNav.next();
				break;
			default:
				throw "never";
		}
	}

	log(`StepNav complete: ${stepNav.isComplete}`);
};
