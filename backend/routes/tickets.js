const router = require("express").Router();
const Ticket = require("../models/Ticket");

const SLA = { urgent: 60, high: 240, medium: 1440, low: 4320 };

const ORDER = ["open", "in_progress", "resolved", "closed"];

function derive(t) {
    const now = new Date();
    const end = t.status === "resolved" && t.resolvedAt ? t.resolvedAt : now;
    const ageMinutes = Math.floor((end - t.createdAt) / 60000);
    const target = SLA[t.priority];
    const slaBreached =
        t.status !== "closed" &&
        (t.status !== "resolved"
            ? ageMinutes > target
            : Math.floor((t.resolvedAt - t.createdAt) / 60000) > target);
    return { ...t.toObject(), ageMinutes, slaBreached };
}

router.post("/", async (req, res) => {
    try {
        const { subject, description, customerEmail, priority } = req.body;
        if (!subject || !description || !customerEmail || !priority)
            return res.status(400).json({ error: "All fields are required" });
        if (!["low", "medium", "high", "urgent"].includes(priority))
            return res.status(400).json({ error: "Invalid priority" });
        const ticket = await Ticket.create({ subject, description, customerEmail, priority });
        res.status(201).json(derive(ticket));
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get("/stats", async (req, res) => {
    try {
        const all = await Ticket.find();
        const statuses = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
        const priorities = { low: 0, medium: 0, high: 0, urgent: 0 };
        let breached = 0;
        all.forEach((t) => {
            statuses[t.status]++;
            priorities[t.priority]++;
            const d = derive(t);
            if (d.slaBreached && t.status !== "closed") breached++;
        });
        res.json({ statuses, priorities, breached });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.priority) query.priority = req.query.priority;
        let tickets = await Ticket.find(query);
        let derived = tickets.map(derive);
        if (req.query.breached === "true")
            derived = derived.filter((t) => t.slaBreached);
        res.json(derived);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Not found" });

        const { status } = req.body;
        if (!status) return res.status(400).json({ error: "Status required" });
        if (!["open", "in_progress", "resolved", "closed"].includes(status))
            return res.status(400).json({ error: "Invalid status" });

        const from = ORDER.indexOf(ticket.status);
        const to = ORDER.indexOf(status);
        const diff = to - from;

        if (diff === 0) return res.json(derive(ticket));
        if (diff > 1) return res.status(400).json({ error: `Cannot go from ${ticket.status} to ${status}` });
        if (diff < -1) return res.status(400).json({ error: `Cannot move back more than one step` });

        ticket.status = status;
        if (status === "resolved") ticket.resolvedAt = new Date();
        if (status === "in_progress" && ticket.resolvedAt) ticket.resolvedAt = null;

        await ticket.save();
        res.json(derive(ticket));
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;