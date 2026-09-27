# ExamTopics Quiz

A React, TypeScript, and Vite app for practicing certification questions. Question banks are configured as exam entries, with optional groups to organize related banks in the setup screen.

## Run Locally

Requirements: Node.js and pnpm.

```sh
pnpm install
pnpm dev
```

Useful checks:

```sh
pnpm build
pnpm lint
```

## How It Works

The exam catalog in `src/types.ts` is the source of truth for the setup screen and question loader:

1. Each entry in `EXAMS` describes a selectable exam: its unique key, display label, description, and one or more question JSON filenames.
2. An exam can optionally set `group` to a key declared in `EXAM_GROUPS`. Exams without a group appear as standalone tiles. Exams with the same group key appear inside that group's tile.
3. `SetupScreen` renders standalone exams and groups from the catalog. Selecting any exam starts the existing quiz flow with that exam's key.
4. `loadExamQuestions` finds the exam metadata, loads each declared file from `src/assets`, combines the question arrays in the listed order, and assigns each question a 1-based `validIndex`.
5. The quiz selects a random set of questions from the requested index range. `most_voted` is used as the correct option; discussions are displayed when available.

No exam-specific component or loader branch is needed when adding a bank. Keep catalog keys unique and filenames exact, including spaces and capitalization.

## Add Questions

Create a JSON file in `src/assets`. It must contain an array of question objects. Each object follows this shape:

```json
[
	{
		"url": null,
		"question_no": "Practice Question 1",
		"question": "Which option is correct?",
		"options": {
			"A": "First option",
			"B": "Second option",
			"C": "Third option",
			"D": "Fourth option"
		},
		"discussion": ["Explanation or discussion text."],
		"vote_counts": {
			"B": 4
		},
		"most_voted": "B",
		"community_answer": "B. Second option"
	}
]
```

Fields:

- `url`: source URL, or `null`.
- `question_no`: source question identifier. The UI currently displays the generated `validIndex` rather than this field.
- `question`: question text.
- `options`: map of answer labels to answer text. Labels are typically `A`, `B`, `C`, and `D`.
- `discussion`: array of discussion or explanation strings; an empty array is allowed.
- `vote_counts`: map of option labels to vote counts; use `{}` when unavailable.
- `most_voted`: label of the correct option. It must match a key in `options` because quiz scoring compares the selected label to this value.
- `community_answer`: source's answer text, or an empty string when unavailable.

The loader currently does not validate or filter question records. Provide all fields with the expected types and a valid `most_voted` option. Array order determines the question's index within that exam; for exams using multiple files, file order in `sourceFiles` determines their combined order.

## Add a Standalone Exam

1. Add the question file to `src/assets`, for example `Cloud-101 questions.json`.
2. Add an exam entry to `EXAMS` in `src/types.ts`, without a `group` property:

```ts
{
  key: "CLOUD-101",
  label: "Cloud-101",
  description: "Cloud fundamentals certification practice",
  sourceFiles: ["Cloud-101 questions.json"],
},
```

The exam appears as a standalone tile. Its `key` is the value passed through the quiz configuration, so it must be unique.

## Add an Exam Group

Add a group entry to `EXAM_GROUPS` in `src/types.ts`:

```ts
{
  key: "cloud",
  label: "Cloud certifications",
  description: "Practice banks for cloud exams",
  shortLabel: "CLD",
},
```

`key` is the identifier used by exam entries and must be unique. The other fields are shown on the group tile: `label` is its name, `description` is supporting text, and `shortLabel` is the compact mark.

Assign an exam to that group by setting its `group` field:

```ts
{
  key: "CLOUD-101",
  label: "Cloud-101",
  description: "Cloud fundamentals certification practice",
  sourceFiles: ["Cloud-101 questions.json"],
  group: "cloud",
},
```

Add as many exam entries as needed with the same `group` value. They appear as choices inside the group tile. An exam can belong to one group or remain standalone; the current catalog model does not assign one exam to multiple groups.

## Add a Multi-File Exam

Set `sourceFiles` to the filenames in the order they should be combined:

```ts
{
  key: "CLOUD-101-ALL",
  label: "All Cloud-101 Topics",
  description: "Combined question bank",
  sourceFiles: [
    "cloud_topic_01.json",
    "cloud_topic_02.json",
  ],
  group: "cloud",
},
```

The loader concatenates these arrays in order before assigning indexes. The combined exam is a separate selectable exam; add its entry to a group if it should appear alongside its component banks.

## Add Another Group

The catalog is intentionally data-driven. To add a new subject area:

1. Add its display metadata to `EXAM_GROUPS`.
2. Add question files under `src/assets`.
3. Add one `EXAMS` entry per selectable bank, setting `group` to the new group key.
4. Run `pnpm build` and `pnpm lint`.

The setup screen and loader derive their choices and file loading from these entries; they should not need changes for a new exam or group.
