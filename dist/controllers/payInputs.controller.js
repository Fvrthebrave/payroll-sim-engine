"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayInputsController = void 0;
class PayInputsController {
    constructor(pool, employeeRepo) {
        this.pool = pool;
        this.employeeRepo = employeeRepo;
        // Handler for upserting pay input for an employee
        this.upsertPayInput = async (req, res) => {
            const { employeeId } = req.params;
            const { periodStart, periodEnd, regularHours, overtimeHours, bonusCents, deductionsCents, } = req.body;
            const client = await this.pool.connect();
            await client.query('BEGIN');
            try {
                const result = await this.employeeRepo.upsertPayInput(client, {
                    employeeId: String(employeeId),
                    periodStart,
                    periodEnd,
                    regularHours,
                    overtimeHours,
                    bonusCents,
                    deductionsCents
                });
                await client.query('COMMIT');
                res.status(200).json(result);
            }
            catch (err) {
                await client.query('ROLLBACK');
                console.error('Error processing pay input:', err);
                res.status(500).json({ error: 'Failed to process pay input' });
            }
            finally {
                client.release();
            }
        };
        this.getPayInputsForPeriod = async (req, res) => {
            const { periodStart, periodEnd } = req.query;
            const client = await this.pool.connect();
            try {
                const employees = await this.employeeRepo.getAll(client);
                const employeeIds = employees.map(e => e.id);
                const payInputs = await this.employeeRepo.getPayInputsForPeriod(client, {
                    employeeIds,
                    periodStart: String(periodStart),
                    periodEnd: String(periodEnd)
                });
                res.status(200).json({
                    payInputs
                });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to load pay inputs" });
            }
            finally {
                client.release();
            }
        };
    }
}
exports.PayInputsController = PayInputsController;
//# sourceMappingURL=payInputs.controller.js.map