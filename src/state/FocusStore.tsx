import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { calculateFocusScore } from "@/data/scoring";
import { loadSnapshot, saveSnapshot } from "@/data/sqliteStore";
import { FocusScore } from "@/data/types";
import {
  FocusAction,
  FocusState,
  PersistedState,
  initialState,
  reducer
} from "./focusReducer";

export type { FocusAction, FocusState };
export { initialState, migrateSnapshot, reducer } from "./focusReducer";

type FocusContextValue = FocusState & {
  dispatch: React.Dispatch<FocusAction>;
  currentScore: FocusScore;
};

const FocusContext = createContext<FocusContextValue | null>(null);

// Save at most every 30s during a running session; immediately for all other changes.
const RUNNING_SAVE_INTERVAL_MS = 30_000;

export function FocusProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch({ type: "hydrate", snapshot: loadSnapshot<PersistedState>() });
  }, []);

  // Keep stateRef current so the debounced timer always saves the latest state.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.hydrated) return;

    const isRunning = state.activeSession.status === "running";

    if (isRunning) {
      // Schedule a deferred save if one isn't already queued.
      if (!saveTimerRef.current) {
        saveTimerRef.current = setTimeout(() => {
          saveSnapshot(stateRef.current);
          saveTimerRef.current = null;
        }, RUNNING_SAVE_INTERVAL_MS);
      }
    } else {
      // Any non-running change (pause, complete, add task, etc.) saves immediately.
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveSnapshot(state);
    }
  }, [state]);

  const currentScore = useMemo(
    () => calculateFocusScore(state.activeSession, state.tasks, state.interventions),
    [state.activeSession, state.tasks, state.interventions]
  );

  const value = useMemo(() => ({ ...state, dispatch, currentScore }), [state, currentScore]);

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocusStore() {
  const value = useContext(FocusContext);
  if (!value) throw new Error("useFocusStore must be used inside FocusProvider");
  return value;
}
