export interface RawQuestion {
	url: string | null;
	question_no: string;
	question: string;
	options: Record<string, string>;
	discussion: string[];
	vote_counts: Record<string, unknown>;
	most_voted: string;
	community_answer: string;
}

export interface Question extends RawQuestion {
	/** 1-based index among valid questions within the exam file */
	validIndex: number;
}

export type QuizMode = "study" | "exam";

export interface QuizConfig {
	exam: ExamKey;
	mode: QuizMode;
	count: number;
	rangeMin: number;
	rangeMax: number;
}

export interface ExamMeta {
	key: string;
	label: string;
	description: string;
	sourceFiles: readonly string[];
	group?: ExamGroupKey;
}

export const EXAM_GROUPS = [
	{
		key: "cpg",
		label: "CPG question bank",
		description: "Credit policy, practice questions, and module-by-module review",
		shortLabel: "CPG",
	},
] as const;

export type ExamGroupKey = (typeof EXAM_GROUPS)[number]["key"];

export interface ExamGroupMeta {
	key: ExamGroupKey;
	label: string;
	description: string;
	shortLabel: string;
}

const CPG_MODULE_FILES = Array.from(
	{ length: 12 },
	(_, index) => `module_${String(index + 1).padStart(2, "0")}_quiz.json`,
);

export const EXAMS : readonly ExamMeta[] = [
	{
		key: "CBAP",
		label: "CBAP",
		description: "Certified Business Analysis Professional",
		sourceFiles: ["CBAP questions.json"],
	},
	{
		key: "DP-900",
		label: "DP-900",
		description: "Azure Data Fundamentals",
		sourceFiles: ["DP-900 questions.json"],
	},
	{
		key: "ITILFND-V4",
		label: "ITILFND V4",
		description: "ITIL 4 Foundation",
		sourceFiles: ["ITILFND-V4 questions.json"],
	},
	{
		key: "SIMI",
		label: "SIMI CBAP",
		description: "Simi's assessment of CBAP knowledge Areas",
		sourceFiles: ["Simi-CBAP questions.json"],
	},
	{
		key: "CPG-LMS",
		label: "CPG-LMS",
		description: "Types of Risk & Risk Management Philosophy",
		sourceFiles: ["cpg_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG",
		label: "All CPG Modules",
		description: "All modules of CPG compiled into one",
		sourceFiles: CPG_MODULE_FILES,
		group: "cpg",
	},
	{
		key: "CPG-Module 1",
		label: "CPG-Module 1",
		description: "One Obligor Limit, Exposure (OSUC) & Risk Rating Limit Exceptions",
		sourceFiles: ["module_01_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 2",
		label: "CPG-Module 2",
		description: "Committees, Approval Authority & Related Policies",
		sourceFiles: ["module_02_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 3",
		label: "CPG-Module 3",
		description: "One Obligor Limit, Exposure (OSUC) & Risk Rating Limit Exceptions",
		sourceFiles: ["module_03_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 4",
		label: "CPG-Module 4",
		description:
			"Core Lending Products (Term Loan, Revolving Credit, Overdraft, Lease, Warehouse",
		sourceFiles: ["module_04_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 5",
		label: "CPG-Module 5",
		description: "Bonds & Guarantees, Loan Syndication, Agricultural Loans & Cash Collateral",
		sourceFiles: ["module_05_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 6",
		label: "CPG-Module 6",
		description:
			"Module 6: Delinquency Management, Asset Classification, Provisioning & Recovery",
		sourceFiles: ["module_06_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 7",
		label: "CPG-Module 7",
		description: " Foundational Policy Principles, Credit Process, Collateral & Credit Audit",
		sourceFiles: ["module_07_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 8",
		label: "CPG-Module 8",
		description:
			"Export Finance, Product Programs, Off‑Balance Sheet Facilities, Commercial Papers, LCs, CORR & Governance",
		sourceFiles: ["module_08_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 9",
		label: "CPG-Module 9",
		description: "Annual Review Types, Collateral Insurance & Foundational Credit Principles",
		sourceFiles: ["module_09_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 10",
		label: "CPG-Module 10",
		description: " Specialized Lending Policy",
		sourceFiles: ["module_10_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 11",
		label: "CPG-Module 11",
		description: "Environmental and Social Risk Management (ESRM)",
		sourceFiles: ["module_11_quiz.json"],
		group: "cpg",
	},
	{
		key: "CPG-Module 12",
		label: "CPG-Module 12",
		description: "Digital Lending",
		sourceFiles: ["module_12_quiz.json"],
		group: "cpg",
	},
] as const satisfies readonly ExamMeta[];

export type ExamKey = (typeof EXAMS)[number]["key"];
