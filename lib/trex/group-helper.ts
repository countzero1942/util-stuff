import { log } from "console";
import { GroupMatchNav } from "./group-nav";
import chalk from "chalk";

/**
 * Adds a GroupMatchNav result to the childrenNavs array based on the
 * result's group name.
 *
 * If the result has a non-empty group name, it is added to the
 * childrenNavs array. (Match added to parent.)
 *
 * If the result has an empty group name, its children are added
 * to the childrenNavs array. (Child matches added to parent's children.)
 *
 * @param result The result to add.
 * @param childrenNavs The array to add the result to.
 */
export function addResultToChildrenGroupNavs(
	result: GroupMatchNav,
	childrenNavs: GroupMatchNav[]
): void {
	// case: unnamed group match
	if (result.groupName.isEmpty()) {
		// case: unnamed leaf match: don't include in childrenNavs
		if (result.isLeaf) {
			return;
		}

		// case: unnamed branch match: add children to parent childrenNavs
		for (const child of result.children) {
			if (child.groupName.isNotEmpty()) {
				childrenNavs.push(child);
			}
		}
		return;
	}

	// case: named group match: add leaf or branch to childrenNavs
	childrenNavs.push(result);
}

export function addResultToParent(
	result: GroupMatchNav,
	parent: GroupMatchNav
): void {
	log(chalk.red(`>>> group name: ${result.groupName.toString()}`));
	// case: unnamed group match
	if (result.groupName.isEmpty()) {
		// case: unnamed leaf match: don't include in childrenNavs
		if (result.isLeaf) {
			return;
		}
		const firstNamedAncestor = parent.getFirstNamedAncestor();
		log(
			chalk.yellow(
				`firstNamedAncestor: ${firstNamedAncestor.groupName.toString()}`
			)
		);

		// case: unnamed branch match: add children to parent childrenNavs
		for (const child of result.children) {
			if (child.groupName.isNotEmpty()) {
				log(
					chalk.yellow(
						`   adding child: '${child.wholeMatchNav.captureMatch.value}'`
					)
				);
				// parent.addChild(child);
				firstNamedAncestor.addChild(child);
			}
		}
		return;
	}

	// case: named group match: add leaf or branch to childrenNavs
	parent.addChild(result);
}

export function addResultToParentB(
	result: GroupMatchNav,
	parent: GroupMatchNav
): void {
	log(chalk.red(`>>> group name: ${parent.groupName.toString()}`));

	if (result.groupName.isNotEmpty()) {
		parent.addChild(result);
	}
	return;

	// case: unnamed group match
	if (result.groupName.isEmpty()) {
		// case: unnamed leaf match: don't include in childrenNavs
		if (result.isLeaf) {
			return;
		}
		const firstNamedAncestor = parent.getFirstNamedAncestor();
		log(
			chalk.yellow(
				`firstNamedAncestor: ${firstNamedAncestor.groupName.toString()}`
			)
		);

		// case: unnamed branch match: add children to parent childrenNavs
		for (const child of result.children) {
			if (child.groupName.isNotEmpty()) {
				log(
					chalk.yellow(
						`   adding child: '${child.wholeMatchNav.captureMatch.value}'`
					)
				);
				// parent.addChild(child);
				firstNamedAncestor.addChild(child);
			}
		}
		return;
	}

	// case: named group match: add leaf or branch to childrenNavs
	parent.addChild(result);
}
