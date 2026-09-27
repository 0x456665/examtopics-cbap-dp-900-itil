import { useState, useRef, useEffect } from "react";
import type { ExamGroupKey, ExamKey, QuizConfig, QuizMode } from "../types";
import { EXAMS, EXAM_GROUPS } from "../types";
import { loadExamQuestions } from "../dataLoader";

const getExamGroup = (exam: (typeof EXAMS)[number]) => ("group" in exam ? exam.group : undefined);
const STANDALONE_EXAMS = EXAMS.filter((exam) => !getExamGroup(exam));

interface Props {
	onStart: (config: QuizConfig) => Promise<void>;
}

export default function SetupScreen({ onStart }: Props) {
	const [exam, setExam] = useState<ExamKey | null>(null);
	const [mode, setMode] = useState<QuizMode>("study");
	const [count, setCount] = useState(20);
	const [countDraft, setCountDraft] = useState<string | null>(null); // null = not editing
	const [rangeMin, setRangeMin] = useState(1);
	const [rangeMinDraft, setRangeMinDraft] = useState<string | null>(null);
	const [rangeMax, setRangeMax] = useState(1);
	const [rangeMaxDraft, setRangeMaxDraft] = useState<string | null>(null);
	const [maxAvailable, setMaxAvailable] = useState(0);
	const [loadingExam, setLoadingExam] = useState(false);
	const [starting, setStarting] = useState(false);
	const [showRange, setShowRange] = useState(false);
	const [expandedGroup, setExpandedGroup] = useState<ExamGroupKey | null>(null);
	const [examCounts, setExamCounts] = useState<Partial<Record<ExamKey, number>>>({});

	// Derived display values — always in sync with real state, no useEffect needed
	const countInput = countDraft ?? String(count);
	const rangeMinInput = rangeMinDraft ?? String(rangeMin);
	const rangeMaxInput = rangeMaxDraft ?? String(rangeMax);

	// Load all exam counts in background for display
	useEffect(() => {
		for (const { key } of EXAMS) {
			loadExamQuestions(key).then((qs) => {
				setExamCounts((prev) => ({ ...prev, [key]: qs.length }));
			});
		}
	}, []);

	// When exam changes, refresh max range
	// When exam changes, refresh max range (async fetch + ref write → useEffect)
	const prevExam = useRef<ExamKey | null>(null);
	useEffect(() => {
		if (!exam || exam === prevExam.current) return;
		prevExam.current = exam;
		setLoadingExam(true);
		loadExamQuestions(exam).then((qs) => {
			const total = qs.length;
			setMaxAvailable(total);
			setRangeMax(total);
			setRangeMin(1);
			setCount((c) => Math.min(c, total));
			setLoadingExam(false);
		});
	}, [exam]);

	const effectivePool = Math.max(0, rangeMax - rangeMin + 1);
	const cappedCount = Math.min(count, effectivePool);
	const canStart = exam !== null && !loadingExam && effectivePool > 0 && !starting;
	const selectedGroup = EXAMS.find((item) => item.key === exam);
	const selectedGroupKey = selectedGroup ? getExamGroup(selectedGroup) : undefined;

	// --- Count field handlers ---
	const handleCountFocus = () => setCountDraft(String(count));
	const handleCountChange = (raw: string) => {
		setCountDraft(raw);
		if (raw === "") return;
		const v = parseInt(raw, 10);
		if (!isNaN(v) && v >= 1) setCount(v);
	};
	const handleCountBlur = () => {
		const v = parseInt(countDraft ?? "", 10);
		const clamped = isNaN(v) || v < 1 ? 1 : v;
		setCount(clamped);
		setCountDraft(null);
	};

	// --- Range min field handlers ---
	const handleRangeMinFocus = () => setRangeMinDraft(String(rangeMin));
	const handleRangeMinChange = (raw: string) => {
		setRangeMinDraft(raw);
		if (raw === "") return;
		const v = parseInt(raw, 10);
		if (!isNaN(v) && v >= 0 && v <= rangeMax) setRangeMin(v);
	};
	const handleRangeMinBlur = () => {
		const v = parseInt(rangeMinDraft ?? "", 10);
		const clamped = isNaN(v) ? 0 : Math.min(Math.max(v, 0), rangeMax);
		setRangeMin(clamped);
		setRangeMinDraft(null);
	};

	// --- Range max field handlers ---
	const handleRangeMaxFocus = () => setRangeMaxDraft(String(rangeMax));
	const handleRangeMaxChange = (raw: string) => {
		setRangeMaxDraft(raw);
		if (raw === "") return;
		const v = parseInt(raw, 10);
		if (!isNaN(v) && v >= rangeMin && v <= maxAvailable) setRangeMax(v);
	};
	const handleRangeMaxBlur = () => {
		const v = parseInt(rangeMaxDraft ?? "", 10);
		const fallbackMax = maxAvailable || rangeMin;
		const clamped = isNaN(v) ? rangeMin : Math.min(Math.max(v, rangeMin), fallbackMax);
		setRangeMax(clamped);
		setRangeMaxDraft(null);
	};

	const handleStart = async () => {
		if (!exam || !canStart) return;
		setStarting(true);
		try {
			await onStart({ exam, mode, count: cappedCount, rangeMin, rangeMax });
		} finally {
			setStarting(false);
		}
	};

	return (
		<div className="setup">
			<header className="setup-header">
				{/* <p className="setup-kicker"><span className="setup-kicker__mark">EQ</span> CERTIFICATION PRACTICE</p> */}
				<h1> Practice Questions</h1>
				<p>Choose a question bank and shape your next practice session.</p>
			</header>

			<div className="setup-body">
				{/* Question bank selection */}
				<section className="setup-section">
					<div className="section-heading">
						<span className="section-step">01</span>
						<span className="section-label">Choose a question bank</span>
					</div>
					<div className="exam-grid">
						{STANDALONE_EXAMS.map(({ key, label, description }) => (
							<button
								key={key}
								type="button"
								className={`exam-card${exam === key ? " exam-card--selected" : ""}`}
								aria-pressed={exam === key}
								onClick={() => setExam(key)}>
								<span className="exam-card__topline">
									<span className="exam-card__label">{label}</span>
									<span
										className="exam-card__indicator"
										aria-hidden="true">
										{exam === key ? "✓" : "↗"}
									</span>
								</span>
								<span className="exam-card__desc">{description}</span>
								<span className="exam-card__count">
									{examCounts[key] != null ? `${examCounts[key]} questions` : "…"}
								</span>
							</button>
						))}
						{EXAM_GROUPS.map((group) => {
							const groupExams = EXAMS.filter(
								(item) => getExamGroup(item) === group.key,
							);
							const isExpanded = expandedGroup === group.key;
							const isSelected = selectedGroupKey === group.key;

							return (
								<button
									key={group.key}
									type="button"
									className={`exam-card exam-card--collection${isExpanded ? " exam-card--open" : ""}${isSelected ? " exam-card--selected" : ""}`}
									aria-expanded={isExpanded}
									aria-controls={`group-options-${group.key}`}
									onClick={() => setExpandedGroup(isExpanded ? null : group.key)}>
									<span
										className="exam-card__collection-mark"
										aria-hidden="true">
										{group.shortLabel}
									</span>
									<span className="exam-card__collection-copy">
										<span className="exam-card__topline">
											<span className="exam-card__label">{group.label}</span>
											<span
												className="exam-card__indicator"
												aria-hidden="true">
												{isExpanded ? "−" : "+"}
											</span>
										</span>
										<span className="exam-card__desc">{group.description}</span>
										<span className="exam-card__count">
											{groupExams.length} sets
										</span>
									</span>
								</button>
							);
						})}
					</div>
					{EXAM_GROUPS.map(
						(group) =>
							expandedGroup === group.key && (
								<div
									className="exam-group-panel"
									id={`group-options-${group.key}`}
									key={group.key}
									role="group"
									aria-label={`${group.label} sets`}>
									<div className="exam-group-panel__heading">
										<div>
											<h2>Choose a set</h2>
											<p>{group.description}</p>
										</div>
										<span className="exam-group-panel__count">
											{
												EXAMS.filter(
													(item) => getExamGroup(item) === group.key,
												).length
											}{" "}
											sets
										</span>
									</div>
									<div className="exam-group-grid">
										{EXAMS.filter(
											(item) => getExamGroup(item) === group.key,
										).map(({ key, label, description }) => (
											<button
												key={key}
												type="button"
												className={`exam-group-option${exam === key ? " exam-group-option--selected" : ""}`}
												aria-pressed={exam === key}
												onClick={() => setExam(key)}>
												<span className="exam-group-option__label">
													{label}
												</span>
												<span className="exam-group-option__desc">
													{description}
												</span>
												<span className="exam-group-option__count">
													{examCounts[key] != null
														? `${examCounts[key]} questions`
														: "Loading count…"}
												</span>
											</button>
										))}
									</div>
								</div>
							),
					)}
				</section>

				{/* Mode */}
				<section className="setup-section">
					<div className="section-heading">
						<span className="section-step">02</span>
						<span className="section-label">Choose your pace</span>
					</div>
					<div className="mode-row">
						<button
							type="button"
							className={`mode-btn${mode === "study" ? " mode-btn--active" : ""}`}
							onClick={() => setMode("study")}>
							<span className="mode-btn__name">Study</span>
							<span className="mode-btn__desc">See correct answer immediately</span>
						</button>
						<button
							type="button"
							className={`mode-btn${mode === "exam" ? " mode-btn--active" : ""}`}
							onClick={() => setMode("exam")}>
							<span className="mode-btn__name">Exam</span>
							<span className="mode-btn__desc">Answer all, review at the end</span>
						</button>
					</div>
				</section>

				{/* Question Count */}
				<section className="setup-section">
					<div className="section-heading">
						<span className="section-step">03</span>
						<span className="section-label">Set your session length</span>
					</div>
					<div className="count-row">
						<button
							type="button"
							className="count-step"
							onClick={() => setCount((c) => Math.max(1, c - 1))}
							disabled={count <= 1}
							aria-label="Decrease">
							−
						</button>
						<input
							type="number"
							className="count-field"
							value={countInput}
							min={1}
							max={maxAvailable || 999}
							onFocus={handleCountFocus}
							onChange={(e) => handleCountChange(e.target.value)}
							onBlur={handleCountBlur}
							aria-label="Number of questions"
						/>
						<button
							type="button"
							className="count-step"
							onClick={() => setCount((c) => c + 1)}
							aria-label="Increase">
							+
						</button>
						{exam && !loadingExam && (
							<span className="count-hint">
								{cappedCount !== count
									? `${cappedCount} available in range`
									: `of ${effectivePool} in range`}
							</span>
						)}
					</div>
				</section>

				{/* Range */}
				<section className="setup-section">
					<button
						type="button"
						className="range-toggle"
						onClick={() => setShowRange((r) => !r)}>
						{showRange ? "Hide" : "Set"} question range
						<span className="range-toggle__arrow">{showRange ? " ▲" : " ▼"}</span>
					</button>

					{showRange && (
						<div className="range-row">
							<label className="range-field">
								<span>From</span>
								<input
									type="number"
									min={0}
									max={rangeMax}
									value={rangeMinInput}
									onFocus={handleRangeMinFocus}
									onChange={(e) => handleRangeMinChange(e.target.value)}
									onBlur={handleRangeMinBlur}
									disabled={!exam || loadingExam}
								/>
							</label>
							<span className="range-dash">—</span>
							<label className="range-field">
								<span>To</span>
								<input
									type="number"
									min={rangeMin}
									max={maxAvailable || 999}
									value={rangeMaxInput}
									onFocus={handleRangeMaxFocus}
									onChange={(e) => handleRangeMaxChange(e.target.value)}
									onBlur={handleRangeMaxBlur}
									disabled={!exam || loadingExam}
								/>
							</label>
							{!exam && <span className="range-hint">Select an exam first</span>}
						</div>
					)}
				</section>

				<button
					type="button"
					className="start-btn"
					onClick={handleStart}
					disabled={!canStart}>
					{starting ? "Loading…" : loadingExam ? "Loading exam…" : "Start Quiz"}
				</button>
			</div>
		</div>
	);
}
