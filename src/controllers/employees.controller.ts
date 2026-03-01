import { Request, Response } from 'express';
import { Pool } from 'pg';
import { EmployeeRepo } from '../repositories/employee.repo';

export class EmployeesController {
  constructor(
    private pool: Pool,
    private employeeRepo: EmployeeRepo
  ) {};
  
  // Create a new employee
  createEmployee = async (req: Request, res: Response) => {
    const { name, employeeType, baseRateCents } = req.body;

    const client = await this.pool.connect();

    try {
      const employee = await this.employeeRepo.createEmployee(client, {
        name,
        employeeType,
        baseRateCents
      })

      await client.query(`COMMIT`);
      res.json(employee);
    } catch (err) {
      await client.query(`ROLLBACK`);
      throw err;
    } finally {
      client.release();
    }
  };

  // List all employees
  listEmployees = async (_req: Request, res:Response) => {
    const client = await this.pool.connect();

    try {
      const employees = await this.employeeRepo.getAll(client);

      res.json(employees);
    } finally {
      client.release();
    }
  }
}