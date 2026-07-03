import { describe, expect, it } from "vitest";
import {
  adaptationPinned,
  adaptationScenarios,
  adaptationState,
  compareStrategies,
} from "./adaptation";

describe("adaptation model layer", () => {
  it("pins RAG as strongest on fresh docs for the reset scenario", () => {
    const rows = compareStrategies("reset-procedure");
    const rag = rows.find((row) => row.strategy.id === "rag")!;
    const prompt = rows.find((row) => row.strategy.id === "prompting")!;
    expect(rag.metrics.domainFit).toBeGreaterThan(prompt.metrics.domainFit);
    expect(rag.metrics.freshness).toBeGreaterThan(0.9);
    expect(rag.metrics.citesSource).toBe(true);
    expect(rag.metrics.domainFit).toBeCloseTo(adaptationPinned.resetProcedureRagDomain, 5);
  });

  it("drops stale fine-tune domain fit after a doc update", () => {
    const healthy = adaptationState("pricing-update", "fine-tuning", "healthy");
    const stale = adaptationState("pricing-update", "fine-tuning", "stale-finetune");
    expect(stale.metrics.domainFit).toBeLessThan(healthy.metrics.domainFit);
    expect(stale.metrics.freshness).toBeLessThan(0.2);
    expect(stale.onTarget).toBe(false);
  });

  it("breaks RAG when retrieval returns the wrong chunk", () => {
    const healthy = adaptationState("reset-procedure", "rag", "healthy");
    const broken = adaptationState("reset-procedure", "rag", "bad-retrieval");
    expect(broken.metrics.domainFit).toBeLessThan(0.4);
    expect(broken.onTarget).toBe(false);
    expect(healthy.onTarget).toBe(true);
  });

  it("covers every scenario and strategy in the fixture", () => {
    for (const scenario of adaptationScenarios) {
      for (const strategyId of ["fine-tuning", "prompting", "rag"] as const) {
        expect(adaptationState(scenario.id, strategyId).metrics.domainFit).toBeGreaterThan(0);
      }
    }
  });
});
