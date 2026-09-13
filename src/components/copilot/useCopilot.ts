import { useCallback, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { useEngine, useInterviewContext } from '@/lib/hooks'
import type { AnswerSet, RefineAction, InterviewTurn } from '@/lib/types'
import { toast } from '@/components/ui/Toasts'

export function useCopilot(interviewId: string) {
  const interview = useStore((s) => s.interviews.find((i) => i.id === interviewId))
  const addTurn = useStore((s) => s.addTurn)
  const updateTurn = useStore((s) => s.updateTurn)
  const engine = useEngine()
  const ctx = useInterviewContext(interview)
  const [busy, setBusy] = useState(false)
  const [refining, setRefining] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const ask = useCallback(async (question: string) => {
    const q = question.trim()
    if (!q || !interview) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    const turn = addTurn(interview.id, q)
    updateTurn(interview.id, turn.id, { status: 'analyzing' })
    setBusy(true)
    try {
      // Speed first: the fast analysis (key points) and the streamed answers run in parallel,
      // so KEY POINTS show up before the full answer finishes.
      const analysisP = engine.analyzeQuestion(ctx, q, ac.signal)
        .then((analysis) => { updateTurn(interview.id, turn.id, { analysis, status: 'answering' }); return analysis })
        .catch((e: unknown) => { if (!ac.signal.aborted) toast.error(`Analysis failed: ${(e as Error).message}`); return undefined })
      const answersP = engine.generateAnswers(ctx, q, undefined, (u) => {
        updateTurn(interview.id, turn.id, { answers: { quick: u.answers.quick ?? '', natural: u.answers.natural ?? '', strong: u.answers.strong ?? '' }, followUps: u.followUps.length ? u.followUps : undefined, status: 'answering' })
      }, ac.signal)
      const [analysis, result] = await Promise.all([analysisP, answersP])
      let followUps = result.followUps
      if (!followUps.length) {
        try { followUps = await engine.predictFollowUps(ctx, q, result.answers.natural, ac.signal) } catch { /* optional */ }
      }
      updateTurn(interview.id, turn.id, { analysis, answers: result.answers, followUps, activeAnswer: 'natural', status: 'done' })
    } catch (e) {
      if (ac.signal.aborted) return
      updateTurn(interview.id, turn.id, { status: 'error', error: (e as Error).message })
      toast.error((e as Error).message)
    } finally {
      if (abortRef.current === ac) setBusy(false)
    }
  }, [interview, ctx, engine, addTurn, updateTurn])

  const refine = useCallback(async (turn: InterviewTurn, action: RefineAction) => {
    if (!interview || !turn.answers) return
    const key: keyof AnswerSet = turn.activeAnswer ?? 'natural'
    const current = turn.answers[key]
    setRefining(turn.id)
    try {
      const out = await engine.refineAnswer(ctx, turn.question, current, action, (partial) => {
        updateTurn(interview.id, turn.id, { answers: { ...turn.answers!, [key]: partial } })
      })
      updateTurn(interview.id, turn.id, { answers: { ...turn.answers, [key]: out } })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setRefining(null)
    }
  }, [interview, ctx, engine, updateTurn])

  const setActive = useCallback((turnId: string, key: keyof AnswerSet) => {
    if (interview) updateTurn(interview.id, turnId, { activeAnswer: key })
  }, [interview, updateTurn])

  const stop = useCallback(() => { abortRef.current?.abort(); setBusy(false) }, [])

  return { interview, ctx, ask, refine, setActive, busy, refining, stop }
}
