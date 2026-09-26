const ROWS = [
  {
    party: "Buyer",
    gets: "One profile that follows them. Blunt verdicts. Reorder on every store they have shared with. Consent per store, revocable.",
  },
  {
    party: "Merchant",
    gets: "Consented taste card. Cross-store signals (derived, consented). A ranked grid with a reason per item. Proof that agent traffic converts instead of bouncing.",
  },
  {
    party: "Neither",
    gets: "Raw purchases. Chats. The right to hide a bad take.",
  },
] as const;

export function WhyPayTable() {
  return (
    <div className="why-table-wrap">
      <table className="why-table">
        <caption className="why-table__caption">Who gets what</caption>
        <thead>
          <tr>
            <th scope="col">Party</th>
            <th scope="col">What they get</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.party}>
              <th scope="row">{row.party}</th>
              <td>{row.gets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
