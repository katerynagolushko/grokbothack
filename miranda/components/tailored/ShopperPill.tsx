"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { isShopperId, listProfiles, type ShopperId } from "@/lib/profiles";

export const USER_KEY = "miranda.user";

export function readStoredUser(): ShopperId | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(USER_KEY);
  return isShopperId(v) ? v : null;
}

/**
 * "Shopping as Alex ▾" pill. Sets ?user= and persists to localStorage.
 * If the URL has no user but storage does, it adopts the stored one.
 */
export function ShopperPill({ current }: { current: ShopperId }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("user")) {
      window.localStorage.setItem(USER_KEY, current);
      return;
    }
    const stored = readStoredUser();
    if (stored && stored !== current) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("user", stored);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [current, pathname, router, searchParams]);

  function pick(id: string) {
    if (!isShopperId(id)) return;
    window.localStorage.setItem(USER_KEY, id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("user", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className={`shopper-pill shopper-pill--${current}`}>
      <span className="shopper-pill__label">Shopping as</span>
      <select
        className="shopper-pill__select"
        value={current}
        onChange={(e) => pick(e.target.value)}
        aria-label="Switch shopper"
      >
        {listProfiles().map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <span className="shopper-pill__caret" aria-hidden>
        ▾
      </span>
    </label>
  );
}
