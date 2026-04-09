import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useMediaQuery } from "../use-media-query";

describe("useMediaQuery", () => {
  let changeListeners: Array<() => void>;
  let mockMatches: boolean;

  beforeEach(() => {
    changeListeners = [];
    mockMatches = false;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return mockMatches;
        },
        media: query,
        addEventListener: (_event: string, listener: () => void) => {
          changeListeners.push(listener);
        },
        removeEventListener: (_event: string, listener: () => void) => {
          changeListeners = changeListeners.filter((l) => l !== listener);
        },
      })),
    });
  });

  afterEach(() => {
    changeListeners = [];
  });

  it("returns false when media query does not match", () => {
    mockMatches = false;
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px)")
    );
    expect(result.current).toBe(false);
  });

  it("returns true when media query matches", () => {
    mockMatches = true;
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px)")
    );
    expect(result.current).toBe(true);
  });

  it("updates when media query changes", () => {
    mockMatches = false;
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px)")
    );
    expect(result.current).toBe(false);

    mockMatches = true;
    act(() => {
      changeListeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() =>
      useMediaQuery("(min-width: 768px)")
    );

    expect(changeListeners.length).toBe(1);
    unmount();
    expect(changeListeners.length).toBe(0);
  });
});
