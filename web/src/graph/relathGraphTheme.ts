/** Graph node fills — aligned with ENTITY_SLICES + design.md metallics */

export function nodeFillForLabel(primaryLabel: string): string {
  const key = primaryLabel.trim();
  switch (key) {
    case "Consumer":
      return "#7d9f72";
    case "Merchant":
      return "#d4af37";
    case "Employee":
      return "#e8c170";
    case "Partner":
      return "#a67caa";
    case "Order":
      return "#f4d03f";
    case "Settle":
      return "#c75c5c";
    default:
      return "#888888";
  }
}
