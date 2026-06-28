"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OPERATION_LABELS, type Operation } from "@/lib/types";

const OPERATIONS: Operation[] = ["add", "sub", "mul"];

export default function OperationSelect() {
  const router = useRouter();
  const [op, setOp] = useState<Operation>("add");

  return (
    <div className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
      <p className="font-semibold text-gray-700">演算を選んでください</p>
      <div className="flex flex-wrap gap-3">
        {OPERATIONS.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOp(o)}
            className={`rounded-lg border px-5 py-2 font-semibold transition ${
              op === o ? "bg-green-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {OPERATION_LABELS[o]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => router.push(`/hyakumasu/play?op=${op}`)}
        className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white"
      >
        スタート
      </button>
    </div>
  );
}
