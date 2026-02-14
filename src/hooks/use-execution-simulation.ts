"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DetailedTraceStep } from "@/data/mock";

export type NodeExecutionState = "idle" | "executing" | "completed" | "error";

export interface ExecutionProgress {
  isRunning: boolean;
  runId: string | null;
  currentStepIndex: number;
  currentStep: DetailedTraceStep | null;
  nodeStates: Map<string, NodeExecutionState>;
  completedEdges: Set<string>;
  activeEdgeId: string | null;
  elapsedMs: number;
}

const INITIAL_STATE: ExecutionProgress = {
  isRunning: false,
  runId: null,
  currentStepIndex: -1,
  currentStep: null,
  nodeStates: new Map(),
  completedEdges: new Set(),
  activeEdgeId: null,
  elapsedMs: 0,
};

interface UseExecutionSimulationOptions {
  steps: DetailedTraceStep[];
  edges: { id: string; source: string; target: string }[];
  runId: string;
  autoStart?: boolean;
  stepIntervalMs?: number;
  getStepDuration?: (step: DetailedTraceStep, index: number) => number;
}

export const useExecutionSimulation = ({
  steps,
  edges,
  runId,
  autoStart = true,
  stepIntervalMs = 1800,
  getStepDuration,
}: UseExecutionSimulationOptions) => {
  const [progress, setProgress] = useState<ExecutionProgress>(() =>
    autoStart && steps.length > 0
      ? { ...INITIAL_STATE, isRunning: true, runId }
      : INITIAL_STATE
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(-1);

  const findEdgeBetween = useCallback(
    (sourceNodeId: string, targetNodeId: string) =>
      edges.find((e) => e.source === sourceNodeId && e.target === targetNodeId)?.id ?? null,
    [edges]
  );

  const advanceStepRef = useRef<() => void>(() => {});

  const advanceStep = useCallback(() => {
    const nextIndex = stepIndexRef.current + 1;

    if (nextIndex >= steps.length) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setProgress((prev) => ({
        ...prev,
        isRunning: false,
        currentStep: null,
        activeEdgeId: null,
      }));
      return;
    }

    stepIndexRef.current = nextIndex;
    const currentStep = steps[nextIndex];
    const prevStep = nextIndex > 0 ? steps[nextIndex - 1] : null;

    setProgress((prev) => {
      const nodeStates = new Map(prev.nodeStates);
      const completedEdges = new Set(prev.completedEdges);

      if (prevStep) {
        nodeStates.set(
          prevStep.nodeId,
          prevStep.status === "error" ? "error" : "completed"
        );
      }

      nodeStates.set(currentStep.nodeId, "executing");

      const activeEdgeId = prevStep
        ? findEdgeBetween(prevStep.nodeId, currentStep.nodeId)
        : null;

      if (activeEdgeId) {
        completedEdges.add(activeEdgeId);
      }

      return {
        isRunning: true,
        runId,
        currentStepIndex: nextIndex,
        currentStep,
        nodeStates,
        completedEdges,
        activeEdgeId,
        elapsedMs: prev.elapsedMs + stepIntervalMs,
      };
    });

    const duration = getStepDuration
      ? getStepDuration(currentStep, nextIndex)
      : stepIntervalMs;
    timeoutRef.current = setTimeout(() => advanceStepRef.current(), duration);
  }, [steps, runId, findEdgeBetween, stepIntervalMs, getStepDuration]);

  useEffect(() => {
    advanceStepRef.current = advanceStep;
  }, [advanceStep]);

  const start = useCallback(() => {
    stepIndexRef.current = -1;
    setProgress({ ...INITIAL_STATE, isRunning: true, runId });
    advanceStepRef.current();
  }, [runId]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setProgress((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    stepIndexRef.current = -1;
    setProgress(INITIAL_STATE);
  }, [stop]);

  useEffect(() => {
    if (autoStart && steps.length > 0) {
      stepIndexRef.current = -1;
      timeoutRef.current = setTimeout(() => advanceStepRef.current(), 0);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoStart, steps.length]);

  return { progress, start, stop, reset };
};
