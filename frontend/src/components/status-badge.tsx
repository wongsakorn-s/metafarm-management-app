import { Badge } from "@/components/ui/badge";

type HiveStatus = "Strong" | "Normal" | "Weak" | "Empty" | string;

const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Strong: "secondary",
  Normal: "default",
  Weak: "destructive",
  Empty: "outline",
};

export function StatusBadge({ status }: { status: HiveStatus }) {
  return <Badge variant={statusMap[status] ?? "outline"}>{status}</Badge>;
}
