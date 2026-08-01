import { useState, useEffect, useRef } from "react";
import type { ExamKey, QuizConfig, QuizMode } from "../types";
import { EXAMS } from "../types";
import { loadExamQuestions } from "../dataLoader";

interface Props {
	onStart: (config: QuizConfig) => Promise<void>;
}

export default function SetupScreen({ onStart }: Props) {
	const [exam, setExam] = useState<ExamKey | null>(null);
	const [mode, setMode] = useState<QuizMode>("study");
	const [count, setCount] = useState(20);
	const [rangeMin, setRangeMin] = useState(1);
	const [rangeMax, setRangeMax] = useState(1);
	const [maxAvailable, setMaxAvailable] = useState(0);
	const [loadingExam, setLoadingExam] = useState(false);
	const [starting, setStarting] = useState(false);
	const [showRange, setShowRange] = useState(false);
	const [examCounts, setExamCounts] = useState<Partial<Record<ExamKey, number>>>({});

	// Load all exam counts in background for display
	useEffect(() => {
		for (const { key } of EXAMS) {
			loadExamQuestions(key).then((qs) => {
				setExamCounts((prev) => ({ ...prev, [key]: qs.length }));
			});
		}
	}, []);

	// When exam changes, refresh max range
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

	const handleCountChange = (raw: string) => {
		const v = parseInt(raw, 10);
		if (!isNaN(v) && v >= 1) setCount(v);
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
				<h1>ExamTopics Quiz</h1>
				<p>Practice for your certification exam</p>
			</header>

			<div className="setup-body">
				{/* Exam Selection */}
				<section className="setup-section">
					<span className="section-label">Select Exam</span>
					<div className="exam-grid">
						{EXAMS.map(({ key, label, description }) => (
							<button
								key={key}
								type="button"
								className={`exam-card${exam === key ? " exam-card--selected" : ""}`}
								onClick={() => setExam(key)}>
								<span className="exam-card__label">{label}</span>
								<span className="exam-card__desc">{description}</span>
								<span className="exam-card__count">
									{examCounts[key] != null ? `${examCounts[key]} questions` : "…"}
								</span>
							</button>
						))}
					</div>
				</section>

				{/* Mode */}
				<section className="setup-section">
					<span className="section-label">Mode</span>
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
					<span className="section-label">Number of Questions</span>
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
							value={count}
							min={1}
							max={maxAvailable || 999}
							onChange={(e) => handleCountChange(e.target.value)}
							onBlur={() => setCount((c) => Math.max(1, c))}
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
									min={1}
									max={rangeMax}
									value={rangeMin}
									onChange={(e) => {
										const v = parseInt(e.target.value, 10);
										if (!isNaN(v) && v >= 1 && v <= rangeMax) setRangeMin(v);
									}}
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
									value={rangeMax}
									onChange={(e) => {
										const v = parseInt(e.target.value, 10);
										if (!isNaN(v) && v >= rangeMin && v <= maxAvailable)
											setRangeMax(v);
									}}
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
