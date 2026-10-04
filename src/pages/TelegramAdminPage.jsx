import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { api } from "../api";

export default function TelegramAdminPage() {
  const [claims, setClaims] = useState([]);
  const [invite, setInvite] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    try { setClaims(await api.listTelegramClaims()); }
    catch (error) { setMessage(error.message || "Could not load Telegram requests."); }
  }
  useEffect(() => { reload(); }, []);

  async function createInvite() {
    setBusy(true); setMessage("");
    try { setInvite(await api.createTelegramInvite()); }
    catch (error) { setMessage(error.message || "Could not create invite."); }
    finally { setBusy(false); }
  }
  async function decide(id, action) {
    setBusy(true);
    try {
      if (action === "approve") await api.approveTelegramClaim(id);
      else await api.rejectTelegramClaim(id);
      setMessage(action === "approve" ? "Telegram account approved." : "Request rejected.");
      await reload();
    } catch (error) { setMessage(error.message || "Action failed."); }
    finally { setBusy(false); }
  }

  return <main className="page-stack">
    <PageHeader eyebrow="Administration" title="Telegram enrollment" description="Create one-time invites and review account claims." />
    <section className="panel">
      <h2>Invitation link</h2>
      <p className="muted">Anyone with this link can request enrollment. The account becomes usable only after you approve the request.</p>
      <button className="button button--primary" type="button" disabled={busy} onClick={createInvite}>{busy ? "Working…" : "Generate invite link"}</button>
      {invite ? <div className="status-banner" style={{ marginTop: 16 }}><strong>Send this link to the user</strong><p><a href={invite.inviteUrl}>{invite.inviteUrl}</a></p><p className="muted">Expires {new Date(invite.expiresAt).toLocaleString()}</p></div> : null}
    </section>
    <section className="panel">
      <div className="panel-heading"><div><h2>Pending requests</h2><p className="muted">Approve only the person you intended to invite.</p></div><button className="button button--ghost" onClick={reload} type="button">Refresh</button></div>
      {claims.length === 0 ? <p className="muted">No pending requests.</p> : <div className="table-wrap"><table><thead><tr><th>Telegram ID</th><th>Name</th><th>Username</th><th>Requested</th><th>Actions</th></tr></thead><tbody>{claims.map((claim) => <tr key={claim.inviteId}><td>{claim.telegramUserId}</td><td>{[claim.firstName, claim.lastName].filter(Boolean).join(" ") || "—"}</td><td>{claim.username ? `@${claim.username}` : "—"}</td><td>{claim.claimedAt ? new Date(claim.claimedAt).toLocaleString() : "—"}</td><td><button className="button button--primary button--small" disabled={busy} onClick={() => decide(claim.inviteId, "approve")}>Approve</button> <button className="button button--ghost button--small" disabled={busy} onClick={() => decide(claim.inviteId, "reject")}>Reject</button></td></tr>)}</tbody></table></div>}
    </section>
    {message ? <p className="status-banner">{message}</p> : null}
  </main>;
}
