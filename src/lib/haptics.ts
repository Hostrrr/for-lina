"use client";

import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";

export function useHaptics() {
  const { trigger } = useWebHaptics();

  const tap = useCallback(() => {
    void trigger("nudge");
  }, [trigger]);

  const success = useCallback(() => {
    void trigger("success");
  }, [trigger]);

  const error = useCallback(() => {
    void trigger("error");
  }, [trigger]);

  const buzz = useCallback(() => {
    void trigger("buzz");
  }, [trigger]);

  return { tap, success, error, buzz };
}
