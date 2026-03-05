"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
class EmployeesController {
    constructor(pool, employeeRepo) {
        this.pool = pool;
        this.employeeRepo = employeeRepo;
        // Create a new employee
        this.createEmployee = async (req, res) => {
            const { name, employeeType, baseRateCents } = req.body;
            const client = await this.pool.connect();
            try {
                const employee = await this.employeeRepo.createEmployee(client, {
                    name,
                    employeeType,
                    baseRateCents
                });
                await client.query(`COMMIT`);
                res.json(employee);
            }
            catch (err) {
                await client.query(`ROLLBACK`);
                throw err;
            }
            finally {
                client.release();
            }
        };
        // List all employees
        this.listEmployees = async (_req, res) => {
            const client = await this.pool.connect();
            try {
                const employees = await this.employeeRepo.getAll(client);
                res.json(employees);
            }
            finally {
                client.release();
            }
        };
    }
    ;
}
exports.EmployeesController = EmployeesController;
//# sourceMappingURL=employees.controller.js.map