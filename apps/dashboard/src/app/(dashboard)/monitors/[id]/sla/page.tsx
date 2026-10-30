"use client";

import { Info } from "@openstatus/icons";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Note } from "@/components/common/note";
import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { mapMetrics } from "@/data/metrics.client";
import { useTRPC } from "@/lib/trpc/client";

const TARGETS = [0.99, 0.999, 0.9999] as const;

function formatPercent(value: number) {
  return `${(value * 100).toFixed(3)}%`;
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const [target, setTarget] = useState<(typeof TARGETS)[number]>(0.999);

  const { data: monitor } = useQuery(
    trpc.monitor.get.queryOptions({ id: Number.parseInt(id) }),
  );
  const { data: metrics } = useQuery({
    ...trpc.tinybird.metrics.queryOptions({
      monitorId: id,
      period: "14d",
      type: (monitor?.jobType ?? "http") as
        | "http"
        | "tcp"
        | "dns"
        | "icmp"
        | "grpc",
    }),
    enabled: !!monitor,
  });

  if (!monitor || !metrics) return null;

  const current = mapMetrics(metrics)?.find((row) => !!row.lastTimestamp);
  const uptime = current && current.total > 0 ? current.uptime : undefined;
  // the error budget is the downtime the target allows over the period
  const budgetMinutes = 14 * 24 * 60 * (1 - target);
  const usedMinutes =
    uptime === undefined ? 0 : 14 * 24 * 60 * Math.max(0, 1 - uptime);

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Uptime (SLA) report</SectionTitle>
          <SectionDescription>
            Uptime of {monitor.name} over the last 14 days against your SLA
            target.
          </SectionDescription>
        </SectionHeader>
        <div className="flex gap-2">
          {TARGETS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTarget(t)}
              className={
                t === target
                  ? "rounded-md border bg-muted px-3 py-1 text-sm"
                  : "rounded-md border px-3 py-1 text-sm"
              }
            >
              {formatPercent(t)}
            </button>
          ))}
        </div>
        {uptime === undefined ? (
          <Note color="info">
            <Info />
            <p>No checks ran in the last 14 days, so there is no report yet.</p>
          </Note>
        ) : (
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-muted-foreground text-sm">Uptime</dt>
              <dd className="font-mono text-lg">{formatPercent(uptime)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">SLA target</dt>
              <dd className="font-mono text-lg">
                {uptime >= target ? "Met" : "Missed"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">
                Error budget used
              </dt>
              <dd className="font-mono text-lg">
                {Math.round(usedMinutes)} of {Math.round(budgetMinutes)} min
              </dd>
            </div>
          </dl>
        )}
      </Section>
    </SectionGroup>
  );
}
