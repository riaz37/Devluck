"use client";
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter, useSearchParams }  from "next/navigation";
import { SessionData } from '@/api/questions'
import { api as apiClient } from '@/lib/api'
import { useTelemetry } from '@/hooks/studentapihandler/useTelemetry'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as blazeface from '@tensorflow-models/blazeface'
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LoadingState } from '@/components/common/LoadingState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Loader2, Monitor, Shield, ShieldCheck,Lock, Hourglass, MousePointerClick, Maximize, FileWarning, Timer, Save, Send, CheckCircle2 } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import Image from "next/image"
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';


// ─── Helper: format seconds as M:SS ──────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Helper: dimension display name ──────────────────────────────
function formatDimension(dim: string): string {
  return dim.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Dimension colors ────────────────────────────────────────────
const DIM_COLORS: Record<string, string> = {
  technical_execution: '#3B82F6',
  communication: '#8B5CF6',
  personality: '#EC4899',
  work_ethic: '#F59E0B',
  motivation: '#10B981',
}

export default function AssessmentPage() {
  const params = useParams<{ sessionId?: string }>()
  const searchParams = useSearchParams()
  const sessionId = (searchParams.get("sessionId") || params?.sessionId || "").trim()
  const isInviteFlow = searchParams.get("source") === "invite"
  const router = useRouter()

  const { user } = useAuth()

  const watermarkText = user
    ? `${user.email} • ${user.role}`
    : (sessionId || "candidate")

  // ─── Core state ──────────────────────────────────────────────
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Question navigation ────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentDraft, setCurrentDraft] = useState('')
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)

  // ─── Timer ──────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── UI state ───────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [starting, setStarting] = useState(false)
  const [elapsedSecs, setElapsedSecs] = useState(0)

  // ─── Anti-cheat state ─────────────────────────────────────────
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [isBlurred, setIsBlurred] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenPrompt, setFullscreenPrompt] = useState(true)
  const [duplicateTab, setDuplicateTab] = useState(false)
  const [windowTooSmall, setWindowTooSmall] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // ─── Face-API Proctoring State ──────────────────────────────
  const [isFaceApiLoaded, setIsFaceApiLoaded] = useState(false)
  const [blazeModel, setBlazeModel] = useState<blazeface.BlazeFaceModel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // ─── Refs for timer callback access ─────────────────────────
  const sessionRef = useRef(session)
  const currentIndexRef = useRef(currentQuestionIndex)
  const currentDraftRef = useRef(currentDraft)
  const selectedChoiceRef = useRef(selectedChoice)

  useEffect(() => { sessionRef.current = session }, [session])
  useEffect(() => { currentIndexRef.current = currentQuestionIndex }, [currentQuestionIndex])
  useEffect(() => { currentDraftRef.current = currentDraft }, [currentDraft])
  useEffect(() => { selectedChoiceRef.current = selectedChoice }, [selectedChoice])

  // ─── Toast auto-dismiss ─────────────────────────────────────
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // ─── Load session ───────────────────────────────────────────
  const loadSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await apiClient.get(`/api/student/assessment/${sessionId}`)
      setSession(res.data?.data || null)
      setError(null)
      toast.success("Session loaded successfully")
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load session')
      toast.error('Failed to load session')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => { loadSession() }, [loadSession])

  useEffect(() => {
    if (!sessionId || !session) return
    const noQuestions = (session.questions || []).length === 0
    const sessionDone = session.status === 'completed'
    if (!noQuestions || sessionDone) return

    const elapsedTimer = setInterval(() => {
      setElapsedSecs(prev => prev + 1)
    }, 1000)

    const pollTimer = setInterval(async () => {
      try {
        const res = await apiClient.get(`/api/student/assessment/${sessionId}`)
        const nextSession = res.data?.data || null
        if (nextSession) {
          setSession(nextSession)
        }
      } catch {}
    }, 5000)

    return () => {
      clearInterval(elapsedTimer)
      clearInterval(pollTimer)
    }
  }, [sessionId, session])

  // ─── Restore violation count from backend on mount ─────────
  useEffect(() => {
    if (!sessionId) return
    apiClient.get(`/api/student/assessment/${sessionId}/violations`)
      .then(res => {
        const serverCount = res.data?.data?.violation_count || 0
        if (serverCount > 0) setTabSwitchCount(serverCount)
      })
      .catch(() => {}) // Non-critical
  }, [sessionId])

  // ─── Derived values ─────────────────────────────────────────
  const questions = session?.questions || []
  const answers = session?.answers || {}
  const evaluations = session?.evaluations || {}
  const currentQuestion = questions[currentQuestionIndex] || null
  const isCurrentLocked = currentQuestion ? !!answers[currentQuestion.id] : false
  const totalAnswered = Object.keys(answers).length
  const totalEvaluated = Object.keys(evaluations).length

  // ─── Behavioral telemetry ──────────────────────────────────
  const { pushEvent } = useTelemetry(
    sessionId || '',
    currentQuestion?.id || '',
    !isInviteFlow && !!(currentQuestion && !answers[currentQuestion.id])
  )

  // ─── Anti-cheat: Tab switch & blur detection ──────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true)
        setTabSwitchCount(prev => {
          const next = prev + 1
          setToastMessage(`⚠️ Tab switch detected! (${next} violation${next > 1 ? 's' : ''})`)
          return next
        })
      } else {
        setTimeout(() => setIsBlurred(false), 1500)
      }
    }

    const handleBlur = () => setIsBlurred(true)
    const handleFocus = () => setTimeout(() => setIsBlurred(false), 1000)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        setIsBlurred(true)
        setTabSwitchCount(prev => prev + 1)
        setToastMessage('⚠️ Screenshot attempt detected!')
        pushEvent('screenshot_attempt', { method: 'PrintScreen' })
        setTimeout(() => setIsBlurred(false), 2000)
      }
      if ((e.ctrlKey && e.shiftKey && e.key === 'S') || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault()
        setToastMessage('⚠️ Screenshots and printing are not allowed during the assessment.')
        pushEvent('screenshot_attempt', { method: 'keyboard_shortcut' })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // ─── Anti-cheat: Fullscreen enforcement ─────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement
      setIsFullscreen(isFull)
      if (!isFull && !fullscreenPrompt) {
        setFullscreenPrompt(true)
        setTabSwitchCount(prev => {
          const next = prev + 1
          setToastMessage(`⚠️ Exited fullscreen! (${next} violation${next > 1 ? 's' : ''})`)
          return next
        })
        pushEvent('fullscreen_exit', {})
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [fullscreenPrompt, pushEvent])

  // ─── Anti-cheat: Window size monitoring ─────────────────────────
  useEffect(() => {
    const checkSize = () => {
      const minW = screen.width * 0.85
      const minH = screen.height * 0.75
      const tooSmall = window.innerWidth < minW || window.innerHeight < minH
      setWindowTooSmall(tooSmall)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  // ─── Anti-cheat: Duplicate tab detection ────────────────────────
  useEffect(() => {
    if (!sessionId) return
    const channelName = `devluck-assess-${sessionId}`
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel(channelName)
      // Announce presence
      bc.postMessage({ type: 'PING' })
      bc.onmessage = (e) => {
        if (e.data?.type === 'PING') {
          // Another tab opened — tell it to close
          bc?.postMessage({ type: 'DUPLICATE' })
        }
        if (e.data?.type === 'DUPLICATE') {
          setDuplicateTab(true)
        }
      }
    } catch {
      // BroadcastChannel not supported — skip
    }
    return () => bc?.close()
  }, [sessionId])

  // ─── Anti-cheat: Webcam Proctoring ────────────────────────────────
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Force CPU backend. On some Windows machines, the default WebGL backend 
        // silently fails to compute tensors, returning 0 detections perfectly infinitely.
        // Since we only check every 1 second, CPU is plenty fast and 100% bug-free.
        await tf.setBackend('cpu')
        await tf.ready()

        // Load Google's BlazeFace model
        const model = await blazeface.load()
        setBlazeModel(model)
        setIsFaceApiLoaded(true)
      } catch (err) {
        console.error("Failed to load BlazeFace detection model", err)
      }
    }
    loadModels()
  }, [])

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node && streamRef.current && node.srcObject !== streamRef.current) {
      node.srcObject = streamRef.current
      node.play().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (fullscreenPrompt) return // Defer camera until user enters fullscreen

    let mounted = true
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current && videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      } catch (err) {
        if (mounted) setToastMessage("⚠️ Please enable webcam access for proctoring.")
      }
    }
    startVideo()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [fullscreenPrompt])

  useEffect(() => {
    if (!isFaceApiLoaded || !blazeModel || !sessionId || !currentQuestion) return

    let missingFaceCount = 0

    const intervalId = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const predictions = await blazeModel.estimateFaces(videoRef.current, false)
        const faceCount = predictions.length
        
        if (faceCount === 0) {
          missingFaceCount++
          // Require 4 consecutive failed scans (4 seconds) to trigger an alert explicitly
          if (missingFaceCount >= 4) {
            setToastMessage("⚠️ Proctor Alert: Face not detected in webcam.")
            pushEvent('no_face', {})
            missingFaceCount = 0 // Reset after alerting so it doesn't spam forever
          }
        } else {
          missingFaceCount = 0 // Valid face detected, reset counter
          
          if (faceCount > 1) {
            setToastMessage("⚠️ Proctor Alert: Multiple faces detected.")
            pushEvent('multiple_faces', {})
          }
        }
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isFaceApiLoaded, sessionId, currentQuestion])

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
      setFullscreenPrompt(false)
      if (session && !session.started_at && session.status !== 'completed') {
        setStarting(true)
        try {
          await apiClient.post(`/api/student/assessment/${sessionId}/start`)
          await loadSession()
        } catch (err: any) {
          setToastMessage('Failed to start assessment')
        } finally {
          setStarting(false)
        }
      }
    } catch {
      // Fallback — allow without fullscreen but warn
      setFullscreenPrompt(false)
      setToastMessage('⚠️ Fullscreen not available. Your window activity is being monitored.')
    }
  }

  // ─── Anti-cheat: Block copy/cut/right-click on questions ──────
  const blockEvent = (e: React.SyntheticEvent) => {
    e.preventDefault()
    setToastMessage('⚠️ Copying questions is not allowed.')
  }
  // ─── goToNextUnanswered ─────────────────────────────────────
  const goToNextUnanswered = useCallback(() => {
    const qs = sessionRef.current?.questions || []
    const ans = sessionRef.current?.answers || {}
    const idx = currentIndexRef.current

    // Find first unanswered after current
    for (let i = idx + 1; i < qs.length; i++) {
      if (!ans[qs[i].id]) {
        setCurrentQuestionIndex(i)
        return
      }
    }
    // Wrap from beginning
    for (let i = 0; i < idx; i++) {
      if (!ans[qs[i].id]) {
        setCurrentQuestionIndex(i)
        return
      }
    }
    // All answered
    setToastMessage('🎉 All questions answered! You can now evaluate your answers.')
  }, [])

  // ─── Save answer ────────────────────────────────────────────
  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!answer.trim() && answer !== '[No answer — time expired]') {
      setToastMessage('Please write an answer before saving.')
      return
    }
    setSaving(true)
    try {
      await apiClient.post(`/api/student/assessment/${sessionId}/answer`, { questionId, answer })
      const updated = await apiClient.get(`/api/student/assessment/${sessionId}`)
      setSession(updated.data?.data || null)
      setCurrentDraft('')
      setSelectedChoice(null)
      setToastMessage('✓ Answer saved and locked')
    } catch (err: any) {
      if (err.response?.status === 423) {
        setToastMessage('🔒 This answer is already locked')
      } else {
        setToastMessage('❌ Failed to save answer. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }, [sessionId])

  // ─── Handle timer expiry ────────────────────────────────────
  const handleTimerExpired = useCallback(async () => {
    const sess = sessionRef.current
    const idx = currentIndexRef.current
    const question = sess?.questions?.[idx]
    if (!question) return

    // Already answered? skip
    if (sess?.answers?.[question.id]) return

    setAutoAdvancing(true)

    const qType = question.question_type
    let answerToSubmit: string

    if (qType === 'mcq') {
      answerToSubmit = selectedChoiceRef.current || '[No answer — time expired]'
    } else {
      answerToSubmit = currentDraftRef.current.trim() || '[No answer — time expired]'
    }

    await saveAnswer(question.id, answerToSubmit)

    // Brief delay then auto-advance
    setTimeout(() => {
      setAutoAdvancing(false)
      goToNextUnanswered()
    }, 1200)
  }, [saveAnswer, goToNextUnanswered])

  // ─── Timer effect (persisted via localStorage) ──────────────
  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!currentQuestion) return

    // If already answered, don't start timer
    if (answers[currentQuestion.id]) {
      setTimeLeft(0)
      return
    }

    const limit = currentQuestion.time_limit_seconds || 300
    const storageKey = `devluck_timer_${sessionId}_${currentQuestion.id}`

    // Check if we've already started timing this question
    let firstOpenedAt = parseInt(localStorage.getItem(storageKey) || '0', 10)
    if (!firstOpenedAt) {
      firstOpenedAt = Math.floor(Date.now() / 1000)
      localStorage.setItem(storageKey, String(firstOpenedAt))
    }

    // Calculate remaining time based on when question was first opened
    const nowSecs = Math.floor(Date.now() / 1000)
    const elapsed = nowSecs - firstOpenedAt
    const remaining = Math.max(0, limit - elapsed)

    if (remaining <= 0) {
      setTimeLeft(0)
      handleTimerExpired()
      return
    }

    setTimeLeft(remaining)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          handleTimerExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQuestion?.id, isCurrentLocked])

  // ─── Reset draft when switching questions ───────────────────
  useEffect(() => {
    setCurrentDraft('')
    setSelectedChoice(null)
  }, [currentQuestionIndex])

  // ─── Navigation handlers ────────────────────────────────────
  const goToPrev = () => {
    // Skip locked questions going backward
    for (let i = currentQuestionIndex - 1; i >= 0; i--) {
      if (!answers[questions[i].id]) {
        setCurrentQuestionIndex(i)
        return
      }
    }
    setToastMessage('No previous unanswered questions')
  }

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleNavClick = (index: number) => {
    const q = questions[index]
    if (answers[q.id]) {
      setToastMessage('🔒 This answer has been locked and cannot be changed.')
      return
    }
    setCurrentQuestionIndex(index)
  }

  // ─── Handle save button ────────────────────────────────────
  const handleSave = () => {
    if (!currentQuestion) return
    const qType = currentQuestion.question_type
    if (qType === 'mcq') {
      if (!selectedChoice) {
        setToastMessage('Please select a choice before saving.')
        return
      }
      saveAnswer(currentQuestion.id, selectedChoice)
    } else {
      saveAnswer(currentQuestion.id, currentDraft)
    }
  }

  // ─── Handle submit assessment ──────────────────────────────
  const handleSubmitAssessment = async () => {
    if (!sessionId) return
    setShowConfirmModal(false)
    setSubmitting(true)
    try {
      await apiClient.post(`/api/student/assessment/${sessionId}/submit`)
      router.replace("/Student/dashboard")
    } catch (err: any) {
      setToastMessage('❌ Submission failed: ' + (err.response?.data?.detail || err.message))
      setSubmitting(false)
    }
  }

  // ─── Timer color and class ─────────────────────────────────
  const getTimerClass = () => {
    if (timeLeft <= 10) return 'timer-display timer-danger'
    if (timeLeft <= 30) return 'timer-display timer-warning'
    return 'timer-display timer-ok'
  }

  // ─── Question nav button class ─────────────────────────────
  const getNavBtnClass = (index: number) => {
    const q = questions[index]
    const isAnswered = !!answers[q.id]
    const isEvaluated = !!evaluations[q.id]
    const isCurrent = index === currentQuestionIndex

    let cls = 'qnav-btn'
    if (isCurrent) cls += ' qnav-current'
    if (isAnswered) cls += ' qnav-locked'
    if (isEvaluated) cls += ' qnav-evaluated'
    return cls
  }

  // ─── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState label="Fetching Data..." />
      </div>
    )
  }

