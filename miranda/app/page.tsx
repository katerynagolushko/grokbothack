import { Suspense } from "react";
import { ShoppingDemo } from "@/components/ShoppingDemo";

export default function HomePage() {
  return (
    <main className="page-home">
      <Suspense fallback={<p className="demo-loading">Working.</p>}>
        <ShoppingDemo />
      </Suspense>
    </main>
  );
}
