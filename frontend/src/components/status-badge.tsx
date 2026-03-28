import { Badge } from "@/components/ui/badge";

type HiveStatus = "Strong" | "Normal" | "Weak" | "Empty" | string;

const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Strong: "secondary",
  Normal: "default",
  Weak: "destructive",
  Empty: "outline",
};

const statusLabelMap: Record<string, string> = {
  Strong: "แข็งแรง",
  Normal: "ปกติ",
  Weak: "อ่อนแอ",
  Empty: "ว่าง",
};

export function StatusBadge({ status }: { status: HiveStatus }) {
  return <Badge variant={statusMap[status] ?? "outline"}>{statusLabelMap[status] ?? status}</Badge>;
}
