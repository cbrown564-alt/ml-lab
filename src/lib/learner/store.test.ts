import { beforeEach, describe, expect, it } from "vitest";
import { useLearner } from "./store";

/** The store falls back to in-memory storage under node — pure logic here. */

const reset = () =>
  useLearner.setState({ schemaVersion: 1, mastery: {}, history: [] });

beforeEach(reset);

describe("learner mastery transitions", () => {
  it("a visit marks an untouched node as seen and logs history", () => {
    useLearner.getState().recordVisit("linear-regression");
    const s = useLearner.getState();
    expect(s.mastery["linear-regression"].level).toBe("seen");
    expect(s.history).toHaveLength(1);
    expect(s.history[0].nodeId).toBe("linear-regression");
  });

  it("practice outranks seen; a later visit never downgrades it", () => {
    const { recordVisit, recordPractice } = useLearner.getState();
    recordVisit("gradient-descent");
    recordPractice("gradient-descent");
    recordVisit("gradient-descent");
    expect(useLearner.getState().mastery["gradient-descent"].level).toBe("practiced");
  });

  it("answering some items correctly assesses; all of them masters", () => {
    const { recordAnswer } = useLearner.getState();
    recordAnswer("linear-regression", "q1", true, 3);
    expect(useLearner.getState().mastery["linear-regression"].level).toBe("assessed");
    expect(useLearner.getState().mastery["linear-regression"].score).toBeCloseTo(1 / 3);

    recordAnswer("linear-regression", "q2", true, 3);
    recordAnswer("linear-regression", "q3", true, 3);
    const m = useLearner.getState().mastery["linear-regression"];
    expect(m.level).toBe("mastered");
    expect(m.score).toBe(1);
  });

  it("the latest answer per item is the one that counts", () => {
    const { recordAnswer } = useLearner.getState();
    recordAnswer("gradient-descent", "q1", false, 2);
    recordAnswer("gradient-descent", "q1", true, 2);
    recordAnswer("gradient-descent", "q2", true, 2);
    const m = useLearner.getState().mastery["gradient-descent"];
    expect(m.level).toBe("mastered");
    expect(m.score).toBe(1);
    expect(m.evidence).toHaveLength(3); // history of attempts is preserved
  });

  it("a wrong final answer keeps the node assessed, not mastered", () => {
    const { recordAnswer } = useLearner.getState();
    recordAnswer("gradient-descent", "q1", true, 2);
    recordAnswer("gradient-descent", "q2", false, 2);
    const m = useLearner.getState().mastery["gradient-descent"];
    expect(m.level).toBe("assessed");
    expect(m.score).toBe(0.5);
  });
});
