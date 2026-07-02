"use client";

import dynamic from "next/dynamic";
import type { Operation } from "@/lib/types";

const PlayClient = dynamic(() => import("@/app/hyakumasu/play/PlayClient"), {
  ssr: false,
});

export default function PlayClientLoader({ operation }: { operation: Operation }) {
  return <PlayClient operation={operation} />;
}
