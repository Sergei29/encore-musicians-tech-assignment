import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("updates only after the specified delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("restarts the delay when the value changes again", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "first update" });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "second update" });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("second update");
  });

  it("clears the timeout when unmounted", () => {
    const { unmount } = renderHook(() => useDebouncedValue("initial", 300));

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
