import { useState, useMemo, useEffect } from "react";
import type { QuizSession } from "../App";

interface Props {
	session: QuizSession;
	onRestart: () => void;
}

export default function ResultScreen({ session, onRestart }: Props) {
	const { config, questions, answers } = session;
	const [reviewOpen, setReviewOpen] = useState(false);
	const [activeDiscussion, setActiveDiscussion] = useState<string[] | null>(null);

	const results = useMemo(
		() =>
			questions.map((q, i) => ({
				q,
				answer: answers[i],
				correct: answers[i] !== null && answers[i] === q.most_voted.trim(),
				skipped: answers[i] === null,
			})),
		[questions, answers],
	);

	const correctCount = results.filter((r) => r.correct).length;
	const wrongCount = results.filter((r) => !r.correct && !r.skipped).length;
	const skippedCount = results.filter((r) => r.skipped).length;
	const total = questions.length;
	const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

	const wrongResults = results.filter((r) => !r.correct && !r.skipped);

	const scoreColor = pct >= 70 ? "var(--correct)" : pct >= 50 ? "var(--accent)" : "var(--wrong)";

	return (
		<>
			<div className="results">
				<header className="results-header">
					<h1>Quiz Complete</h1>
					<p className="results-subtitle">
						{config.exam} &middot; {config.mode === "study" ? "Study" : "Exam"}
					</p>
				</header>

				{/* Score card */}
				<div className="score-card">
					<div
						className="score-ring"
						style={{ borderColor: scoreColor }}>
						<span
							className="score-ring__pct"
							style={{ color: scoreColor }}>
							{pct}%
						</span>
						<span className="score-ring__label">Score</span>
					</div>
					<div className="score-stats">
						<div className="score-stat">
							<span className="score-stat__val score-stat__val--correct">
								{correctCount}
							</span>
							<span className="score-stat__lbl">Correct</span>
						</div>
						<div className="score-stat">
							<span className="score-stat__val score-stat__val--wrong">
								{wrongCount}
							</span>
							<span className="score-stat__lbl">Wrong</span>
						</div>
						<div className="score-stat">
							<span className="score-stat__val">{skippedCount}</span>
							<span className="score-stat__lbl">Skipped</span>
						</div>
						<div className="score-stat">
							<span className="score-stat__val">{total}</span>
							<span className="score-stat__lbl">Total</span>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="results-actions">
					<button
						type="button"
						className="start-btn"
						onClick={onRestart}>
						New Quiz
					</button>
					{wrongResults.length > 0 && (
						<button
							type="button"
							className="secondary-btn"
							onClick={() => setReviewOpen((r) => !r)}>
							{reviewOpen
								? "Hide Review"
								: `Review ${wrongResults.length} Wrong Answer${wrongResults.length !== 1 ? "s" : ""}`}
						</button>
					)}
				</div>

				{/* Review wrong answers */}
				{reviewOpen && wrongResults.length > 0 && (
					<section className="review-section">
						<h2 className="review-section__title">Wrong Answers</h2>
						{wrongResults.map(({ q, answer }, reviewIdx) => {
							const correct = q.most_voted.trim();
							const optionKeys = Object.keys(q.options).sort();
							const hasDisc = Array.isArray(q.discussion) && q.discussion.length > 0;

							return (
								<div
									key={reviewIdx}
									className="review-item">
									<p className="review-item__no">Question #{q.validIndex}</p>
									<p className="review-item__text">{q.question}</p>

									<div className="review-options">
										{optionKeys.map((key) => (
											<div
												key={key}
												className={`review-option${
													key === correct
														? " review-option--correct"
														: key === answer
															? " review-option--wrong"
															: ""
												}`}>
												<span className="option__key">{key}</span>
												<span className="review-option__text">
													{q.options[key]}
												</span>
											</div>
										))}
									</div>

									{hasDisc && (
										<div className="discussion-bar">
											<button
												type="button"
												className="discussion-btn"
												onClick={() => setActiveDiscussion(q.discussion)}>
												View Discussion
											</button>
										</div>
									)}
								</div>
							);
						})}
					</section>
				)}
			</div>

			{/* Discussion Modal */}
			{activeDiscussion && (
				<DiscussionModal
					entries={activeDiscussion}
					onClose={() => setActiveDiscussion(null)}
				/>
			)}
		</>
	);
}

interface ModalProps {
	entries: string[];
	onClose: () => void;
}

function DiscussionModal({ entries, onClose }: ModalProps) {
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
