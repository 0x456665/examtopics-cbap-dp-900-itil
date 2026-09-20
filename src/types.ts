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

export type ExamKey =
	| "CBAP"
	| "DP-900"
	| "ITILFND-V4"
	| "SIMI"
	| "CPG-LMS"
	| "CPG"
	| "CPG-Module 1"
	| "CPG-Module 2"
	| "CPG-Module 3"
	| "CPG-Module 4"
	| "CPG-Module 5"
	| "CPG-Module 6"
	| "CPG-Module 7"
	| "CPG-Module 8"
	| "CPG-Module 9"
	| "CPG-Module 10"
	| "CPG-Module 11"
	| "CPG-Module 12";

export type QuizMode = "study" | "exam";

export interface QuizConfig {
	exam: ExamKey;
	mode: QuizMode;
	count: number;
	rangeMin: number;
	rangeMax: number;
}

export interface ExamMeta {
	key: ExamKey;
	label: string;
	description: string;
}

export const EXAMS: ExamMeta[] = [
	{ key: "CBAP", label: "CBAP", description: "Certified Business Analysis Professional" },
	{ key: "DP-900", label: "DP-900", description: "Azure Data Fundamentals" },
	{ key: "ITILFND-V4", label: "ITILFND V4", description: "ITIL 4 Foundation" },
	{ key: "SIMI", label: "SIMI CBAP", description: "Simi's assessment of CBAP knowledge Areas" },
	{ key: "CPG-LMS", label: "CPG-LMS", description: "Types of Risk & Risk Management Philosophy" },
	{
		key: "CPG",
		label: "All CPG Modules",
		description: "All modules of CPG compiled into one"
	},
	{
		key: "CPG-Module 1",
		label: "CPG-Module 1",
		description: "One Obligor Limit, Exposure (OSUC) & Risk Rating Limit Exceptions",
	},
	{
		key: "CPG-Module 2",
		label: "CPG-Module 2",
		description: "Committees, Approval Authority & Related Policies",
	},
	{
		key: "CPG-Module 3",
		label: "CPG-Module 3",
		description: "One Obligor Limit, Exposure (OSUC) & Risk Rating Limit Exceptions",
	},
	{
		key: "CPG-Module 4",
		label: "CPG-Module 4",
		description:
			"Core Lending Products (Term Loan, Revolving Credit, Overdraft, Lease, Warehouse",
	},
	{
		key: "CPG-Module 5",
		label: "CPG-Module 5",
		description: "Bonds & Guarantees, Loan Syndication, Agricultural Loans & Cash Collateral",
	},
	{
		key: "CPG-Module 6",
		label: "CPG-Module 6",
		description:
			"Module 6: Delinquency Management, Asset Classification, Provisioning & Recovery",
	},
	{
		key: "CPG-Module 7",
		label: "CPG-Module 7",
		description: " Foundational Policy Principles, Credit Process, Collateral & Credit Audit",
	},
	{
		key: "CPG-Module 8",
		label: "CPG-Module 8",
		description:
			"Export Finance, Product Programs, Off‑Balance Sheet Facilities, Commercial Papers, LCs, CORR & Governance",
	},
	{
		key: "CPG-Module 9",
		label: "CPG-Module 9",
		description: "Annual Review Types, Collateral Insurance & Foundational Credit Principles",
	},
	{
		key: "CPG-Module 10",
		label: "CPG-Module 10",
		description: " Specialized Lending Policy",
	},
	{
		key: "CPG-Module 11",
		label: "CPG-Module 11",
		description: "Environmental and Social Risk Management (ESRM)",
	},
	{
		key: "CPG-Module 12",
		label: "CPG-Module 12",
		description: "Digital Lending",
	},
];
