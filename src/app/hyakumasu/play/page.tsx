import type { Operation } from "@/lib/types";
import PlayClientLoader from "@/app/hyakumasu/play/PlayClientLoader";

const VALID_OPS: Operation[] = ["add", "sub", "mul"];

export default async function HyakumasuPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ op?: string }>;
}) {
  const { op } = await searchParams;
  const operation = (VALID_OPS.includes(op as Operation) ? op : "add") as Operation;

  return <PlayClientLoader operation={operation} />;
}
