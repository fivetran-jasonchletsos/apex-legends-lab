import { Card, Section, Pill, HudFrame } from "@/components/ui";
import { SOURCES, DBT_MODELS, RATING_PREDICTION_SQL, FIVETRAN_SDK_SNIPPET } from "@/lib/stack";

export default function StackPage() {
  return (
    <>
      <Section
        title="ODI STACK"
        subtitle="The data pipeline behind APEX LAB — Fivetran SDK → MDLS → Snowflake-on-Iceberg → dbt → Next.js."
      >
        <HudFrame className="mb-5">
          <pre className="overflow-x-auto whitespace-pre p-4 text-[11px] leading-snug text-plasma md:p-6 md:text-xs">
{`   Sources                  Fivetran SDK
   ─────────────            ──────────────
   Apex Legends API ─┐
   Tracker.gg         │
   ALS Predator       ├──→  6 custom connectors  ─┐
   Reddit r/apex      │     (Python)               │
   EA / Respawn news  │                            │
   Streamer loadouts ─┘                            │
                                                   ▼
                       ┌──────────────────────────────────────────────┐
                       │  MDLS destination                            │
                       │  ──────────────────────────────────────────  │
                       │  S3 · Apache Iceberg · Glue/Polaris Catalog  │
                       │  bronze_<source>.<table>                     │
                       └─────────────────┬────────────────────────────┘
                                         │  one Iceberg catalog
                                         ▼
                              ┌─────────────────────────┐
                              │  Snowflake-on-Iceberg   │  <-- primary
                              │  external volume +      │      read engine
                              │  catalog integration    │
                              │  (table_type='iceberg') │
                              └───────────┬─────────────┘
                                          ▼
                                  ┌────────────────┐
                                  │  dbt           │
                                  │  on Snowflake- │
                                  │  on-Iceberg    │
                                  │  stg/int/marts │
                                  └───────┬────────┘
                                          ▼
                                  ┌────────────────┐
                                  │  Next.js       │
                                  │  /pulse,       │
                                  │  /legends,     │
                                  │  /stack        │
                                  └────────────────┘

   ┌─ Compatible (catalog-readable, not the active dbt target) ──────────┐
   │  Athena  ·  Databricks SQL  ·  Trino                                │
   │  attach to the same Polaris/Glue Iceberg catalog · same tables      │
   └─────────────────────────────────────────────────────────────────────┘`}
          </pre>
        </HudFrame>
      </Section>

      <Section title="SOURCES" subtitle="6 Fivetran SDK connectors, landing into MDLS as Iceberg.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SOURCES.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-xl tracking-wider text-ink">{s.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                    <Pill tone="plasma">{s.type}</Pill>
                    <Pill tone="muted">{s.cadence}</Pill>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{s.description}</p>
              <div className="mt-2 text-[11px] uppercase tracking-wider text-muted">
                Lands at: <span className="font-mono text-plasma">{s.landingSchema}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.tables.map((t) => (
                  <Pill key={t} tone="muted">{t}</Pill>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="dbt MODELS" subtitle="Staging → intermediate → marts, on Snowflake-on-Iceberg.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <ModelGroup title="Staging" tone="plasma" models={DBT_MODELS.staging} />
          <ModelGroup title="Intermediate" tone="gold" models={DBT_MODELS.intermediate} />
          <ModelGroup title="Marts" tone="blood" models={DBT_MODELS.marts} />
        </div>
      </Section>

      <Section title="KEY MART · mart_meta_predictions" subtitle="The SQL that powers /pulse.">
        <Card className="overflow-hidden">
          <pre className="scroll-x overflow-x-auto p-4 text-[11px] leading-snug text-plasma md:text-xs">
{RATING_PREDICTION_SQL}
          </pre>
        </Card>
      </Section>

      <Section title="CONNECTOR SNIPPET · tracker_gg" subtitle="Fivetran Connector SDK example.">
        <Card className="overflow-hidden">
          <pre className="scroll-x overflow-x-auto p-4 text-[11px] leading-snug text-nessie md:text-xs">
{FIVETRAN_SDK_SNIPPET}
          </pre>
        </Card>
      </Section>
    </>
  );
}

function ModelGroup({
  title,
  tone,
  models,
}: {
  title: string;
  tone: "plasma" | "gold" | "blood";
  models: { name: string; description: string; grain: string }[];
}) {
  return (
    <Card>
      <div className={`font-display text-xl tracking-wider text-${tone}`}>{title}</div>
      <div className="mt-3 space-y-3">
        {models.map((m) => (
          <div key={m.name} className="rounded-md border border-line bg-surface2 p-3">
            <div className="font-mono text-xs text-ink">{m.name}</div>
            <div className="mt-1 text-xs text-muted">{m.description}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted">
              Grain: <span className="text-plasma">{m.grain}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
