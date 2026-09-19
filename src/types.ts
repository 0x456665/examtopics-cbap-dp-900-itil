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

export type ExamKey = "CBAP" | "DP-900" | "ITILFND-V4" | "SIMI" | "CPG-LMS";
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
	{ key: "CPG-LMS", label: "CPG-LMS", description: "Credit Policy Guide LMS past questions" },
];
