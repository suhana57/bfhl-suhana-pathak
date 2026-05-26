const STATUSES = ["open", "in_progress", "resolved", "closed"];
const LABELS = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };
const ORDER = ["open", "in_progress", "resolved", "closed"];

function canMove(from, to) {
    const fi = ORDER.indexOf(from);
    const ti = ORDER.indexOf(to);
    const diff = ti - fi;
    return diff === 1 || diff === -1;
}

function formatAge(mins) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
}

const PRIORITY_COLOR = { low: "#6bcb77", medium: "#f4a261", high: "#e76f51", urgent: "#d62828" };

export default function Board({ tickets, onMove, onDelete }) {
    return (
        <div className="board">
            {STATUSES.map((s) => (
                <div className="column" key={s}>
                    <div className="col-header">{LABELS[s]}</div>
                    {tickets.filter((t) => t.status === s).map((t) => (
                        <div className={`card ${t.slaBreached ? "breached" : ""}`} key={t._id}>
                            <div className="card-top">
                                <span className="subject">{t.subject}</span>
                                {t.slaBreached && <span className="sla-flag">SLA</span>}
                            </div>
                            <div className="card-meta">
                                <span className="badge" style={{ background: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                                <span className="age">{formatAge(t.ageMinutes)}</span>
                            </div>
                            <div className="card-actions">
                                {ORDER.map((target) =>
                                    canMove(t.status, target) ? (
                                        <button key={target} className="act-btn" onClick={() => onMove(t._id, target)}>
                                            → {LABELS[target]}
                                        </button>
                                    ) : null
                                )}
                                <button className="del-btn" onClick={() => onDelete(t._id)}>✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}