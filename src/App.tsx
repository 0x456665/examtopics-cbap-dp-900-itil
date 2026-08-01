import { useState, useCallback } from "react";
import type { QuizConfig, Question } from "./types";
import { loadExamQuestions, pickQuestions } from "./dataLoader";
import SetupScreen from "./components/SetupScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import "./App.css";

type Screen = "setup" | "quiz" | "results";

export interface QuizSession {
	config: QuizConfig;
	questions: Question[];
	answers: (string | null)[];
}

function App() {
	const [screen, setScreen] = useState<Screen>("setup");
	const [session, setSession] = useState<QuizSession | null>(null);

	const handleStart = useCallback(async (config: QuizConfig) => {
		const all = await loadExamQuestions(config.exam);
		const selected = pickQuestions(all, config.rangeMin, config.rangeMax, config.count);
		if (selected.length === 0) return;
		setSession({ config, questions: selected, answers: new Array(selected.length).fill(null) });
		setScreen("quiz");
	}, []);

	const handleFinish = useCallback((answers: (string | null)[]) => {
		setSession((prev) => (prev ? { ...prev, answers } : prev));
		setScreen("results");
	}, []);

	const handleRestart = useCallback(() => {
		setSession(null);
		setScreen("setup");
	}, []);

	return (
		<div className="app">
			{screen === "setup" && <SetupScreen onStart={handleStart} />}
			{screen === "quiz" && session && (
				<QuizScreen
					session={session}
					onFinish={handleFinish}
					onQuit={handleRestart}
				/>
			)}
			{screen === "results" && session && (
				<ResultScreen
					session={session}
					onRestart={handleRestart}
				/>
			)}
		</div>
	);
}

export default App;
