import type { IconType } from "@openstatus/icons";
import { Settings, Overview, Logs, CloudOff, Calendar } from "@openstatus/icons";

export const MONITOR_TABS: {
  value: string;
  label: string;
  icon: IconType;
}[] = [
  { value: "overview", label: "Overview", icon: Overview },
  { value: "logs", label: "Logs", icon: Logs },
  { value: "incidents", label: "Downtime", icon: CloudOff },
  { value: "sla", label: "SLA", icon: Calendar },
  { value: "edit", label: "Settings", icon: Settings },
];
