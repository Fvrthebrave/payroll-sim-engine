"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
class PayrollController {
    constructor(payrollService) {
        this.payrollService = payrollService;
        // Run payroll for a given period
        this.runPayroll = async (req, res) => {
            const { periodStart, periodEnd, idempotencyKey } = req.body;
            if (!periodStart || !periodEnd || !idempotencyKey) {
                return res.status(400).json({ error: 'Missing required fields: periodStart, periodEnd, idempotencyKey' });
            }
            const result = await this.payrollService.runPayroll({
                periodStart,
                periodEnd,
                idempotencyKey
            });
            res.json({
                id: result.id,
                status: result.status
            });
        };
    }
    ;
}
exports.PayrollController = PayrollController;
//# sourceMappingURL=payroll.controller.js.map