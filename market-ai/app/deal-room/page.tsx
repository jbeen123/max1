export default function DealRoomPage() {
  return (
    <section className="grid grid-2">
      <div className="card">
        <h2>Deal Room</h2>
        <p>Central place for offer negotiation, document exchange, and status tracking.</p>
        <ul>
          <li>Offer timeline + counteroffers</li>
          <li>Doc checklist (LOI, PSA, title docs)</li>
          <li>Built-in activity log</li>
        </ul>
      </div>
      <div className="card">
        <h3>Next integrations</h3>
        <ul>
          <li>E-sign API (DocuSign / Dropbox Sign)</li>
          <li>Escrow/milestone workflow</li>
          <li>Secure chat with moderation</li>
        </ul>
      </div>
    </section>
  );
}
