import type { ExamKey, Question, RawQuestion } from "./types";

// function isValidQuestion(q: RawQuestion): boolean {
// 	if (typeof q.question !== "string" || q.question.trim().length < 10) return false;
// 	if (!q.options || typeof q.options !== "object") return false;
// 	const keys = Object.keys(q.options);
// 	if (keys.length < 2) return false;
// 	const allOptionsNonEmpty = Object.values(q.options).every(
// 		(v) => typeof v === "string" && v.trim().length > 0,
// 	);
// 	if (!allOptionsNonEmpty) return false;
// 	const answer = typeof q.most_voted === "string" ? q.most_voted.trim() : "";
// 	if (!answer) return false;
// 	// Answer key must exist in options
// 	if (q.options[answer] === undefined) return false;
// 	return true;
// }

const cache: Partial<Record<ExamKey, Question[]>> = {};

export async function loadExamQuestions(exam: ExamKey): Promise<Question[]> {
	if (cache[exam]) return cache[exam]!;

	let rawData: RawQuestion[];
	switch (exam) {
		case "CBAP":
			rawData = ((await import("./assets/CBAP questions.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "DP-900":
			rawData = (
				(await import("./assets/DP-900 questions.json")) as { default: RawQuestion[] }
			).default;
			break;
		case "ITILFND-V4":
			rawData = (
				(await import("./assets/ITILFND-V4 questions.json")) as { default: RawQuestion[] }
			).default;
			break;
		case "SIMI":
			rawData = (
				(await import("./assets/Simi-CBAP questions.json")) as { default: RawQuestion[] }
			).default;
			break;
		case "CPG-LMS":
			rawData = ((await import("./assets/cpg_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 1":
			rawData = ((await import("./assets/module_01_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 2":
			rawData = ((await import("./assets/module_02_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 3":
			rawData = ((await import("./assets/module_03_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 4":
			rawData = ((await import("./assets/module_04_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 5":
			rawData = ((await import("./assets/module_05_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 6":
			rawData = ((await import("./assets/module_06_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 7":
			rawData = ((await import("./assets/module_07_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 8":
			rawData = ((await import("./assets/module_08_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 9":
			rawData = ((await import("./assets/module_09_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 10":
			rawData = ((await import("./assets/module_10_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 11":
			rawData = ((await import("./assets/module_11_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG-Module 12":
			rawData = ((await import("./assets/module_12_quiz.json")) as { default: RawQuestion[] })
				.default;
			break;
		case "CPG":
			rawData = [];
			for (let i = 1; i <= 12; i++) {
				const moduleFile = i < 10 ? `module_0${i}_quiz` : `module_${i}_quiz`;
				const moduleData = (
					(await import(`./assets/${moduleFile}.json`)) as { default: RawQuestion[] }
				).default;
				rawData = rawData.concat(...moduleData);
			}
			break;
		default:
			throw new Error(`Unknown exam key: ${exam}`);
	}

	let idx = 0;
	const questions: Question[] = rawData
		// .filter(isValidQuestion)
		.map((q) => ({ ...q, validIndex: ++idx }));

	cache[exam] = questions;
	return questions;
}

/** Shuffle an array in-place using Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export function pickQuestions(
	questions: Question[],
	rangeMin: number,
	rangeMax: number,
	count: number,
): Question[] {
	const pool = questions.filter((q) => q.validIndex >= rangeMin && q.validIndex <= rangeMax);
	const shuffled = shuffle([...pool]);
	return shuffled.slice(0, Math.min(count, shuffled.length));
}
