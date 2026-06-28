import type { Operation } from "@/lib/types";
import PlayClient from "@/app/hyakumasu/play/PlayClient";

const VALID_OPS: Operation[] = ["add", "sub", "mul"];

export default async function HyakumasuPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ op?: string }>;
}) {
  const { op } = await searchParams;
  const operation = (VALID_OPS.includes(op as Operation) ? op : "add") as Operation;

  return <PlayClient operation={operation} />;
}
