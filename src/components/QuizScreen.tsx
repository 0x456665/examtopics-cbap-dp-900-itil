import { useState, useMemo, useEffect, useRef } from "react";
import type { QuizSession } from "../App";

interface Props {
	session: QuizSession;
	onFinish: (answers: (string | null)[]) => void;
	onQuit: () => void;
}

type OptionState = "default" | "selected" | "correct" | "wrong";

export default function QuizScreen({ session, onFinish, onQuit }: Props) {
	const { config, questions } = session;
	const isStudy = config.mode === "study";
	const total = questions.length;

	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<(string | null)[]>(() => new Array(total).fill(null));
	const [revealed, setRevealed] = useState<boolean[]>(() => new Array(total).fill(false));
	const [discussionOpen, setDiscussionOpen] = useState(false);

	const q = questions[currentIndex];
	const selectedAnswer = answers[currentIndex];
	const isRevealed = revealed[currentIndex];
	const correctAnswer = q.most_voted.trim();
	const optionKeys = Object.keys(q.options).sort();
	const hasDiscussion = Array.isArray(q.discussion) && q.discussion.length > 0;

	// Close discussion when changing question
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setDiscussionOpen(false);
	}, [currentIndex]);

	// Score (study mode header)
	const score = useMemo(() => {
		let c = 0;
		for (let i = 0; i < answers.length; i++) {
			if (answers[i] !== null && answers[i] === questions[i].most_voted.trim()) c++;
		}
		return c;
	}, [answers, questions]);

	const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);

	const handleSelect = (key: string) => {
		if (isStudy) {
			if (isRevealed) return;
			setAnswers((prev) => {
				const next = [...prev];
				next[currentIndex] = key;
				return next;
			});
			setRevealed((prev) => {
				const next = [...prev];
				next[currentIndex] = true;
				return next;
			});
		} else {
			setAnswers((prev) => {
				const next = [...prev];
				// clicking same option again deselects
				next[currentIndex] = next[currentIndex] === key ? null : key;
				return next;
			});
		}
	};

	const handleNext = () => {
		if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
		else onFinish(answers);
	};

	const handlePrev = () => {
		if (currentIndex > 0) setCurrentIndex((i) => i - 1);
	};

	const jumpTo = (i: number) => {
		if (i >= 0 && i < total) setCurrentIndex(i);
	};

	const getOptionState = (key: string): OptionState => {
		if (isStudy && isRevealed) {
			if (key === correctAnswer) return "correct";
			if (key === selectedAnswer) return "wrong";
			return "default";
		}
		return selectedAnswer === key ? "selected" : "default";
	};

	// Dot status per question
	const getDotStatus = (i: number) => {
		const ans = answers[i];
		const rev = revealed[i];
		if (i === currentIndex) return "current";
		if (isStudy && rev) {
			return ans === questions[i].most_voted.trim() ? "correct" : "wrong";
		}
		if (ans !== null) return "answered";
		return "unanswered";
	};

	const isLastQuestion = currentIndex === total - 1;
	const progress = (currentIndex + 1) / total;

	// Navigator horizontal scroll — keep current dot in view
	const navScrollRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = navScrollRef.current;
		if (!el) return;
		const dot = el.children[currentIndex] as HTMLElement | undefined;
		dot?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
	}, [currentIndex]);

	return (
		<div className="quiz">
			{/* ── Header ── */}
			<header className="quiz-header">
				<div className="quiz-header__row">
					<button
						type="button"
						className="quit-btn"
						onClick={onQuit}>
						Quit
					</button>
					<div className="quiz-tags">
						<span className="tag">{config.exam}</span>
						<span className="tag">{isStudy ? "Study" : "Exam"}</span>
					</div>
					<div className="quiz-score">
						{isStudy ? (
							<>
								<strong>{score}</strong>
								<span className="quiz-score__sep">/</span>
								{answeredCount || "—"}
							</>
						) : (
							<span className="quiz-score__frac">
								{answeredCount}
								<span className="quiz-score__sep">/</span>
								{total}
							</span>
						)}
					</div>
				</div>

				<div className="progress-track">
					<div
						className="progress-fill"
						style={{ width: `${progress * 100}%` }}
					/>
				</div>

				{/* Question navigator */}
				<div
					className="q-navigator"
					ref={navScrollRef}
					role="navigation"
					aria-label="Jump to question">
					{questions.map((_, i) => {
						const status = getDotStatus(i);
						return (
							<button
								key={i}
								type="button"
								aria-label={`Question ${i + 1}`}
								aria-current={i === currentIndex ? "true" : undefined}
								className={`q-dot q-dot--${status}`}
								onClick={() => jumpTo(i)}>
								{i + 1}
							</button>
						);
					})}
				</div>
			</header>

			{/* ── Body ── */}
			<main className="quiz-body">
				<div className="question-card">
					<div className="question-meta">
						<span className="question-meta__counter">
							{currentIndex + 1} / {total}
						</span>
						<span className="question-meta__ref">#{q.validIndex}</span>
					</div>

					<p className="question-text">{q.question}</p>

					<div className="options">
						{optionKeys.map((key) => {
							const state = getOptionState(key);
							return (
								<button
									key={key}
									type="button"
									className={`option option--${state}`}
									onClick={() => handleSelect(key)}
									disabled={isStudy && isRevealed}>
									<span className="option__key">{key}</span>
									<span className="option__text">{q.options[key]}</span>
									{isStudy && isRevealed && key === correctAnswer && (
										<span className="option__mark option__mark--correct">
											✓
										</span>
									)}
									{isStudy &&
										isRevealed &&
										key === selectedAnswer &&
										key !== correctAnswer && (
											<span className="option__mark option__mark--wrong">
												✗
											</span>
										)}
								</button>
							);
						})}
					</div>

					{/* Discussion trigger — shown after reveal in study, always in exam */}
					{hasDiscussion && (isStudy ? isRevealed : true) && (
						<div className="discussion-bar">
							<button
								type="button"
								className="discussion-btn"
								onClick={() => setDiscussionOpen(true)}>
								View Discussion
							</button>
						</div>
					)}
				</div>

				{/* Navigation */}
				<nav className="quiz-nav">
					<button
						type="button"
						className="nav-btn nav-btn--secondary"
						onClick={handlePrev}
						disabled={currentIndex === 0}>
						Back
					</button>
					<button
						type="button"
						className="nav-btn nav-btn--primary"
						onClick={handleNext}>
						{isLastQuestion ? "Finish" : "Next"}
					</button>
				</nav>
			</main>

			{/* ── Discussion Modal ── */}
			{discussionOpen && hasDiscussion && (
				<DiscussionModal
					entries={q.discussion}
					onClose={() => setDiscussionOpen(false)}
				/>
			)}
		</div>
	);
}

interface ModalProps {
	entries: string[];
	onClose: () => void;
}

function DiscussionModal({ entries, onClose }: ModalProps) {
	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	return (
		<div
			className="modal-overlay"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Discussion">
			<div
				className="modal"
				onClick={(e) => e.stopPropagation()}>
				<div className="modal__header">
					<span className="modal__title">Discussion</span>
					<button
						type="button"
						className="modal__close"
						onClick={onClose}
						aria-label="Close">
						×
					</button>
				</div>
				<div className="modal__body">
					{entries.slice(0, 8).map((text, i) => (
						<p
							key={i}
							className="discussion__entry">
							{text}
						</p>
					))}
				</div>
			</div>
		</div>
	);
}
