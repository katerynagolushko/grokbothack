"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function MirandaToggle({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (active) {
      params.delete("miranda");
    } else {
      params.set("miranda", "1");
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <button
      type="button"
      className={`miranda-toggle ${active ? "miranda-toggle--on" : ""}`}
      onClick={toggle}
      aria-pressed={active}
    >
      {active ? "Miranda on" : "Miranda off"}
    </button>
  );
}
