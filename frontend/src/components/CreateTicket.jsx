import { useState } from "react";

const API = "https://bfhl-suhana-pathak.onrender.com/";

export default function CreateTicket({ onCreated, onClose }) {
    const [form, setForm] = useState({ subject: "", description: "", customerEmail: "", priority: "low" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function validate() {
        const e = {};
        if (!form.subject.trim()) e.subject = "Required";
        if (!form.description.trim()) e.description = "Required";
        if (!form.customerEmail.trim()) e.customerEmail = "Required";
        else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) e.customerEmail = "Invalid email";
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) return setErrors(e);
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const d = await res.json();
                setErrors({ general: d.error });
                return;
            }
            onCreated();
        } finally {
            setSubmitting(false);
        }
    }

    function set(k, v) {
        setForm((p) => ({ ...p, [k]: v }));
        setErrors((p) => ({ ...p, [k]: "" }));
    }

    return (
        <div className="form-wrap">
            <div className="form-header">
                <span>New Ticket</span>
                <button onClick={onClose}>✕</button>
            </div>
            {errors.general && <p className="field-err">{errors.general}</p>}
            <div className="field">
                <label>Subject</label>
                <input value={form.subject} onChange={(e) => set("subject", e.target.value)} />
                {errors.subject && <span className="field-err">{errors.subject}</span>}
            </div>
            <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
                {errors.description && <span className="field-err">{errors.description}</span>}
            </div>
            <div className="field">
                <label>Customer Email</label>
                <input value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} />
                {errors.customerEmail && <span className="field-err">{errors.customerEmail}</span>}
            </div>
            <div className="field">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            <button className="btn-submit" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting..." : "Create Ticket"}
            </button>
        </div>
    );
}