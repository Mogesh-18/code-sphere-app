'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, Clock,
    RotateCcw, Brain, AlertCircle, CheckSquare, Circle,
} from 'lucide-react'
import type { Quiz, Question, QuizResult } from '@/types/quiz'
import { useProgressStore } from '@/lib/progress/store'
import { cn, generateUUID, percentage } from '@/lib/utils'

interface Props {
    quiz: Quiz
    courseTitle: string
    courseSlug: string
}

type Phase = 'intro' | 'active' | 'results'

export function QuizEngine({ quiz, courseTitle, courseSlug }: Props) {
    const [phase, setPhase] = useState<Phase>('intro')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
    const [showExplanation, setShowExplanation] = useState(false)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [startTime, setStartTime] = useState(0)
    const recordQuizAttempt = useProgressStore(s => s.recordQuizAttempt)

    const questions = quiz.questions
    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length
    const answeredCount = Object.keys(answers).length
    const progress = percentage(currentIndex + (showExplanation ? 1 : 0), totalQuestions)

    function startQuiz() {
        setPhase('active')
        setStartTime(Date.now())
        setCurrentIndex(0)
        setAnswers({})
        setShowExplanation(false)
    }

    function handleAnswer(questionId: string, answerId: string | string[]) {
        if (showExplanation) return
        setAnswers(prev => ({ ...prev, [questionId]: answerId }))
    }

    function handleSingleChoice(qId: string, optId: string) {
        if (showExplanation) return
        setAnswers(prev => ({ ...prev, [qId]: optId }))
        // Auto-advance after short delay for single choice
        setTimeout(() => {
            if (quiz.showExplanations) {
                setShowExplanation(true)
            } else {
                advanceQuestion(qId, optId)
            }
        }, 400)
    }

    function handleTrueFalse(qId: string, answer: boolean) {
        if (showExplanation) return
        const val = answer ? 'true' : 'false'
        setAnswers(prev => ({ ...prev, [qId]: val }))
        setTimeout(() => {
            if (quiz.showExplanations) {
                setShowExplanation(true)
            } else {
                advanceQuestion(qId, val)
            }
        }, 400)
    }

    function advanceQuestion(qId?: string, ans?: string | string[]) {
        const allAnswers = qId ? { ...answers, [qId]: ans as string | string[] } : answers
        setShowExplanation(false)

        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            finishQuiz(allAnswers)
        }
    }

    function finishQuiz(finalAnswers: Record<string, string | string[]>) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000)

        let totalPoints = 0
        let earnedPoints = 0
        let correctCount = 0

        const questionResults = questions.map(q => {
            totalPoints += q.points
            const userAnswer = finalAnswers[q.id]
            const correctAnswer = getCorrectAnswer(q)
            const isCorrect = checkAnswer(q, userAnswer)

            if (isCorrect) {
                earnedPoints += q.points
                correctCount++
            }

            return {
                questionId: q.id,
                isCorrect,
                userAnswer: userAnswer ?? '',
                correctAnswer,
                explanation: q.explanation,
                points: q.points,
                earnedPoints: isCorrect ? q.points : 0,
            }
        })

        const score = Math.round((earnedPoints / totalPoints) * 100)
        const passed = score >= quiz.passingScore

        const quizResult: QuizResult = {
            quizId: quiz.id,
            score,
            totalPoints,
            earnedPoints,
            correctCount,
            totalCount: totalQuestions,
            passed,
            timeSpentSeconds: timeSpent,
            questionResults,
        }

        setResult(quizResult)
        setPhase('results')

        // Record attempt
        recordQuizAttempt({
            id: generateUUID(),
            courseSlug,
            score,
            totalQuestions,
            correctAnswers: correctCount,
            completedAt: new Date().toISOString(),
            timeSpentSeconds: timeSpent,
            answers: finalAnswers,
        })
    }

    function getCorrectAnswer(q: Question): string | string[] {
        switch (q.type) {
            case 'single-choice':
            case 'multiple-choice':
            case 'code-output':
                return (q as any).options
                    .filter((o: any) => o.isCorrect)
                    .map((o: any) => o.id)
            case 'true-false':
                return (q as any).answer ? 'true' : 'false'
            case 'fill-blank':
                return (q as any).blanks.map((b: any) => b.acceptedAnswers[0])
            default:
                return ''
        }
    }

    function checkAnswer(q: Question, userAnswer: string | string[] | undefined): boolean {
        if (!userAnswer) return false
        const correct = getCorrectAnswer(q)

        switch (q.type) {
            case 'single-choice':
            case 'code-output':
            case 'true-false':
                return (Array.isArray(correct) ? correct[0] : correct) === userAnswer
            case 'multiple-choice': {
                const correctArr = Array.isArray(correct) ? [...correct].sort() : [correct]
                const userArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : [userAnswer]
                return JSON.stringify(correctArr) === JSON.stringify(userArr)
            }
            default:
                return false
        }
    }

    // ── Intro ──
    if (phase === 'intro') {
        return (
            <div className="text-center">
                <Link
                    href={`/courses/${courseSlug}`}
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-white transition-colors mb-10"
                >
                    <ArrowLeft size={14} /> Back to {courseTitle}
                </Link>

                <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                    <Trophy size={36} className="text-amber-400" />
                </div>

                <h1 className="font-display text-3xl font-700 text-white mb-3">{quiz.title}</h1>
                <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{quiz.description}</p>

                {/* Quiz stats */}
                <div className="grid grid-cols-3 gap-4 mb-10 max-w-sm mx-auto">
                    {[
                        { label: 'Questions', value: totalQuestions },
                        { label: 'Passing Score', value: `${quiz.passingScore}%` },
                        { label: 'Time Limit', value: quiz.timeLimit ? `${quiz.timeLimit / 60}m` : 'None' },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-4 rounded-xl bg-[#0F0F1A] border border-white/[0.08] text-center">
                            <p className="font-display font-700 text-white text-xl">{value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] mb-8">
                    <AlertCircle size={13} />
                    <span>The AI assistant is disabled during quizzes</span>
                </div>

                <button onClick={startQuiz} className="btn btn-primary btn-lg">
                    Begin Quiz
                    <ArrowRight size={16} />
                </button>
            </div>
        )
    }

    // ── Results ──
    if (phase === 'results' && result) {
        return (
            <div>
                <div className="text-center mb-10">
                    {/* Score ring */}
                    <div className={cn(
                        'inline-flex items-center justify-center w-28 h-28 rounded-full border-4 mb-6',
                        result.passed
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-rose-500 bg-rose-500/10 text-rose-400'
                    )}>
                        <div>
                            <p className="font-display font-800 text-4xl">{result.score}%</p>
                        </div>
                    </div>

                    <h2 className={cn(
                        'font-display text-2xl font-700 mb-2',
                        result.passed ? 'text-emerald-400' : 'text-rose-400'
                    )}>
                        {result.passed ? '🎉 Passed!' : '📚 Keep Studying'}
                    </h2>
                    <p className="text-[var(--text-secondary)]">
                        {result.correctCount} of {result.totalCount} correct ·{' '}
                        {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
                    </p>

                    <div className="flex justify-center gap-4 mt-8">
                        <button onClick={startQuiz} className="btn btn-secondary btn-md">
                            <RotateCcw size={14} /> Retake Quiz
                        </button>
                        <Link href={`/courses/${courseSlug}`} className="btn btn-primary btn-md">
                            Back to Course
                        </Link>
                    </div>
                </div>

                {/* Question review */}
                <div className="space-y-4">
                    <h3 className="font-display font-600 text-white">Review Answers</h3>
                    {result.questionResults.map((r, i) => {
                        const q = questions.find(q => q.id === r.questionId)!
                        return (
                            <div
                                key={r.questionId}
                                className={cn(
                                    'p-5 rounded-xl border',
                                    r.isCorrect
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-rose-500/5 border-rose-500/20'
                                )}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    {r.isCorrect
                                        ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                        : <XCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                                    }
                                    <p className="text-sm text-white font-500">{q.question}</p>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-7">
                                    {r.explanation}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // ── Active quiz ──
    const currentAnswer = answers[currentQuestion.id]
    const hasAnswered = !!currentAnswer

    return (
        <div>
            {/* Progress bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                    <span>Question {currentIndex + 1} of {totalQuestions}</span>
                    <span className="text-amber-400 font-600">{progress}%</span>
                </div>
                <div className="progress-bar h-1.5">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Question card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0F0F1A] overflow-hidden mb-6">
                {/* Question header */}
                <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={cn(
                            'badge text-2xs',
                            currentQuestion.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                currentQuestion.difficulty === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                                    'text-rose-400 bg-rose-400/10 border-rose-400/20'
                        )}>
                            {currentQuestion.difficulty}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{currentQuestion.points} pt{currentQuestion.points !== 1 ? 's' : ''}</span>
                    </div>

                    <h2 className="font-display font-600 text-white text-lg leading-relaxed">
                        {currentQuestion.question}
                    </h2>

                    {/* Code snippet for code-output questions */}
                    {'code' in currentQuestion && currentQuestion.code && (
                        <pre className="mt-4 p-4 bg-[#0D0D16] border border-white/[0.07] rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                            {currentQuestion.code}
                        </pre>
                    )}
                </div>

                {/* Options */}
                <div className="p-7 space-y-3">
                    <QuestionOptions
                        question={currentQuestion}
                        answer={currentAnswer}
                        showExplanation={showExplanation}
                        onSingleChoice={handleSingleChoice}
                        onMultipleChoice={(qId, optId) => {
                            const current = (answers[qId] as string[]) || []
                            const updated = current.includes(optId)
                                ? current.filter(id => id !== optId)
                                : [...current, optId]
                            handleAnswer(qId, updated)
                        }}
                        onTrueFalse={handleTrueFalse}
                    />
                </div>

                {/* Explanation */}
                {showExplanation && (
                    <div className="mx-7 mb-7 p-4 rounded-xl bg-cyan-500/8 border border-cyan-500/20">
                        <div className="flex items-center gap-2 text-cyan-400 text-xs font-600 mb-2">
                            <Brain size={13} />
                            Explanation
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => { setCurrentIndex(prev => Math.max(0, prev - 1)); setShowExplanation(false) }}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary btn-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ArrowLeft size={15} /> Previous
                </button>

                {showExplanation ? (
                    <button
                        onClick={() => advanceQuestion()}
                        className="btn btn-primary btn-md group"
                    >
                        {currentIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    currentQuestion.type === 'multiple-choice' && (
                        <button
                            onClick={() => {
                                if (hasAnswered) {
                                    if (quiz.showExplanations) setShowExplanation(true)
                                    else advanceQuestion()
                                }
                            }}
                            disabled={!hasAnswered}
                            className="btn btn-primary btn-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Check Answer
                        </button>
                    )
                )}
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────
// Question options renderer
// ──────────────────────────────────────────────────

interface OptionsProps {
    question: Question
    answer: string | string[] | undefined
    showExplanation: boolean
    onSingleChoice: (qId: string, optId: string) => void
    onMultipleChoice: (qId: string, optId: string) => void
    onTrueFalse: (qId: string, answer: boolean) => void
}

function QuestionOptions({ question, answer, showExplanation, onSingleChoice, onMultipleChoice, onTrueFalse }: OptionsProps) {
    switch (question.type) {
        case 'single-choice':
        case 'code-output': {
            const selected = answer as string | undefined
            return (
                <>
                    {question.options.map(opt => {
                        const isSelected = selected === opt.id
                        const isCorrect = opt.isCorrect
                        const showResult = showExplanation && isSelected

                        return (
                            <button
                                key={opt.id}
                                onClick={() => onSingleChoice(question.id, opt.id)}
                                disabled={showExplanation}
                                className={cn(
                                    'w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border text-left transition-all',
                                    showResult && isCorrect ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' :
                                        showResult && !isCorrect ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' :
                                            isSelected ? 'bg-amber-500/15 border-amber-500/40 text-white' :
                                                'bg-white/[0.02] border-white/[0.08] text-[var(--text-secondary)] hover:border-amber-500/30 hover:text-white'
                                )}
                            >
                                <span className={cn(
                                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-700',
                                    isSelected ? 'border-amber-400 bg-amber-400/20 text-amber-400' : 'border-white/20 text-[var(--text-muted)]'
                                )}>
                                    {opt.id.toUpperCase()}
                                </span>
                                <span className="flex-1 text-sm">{opt.text}</span>
                                {showResult && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
                                {showResult && !isCorrect && <XCircle size={16} className="text-rose-400 flex-shrink-0" />}
                            </button>
                        )
                    })}
                </>
            )
        }

        case 'multiple-choice': {
            const selected = (answer as string[]) || []
            return (
                <>
                    <p className="text-xs text-[var(--text-muted)] mb-2">Select all that apply</p>
                    {question.options.map(opt => {
                        const isSelected = selected.includes(opt.id)
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onMultipleChoice(question.id, opt.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border text-left transition-all',
                                    isSelected
                                        ? 'bg-amber-500/15 border-amber-500/40 text-white'
                                        : 'bg-white/[0.02] border-white/[0.08] text-[var(--text-secondary)] hover:border-amber-500/30 hover:text-white'
                                )}
                            >
                                <div className={cn(
                                    'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center',
                                    isSelected ? 'border-amber-400 bg-amber-400/20' : 'border-white/20'
                                )}>
                                    {isSelected && <CheckSquare size={11} className="text-amber-400" />}
                                </div>
                                <span className="text-sm">{opt.text}</span>
                            </button>
                        )
                    })}
                </>
            )
        }

        case 'true-false': {
            const selected = answer as string | undefined
            return (
                <div className="flex gap-4">
                    {[true, false].map(val => {
                        const id = val ? 'true' : 'false'
                        const isSelected = selected === id
                        return (
                            <button
                                key={id}
                                onClick={() => onTrueFalse(question.id, val)}
                                disabled={showExplanation}
                                className={cn(
                                    'flex-1 py-4 rounded-xl border text-sm font-600 transition-all',
                                    isSelected
                                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                        : 'bg-white/[0.02] border-white/[0.08] text-[var(--text-secondary)] hover:border-amber-500/30 hover:text-white'
                                )}
                            >
                                {val ? 'True ✓' : 'False ✗'}
                            </button>
                        )
                    })}
                </div>
            )
        }

        default:
            return <p className="text-[var(--text-muted)] text-sm">Question type not supported in preview</p>
    }
}