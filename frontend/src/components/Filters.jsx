export default function Filters({ filters, onChange }) {
    return (
        <div className="filters">
            <select value={filters.priority} onChange={(e) => onChange((p) => ({ ...p, priority: e.target.value }))}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
            </select>
            <label className="breach-toggle">
                <input
                    type="checkbox"
                    checked={filters.breached}
                    onChange={(e) => onChange((p) => ({ ...p, breached: e.target.checked }))}
                />
                SLA Breached only
            </label>
        </div>
    );
}