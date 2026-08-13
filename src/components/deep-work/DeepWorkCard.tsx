"use client";

import { useDeepWork } from "@/contexts/DeepWorkContext";
import { useCallback, useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaPause,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import DeepWorkSettingsModal from "./DeepWorkSettings";
import DeepWorkStats from "./DeepWorkStats";
import PomodoroProgress from "./PomodoroProgress";
import TaskSelector from "./TaskSelector";
import TimerControls from "./TimerControls";
import TimerDisplay from "./TimerDisplay";

const STORAGE_KEY = "deepwork-card-expanded";

function InlineProgressBar({
  progress,
  phase,
}: {
  progress: number;
  phase: string;
}) {
  const getColor = () => {
    switch (phase) {
      case "work":
        return "var(--dl-accent)";
      case "shortBreak":
        return "#3b82f6";
      case "longBreak":
        return "#8b5cf6";
      default:
        return "var(--dl-accent)";
    }
  };

  return (
    <div
      className="flex-1 h-1.5 rounded-full max-w-[120px]"
      style={{ backgroundColor: "var(--dl-border)", opacity: 0.3 }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          backgroundColor: getColor(),
        }}
      />
    </div>
  );
}

export default function DeepWorkCard() {
  const {
    state,
    settings,
    formattedTime,
    progress,
    isRunning,
    isPaused,
    isIdle,
    tasks,
    start,
    pause,
    resume,
    stop,
    skip,
    reset,
    setTask,
    updateSettings,
  } = useDeepWork();

  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsExpanded(stored === "true");
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // Auto-expand when timer starts
  useEffect(() => {
    if (isRunning && !isExpanded) {
      setIsExpanded(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    start(state.currentTaskId, state.currentTaskDescription);
  };

  const getPhaseLabel = () => {
    switch (state.phase) {
      case "work":
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  const ChevronButton = (
    <button
      onClick={toggleExpanded}
      className="p-2 rounded-lg transition-all hover:opacity-80"
      style={{
        backgroundColor: "var(--dl-surface)",
        color: "var(--dl-muted)",
      }}
      title={isExpanded ? "Collapse" : "Expand"}
    >
      {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
    </button>
  );

  // --- Collapsed state ---
  if (!isExpanded) {
    return (
      <div
        className="rounded-xl px-4 py-3"
        style={{
          backgroundColor: "var(--dl-surface)",
          border: "1px solid var(--dl-border)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <FaClock size={16} style={{ color: "var(--dl-accent)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--dl-text)" }}
            >
              Deep Work Timer
            </span>
          </div>

          {/* Progress bar (when active) */}
          {!isIdle && (
            <InlineProgressBar progress={progress} phase={state.phase} />
          )}

          {/* Time + Phase */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <span
              className="text-sm font-mono font-medium"
              style={{ color: "var(--dl-text)" }}
            >
              {formattedTime}
            </span>
            <span className="text-xs" style={{ color: "var(--dl-muted)" }}>
              {getPhaseLabel()}
            </span>
          </div>

          {/* Inline controls */}
          <div className="flex items-center gap-1 shrink-0">
            {isIdle && (
              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--dl-accent)" }}
              >
                <FaPlay size={10} />
                Start
              </button>
            )}
            {isRunning && (
              <button
                onClick={pause}
                className="p-1.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#f59e0b" }}
                title="Pause"
              >
                <FaPause size={12} />
              </button>
            )}
            {isPaused && (
              <button
                onClick={resume}
                className="p-1.5 rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--dl-accent)" }}
                title="Resume"
              >
                <FaPlay size={12} />
              </button>
            )}
            {(isRunning || isPaused) && (
              <button
                onClick={stop}
                className="p-1.5 rounded-lg transition-all hover:opacity-80"
                style={{
                  border: "1px solid var(--dl-danger)",
                  color: "var(--dl-danger)",
                }}
                title="Stop"
              >
                <FaStop size={12} />
              </button>
            )}
          </div>

          {/* Settings & Chevron */}
          <DeepWorkSettingsModal
            settings={settings}
            onUpdateSettings={updateSettings}
            disabled={isRunning}
          />
          {ChevronButton}
        </div>
      </div>
    );
  }

  // --- Expanded state ---
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--dl-surface)",
        border: "1px solid var(--dl-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaClock size={18} style={{ color: "var(--dl-accent)" }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--dl-text)" }}
          >
            Deep Work Timer
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <DeepWorkSettingsModal
            settings={settings}
            onUpdateSettings={updateSettings}
            disabled={isRunning}
          />
          {ChevronButton}
        </div>
      </div>

      {/* Timer + Controls: 2-column layout */}
      <div className="flex items-center justify-center gap-6 mb-3">
        {/* Timer circle (compact) */}
        <div className="shrink-0">
          <TimerDisplay
            formattedTime={formattedTime}
            progress={progress}
            phase={state.phase}
            isRunning={isRunning}
            size={100}
            compact
          />
        </div>

        {/* Controls + progress beside timer */}
        <div className="flex flex-col gap-2 min-w-0">
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            isIdle={isIdle}
            onStart={handleStart}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            onSkip={skip}
            onReset={reset}
          />
          <div className="flex justify-center">
            <PomodoroProgress
              cyclesCompleted={state.cyclesCompleted}
              cyclesBeforeLongBreak={settings.cyclesBeforeLongBreak}
            />
          </div>
        </div>
      </div>

      {/* Task Selector */}
      <div className="mb-3">
        <TaskSelector
          tasks={tasks}
          selectedTaskId={state.currentTaskId}
          onSelectTask={setTask}
          disabled={isRunning}
        />
      </div>

      {/* Stats */}
      <DeepWorkStats
        totalWorkMinutes={state.totalWorkMinutes}
        cyclesCompleted={state.cyclesCompleted}
      />
    </div>
  );
}
