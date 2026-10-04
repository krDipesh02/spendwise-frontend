import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api";

export default function PasswordSetupPage() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!token) { setMessage("This setup link is missing its token."); return; }
    if (form.username.trim().length < 3 || form.password.length < 8) { setMessage("Choose a username with at least 3 characters and a password with at least 8."); return; }
    if (form.password !== form.confirmPassword) { setMessage("The passwords do not match."); return; }
    try {
      await api.configureTelegramCredentials({ token, username: form.username.trim(), password: form.password });
      setDone(true); setMessage("Your web login is ready. You can now sign in to SpendWise.");
    } catch (error) { setMessage(error.message || "The setup link is invalid or expired."); }
  }

  return <main className="shell" style={{ maxWidth: 620 }}>
    <section className="panel">
      <p className="eyebrow">Spendwise account setup</p>
      <h1>Choose your web login</h1>
      <p className="muted">This one-time link connects a username and password to the SpendWise account approved for your Telegram account.</p>
      {done ? <><p className="status-banner">{message}</p><Link className="button button--primary" to="/">Go to sign in</Link></> : <form onSubmit={submit} className="form-stack">
        <label>Username<input autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} minLength={3} required /></label>
        <label>Password<input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required /></label>
        <label>Confirm password<input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></label>
        {message ? <p className="status-banner">{message}</p> : null}
        <button className="button button--primary" type="submit">Save login</button>
      </form>}
    </section>
  </main>;
}