if (!sessionId) {
  return (
    <EmptyState
      title="Assessment session not found"
      description="The session ID is missing or invalid. Please go back and try again."
      icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
      action={
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      }
      className="min-h-screen"
    />
  );
}

if (error || !session) {
  return (
    <ErrorState
      title="Something went wrong"
      description={error || "Session not found"}
      onRetry={() => router.back()}
      icon={<AlertTriangle className="h-10 w-10" />}
      className="min-h-screen"
    />
  );
}

  // ─── Gate: Duplicate tab ───────────────────────────────────
  if (duplicateTab) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <EmptyState
          title="Assessment already open"
          description="This assessment is already active in another tab. Please continue there to avoid conflicts."
          icon={<Tabs className="h-10 w-10 text-amber-500" />}
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => window.close()}>
                Close Tab
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.focus()}
              >
                Go to Original Tab
              </Button>
            </div>
          }
          className="min-h-screen"
        />
      </div>
    );
  }

  if (
    !loading &&
    session &&
    (session.questions || []).length === 0 &&
    session.status !== "completed"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">

        <Card className="w-full max-w-lg">

          {/* HEADER */}
          <CardHeader className="text-center space-y-3">

            {/* ICON */}
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Hourglass className="w-6 h-6 text-primary animate-pulse" />
            </div>

            <CardTitle className="text-xl">
              Preparing Your Assessment
            </CardTitle>

            <CardDescription>
              We are generating personalized questions based on your role.
              This usually takes 2–3 minutes.
            </CardDescription>

          </CardHeader>

          {/* BODY */}
          <CardContent className="space-y-5 text-center">

            {/* TIMER */}
            <div className="text-sm text-muted-foreground">
              {elapsedSecs > 0
                ? `${elapsedSecs}s elapsed`
                : "Initializing system..."}
            </div>

            {/* PROGRESS BAR */}
            <div className="flex justify-center">
              <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/2 bg-primary animate-pulse" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You can safely leave this page and return later from your dashboard.
            </p>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">

              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>

              <Button
                disabled={retrying}
                onClick={async () => {
                  setRetrying(true)
                  try {
                    await apiClient.post(
                      `/api/student/assessment/${sessionId}/retry-generation`
                    )
                    setElapsedSecs(0)
                    setToastMessage("Generation restarted")
                    await loadSession()
                  } catch {
                    setToastMessage("Failed to retry generation")
                  } finally {
                    setRetrying(false)
                  }
                }}
              >
                {retrying ? "Retrying..." : "Retry Generation"}
              </Button>

            </div>

          </CardContent>

        </Card>

      </div>
    )
  }

  // ─── Gate: Fullscreen prompt ──────────────────────────────
  if (fullscreenPrompt && !loading && session) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Monitor className="w-6 h-6 text-primary" />
            </div>

            <CardTitle>Fullscreen Required</CardTitle>

            <CardDescription>
              This assessment must be taken in fullscreen mode to ensure a fair evaluation.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              You can start now or return later before your deadline.
            </p>

            <p className="text-xs font-medium text-muted-foreground flex flex-wrap items-center justify-center gap-3 text-center">
              
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                No tab switching
              </span>

              <span className="flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5" />
                No copy/paste
              </span>

              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                Fullscreen only
              </span>

            </p>

            {tabSwitchCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {tabSwitchCount} violation{tabSwitchCount > 1 ? "s" : ""} recorded
                </span>
              </div>
            )}

            <div className="pt-2">
              <Button
                className="w-full"
                onClick={enterFullscreen}
                disabled={starting}
              >
                {starting ? "Starting..." : "Enter Fullscreen & Start"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-background">
      {/* Window warning */}
      {windowTooSmall && !isBlurred && (
        <div className="fixed top-0 inset-x-0 z-50 bg-yellow-500/10 border-b border-yellow-500/20 p-3 flex items-center justify-between">
          
          <div className="text-sm flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-yellow-500" />
            <span> Please maximize your browser window for full experience</span>
          </div>

          <Button size="sm" onClick={enterFullscreen} className="gap-1">
            <Maximize className="w-4 h-4" />
            Go Fullscreen
          </Button>

        </div>
      )}

      {/* Blur overlay */}
      {isBlurred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <Card className="p-6 text-center">
            <Shield className="mx-auto mb-2 w-6 h-6" />
            <h3 className="font-semibold">Assessment Protected</h3>
            <p className="text-sm text-muted-foreground">
              Return to continue your assessment
            </p>
          </Card>
        </div>
      )}

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
  
        <div className="flex items-center gap-4">
          
          {/* Logo + Title */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="DevLuck Logo"
              width={22}
              height={22}
              className="h-5 w-5"
            />

            <h1 className="font-semibold text-lg">DevLuck</h1>
          </div>

          <Separator orientation="vertical" className="h-5" />

          <span className="text-sm text-muted-foreground">
            Session: <span className="font-medium">{session.session_id}</span>
          </span>

          <Badge variant="secondary">{session.company_style}</Badge>

          {tabSwitchCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            ⚠️ {tabSwitchCount} tab switch violation {tabSwitchCount > 1 ? "s" : ""} detected
          </Badge>
          )}

        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {totalAnswered}/{questions.length} answered
          </div>

          <div className="w-40">
            <Progress value={(totalAnswered / questions.length) * 100} />
          </div>
        </div>

      </header>

      {/* ─── Body ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 p-6">
        {/* ─── Left: Question Navigator ─────────────────────── */}
          <aside className="space-y-4">

            {/* ─── Proctoring Card ───────────────────────────── */}
            <Card className="p-3 space-y-2">

              {/* Video */}
              <div className="relative overflow-hidden rounded-md bg-black">
                <video
                  ref={videoCallbackRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full scale-x-[-1]"
                />

                {/* Loading overlay */}
                {!isFaceApiLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs">
                    Loading AI...
                  </div>
                )}

                {/* status */}
                <div className="absolute bottom-2 left-2">
                  <Badge className="text-[10px] bg-green-500/20 text-green-400 border-0">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Proctoring Active
                  </Badge>
                </div>
              </div>

            </Card>

            {/* ─── Questions Navigator ───────────────────────── */}
            <Card className="p-4 space-y-3">

              <div className="flex items-center justify-between">
                <h3 className="font-medium">Questions</h3>
                <Badge variant="outline" className="text-xs">
                  {questions.length}
                </Badge>
              </div>

              <Separator />

              {/* Grid */}
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id]
                  const isActive = i === currentQuestionIndex

                  return (
                    <Button
                      key={q.id}
                      size="sm"
                      variant={isAnswered ? "default" : "outline"}
                      disabled={isAnswered}
                      onClick={() => handleNavClick(i)}
                      className="relative"
                    >
                      {i + 1}

                      {isAnswered && (
                        <Lock className="w-3 h-3 ml-1" />
                      )}

                      {!isAnswered && isActive && (
                        <Clock className="w-3 h-3 ml-1 text-yellow-500" />
                      )}
                    </Button>
                  )
                })}
              </div>
            </Card>

            {/* ─── Stats Summary ─────────────────────────────── */}
            <Card className="p-4 space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-muted-foreground">Answered</span>
                <span className="font-medium">{totalAnswered}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">
                  {questions.length - totalAnswered}
                </span>
              </div>

              {totalEvaluated > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evaluated</span>
                  <span className="font-medium text-green-500">
                    {totalEvaluated}
                  </span>
                </div>
              )}
            </Card>

          </aside>

        {/* ─── Right: Question Panel ────────────────────────── */}
          <main className="flex-1 space-y-4">
            {currentQuestion && (
              <Card className="p-4 md:p-6 space-y-5">

                {/* TIMER / STATUS */}
                {isCurrentLocked ? (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <Lock className="w-3.5 h-3.5" />
                    Answer Locked
                  </Badge>
                ) : autoAdvancing ? (
                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                  <Timer className="w-3.5 h-3.5" />
                  Time’s up — moving next
                </Badge>
                ) : (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatTime(timeLeft)}
                    </Badge>

                    <Badge variant="secondary">
                      {currentQuestion.question_type.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* META */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>

                  <p className="font-medium">{currentQuestion.core_concept}</p>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">
                      {formatDimension(currentQuestion.dimension)}
                    </Badge>

                    <Badge variant="secondary">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* QUESTION */}
                <div
                  className="space-y-3 select-none"
                  onCopy={blockEvent}
                  onCut={blockEvent}
                  onContextMenu={blockEvent}
                >
                  <p className="text-base leading-relaxed">
                    {currentQuestion.question_text}
                  </p>

                  {currentQuestion.code_snippet && (
                    <pre className="rounded-md bg-muted p-3 text-sm overflow-x-auto">
                      {currentQuestion.code_snippet}
                    </pre>
                  )}
                </div>

                <Separator />

                {/* ANSWER */}
                {isCurrentLocked ? (
                  <Card className="p-4 bg-muted">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Your Answer (Locked)
                    </div>

                    <p className="text-sm whitespace-pre-wrap">
                      {answers[currentQuestion.id]}
                    </p>

                    {evaluations[currentQuestion.id] && (
                      <div className="mt-3 text-sm space-y-1">
                        <div className="font-medium">
                          Score:{" "}
                          {evaluations[currentQuestion.id].score}/
                          {evaluations[currentQuestion.id].max_score}
                        </div>
                        <p className="text-muted-foreground">
                          {evaluations[currentQuestion.id].feedback}
                        </p>
                      </div>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {currentQuestion.question_type === "mcq" &&
                    currentQuestion.choices ? (
                      <div className="grid gap-2">
                        {currentQuestion.choices.map((choice, ci) => {
                          const letter = String.fromCharCode(65 + ci)

                          return (
                            <Button
                              key={ci}
                              variant={
                                selectedChoice === letter ? "default" : "outline"
                              }
                              className="justify-start"
                              onClick={() => setSelectedChoice(letter)}
                            >
                              <span className="font-bold mr-2">{letter}.</span>
                              {choice}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <textarea
                        className="w-full min-h-[160px] rounded-md border p-3 text-sm"
                        value={currentDraft}
                        onChange={(e) => setCurrentDraft(e.target.value)}
                        placeholder="Type your answer here..."
                      />
                    )}

                    <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Answer
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <Separator />

                {/* NAVIGATION */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPrev}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </Button>

                  <Button
                    variant="outline"
                    onClick={goToNext}
                    disabled={currentQuestionIndex >= questions.length - 1}
                  >
                    Next →
                  </Button>
                </div>

                {/* SUBMIT */}
                {totalAnswered > 0 && (
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Assessment ({totalAnswered}/{questions.length})
                      </>
                    )}
                  </Button>
                )}
              </Card>
            )}
          </main>
      </div>

      {/* ─── Toast ──────────────────────────────────────────── */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}


      {/* ─── Confirm Submit Modal ────────────────────────────── */}
          {showConfirmModal && (
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
              <DialogContent className="sm:max-w-md">

                {/* HEADER */}
                <DialogHeader className="space-y-3">

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>

                    <DialogTitle className="text-lg">
                      Submit Assessment
                    </DialogTitle>
                  </div>

                  <DialogDescription className="space-y-3">

                    {/* Progress card */}
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Answered</span>
                        <span className="font-medium">
                          {totalAnswered}/{questions.length}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(totalAnswered / questions.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Warning */}
                    {totalAnswered < questions.length && (
                      <div className="flex items-start gap-2 text-yellow-500 text-sm">
                        <FileWarning className="w-4 h-4 mt-0.5" />
                        <span>
                          You have{" "}
                          <strong>
                            {questions.length - totalAnswered}
                          </strong>{" "}
                          unanswered question
                          {questions.length - totalAnswered > 1 ? "s" : ""}.
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5" />
                      <span>
                        This action is final. Your answers will be evaluated by AI.
                      </span>
                    </div>

                  </DialogDescription>
                </DialogHeader>

                {/* ACTIONS */}
                <DialogFooter className="flex gap-2 sm:justify-end pt-2">

                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleSubmitAssessment}
                    className="gap-2"
                  >
                    Submit Assessment
                  </Button>

                </DialogFooter>

              </DialogContent>
            </Dialog>
          )}

      {/* ─── Submitting Overlay ──────────────────────────────── */}
        {submitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <Card className="w-full max-w-sm p-6 text-center space-y-4">

              {/* ICON */}
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>

              {/* TITLE */}
              <h2 className="text-lg font-semibold">
                Submitting Assessment
              </h2>

              {/* SUBTITLE */}
              <p className="text-sm text-muted-foreground">
                Securely saving your answers...
              </p>

            </Card>

          </div>
        )}
    </div>
  )
}
