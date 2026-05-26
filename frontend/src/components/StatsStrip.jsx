export default function StatsStrip({ stats }) {
    return (
        <div className="stats-strip">
            {Object.entries(stats.statuses).map(([k, v]) => (
                <div className="stat-item" key={k}>
                    <span className="stat-val">{v}</span>
                    <span className="stat-label">{k.replace("_", " ")}</span>
                </div>
            ))}
            <div className="stat-item breached-stat">
                <span className="stat-val">{stats.breached}</span>
                <span className="stat-label">SLA Breached</span>
            </div>
        </div>
    );
}