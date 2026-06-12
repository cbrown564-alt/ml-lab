/**
 * Architecture rules (docs/06, C2), machine-enforced. The layering:
 *
 *   content/  — data and specs; may use lib types, never UI
 *   src/lib/  — pure logic; knows nothing about React surfaces or content
 *   src/components/ — UI; composes lib and content, never pages
 *   src/app/  — pages; the only layer allowed to know everything
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "lib-stays-pure",
      comment: "src/lib must not reach into UI layers or content (tests excepted)",
      severity: "error",
      from: { path: "^src/lib", pathNot: "\\.test\\.ts$" },
      to: { path: "^(src/components|src/app|content)" },
    },
    {
      name: "content-is-data",
      comment: "content/ may import lib types, never UI",
      severity: "error",
      from: { path: "^content", pathNot: "\\.test\\.ts$" },
      to: { path: "^(src/components|src/app)" },
    },
    {
      name: "components-not-pages",
      comment: "components must not depend on the app router layer",
      severity: "error",
      from: { path: "^src/components" },
      to: { path: "^src/app" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
  },
};
