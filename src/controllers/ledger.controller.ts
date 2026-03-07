import { Request, Response } from 'express';

export class LedgerController {
  constructor(private ledgerService: any) {}

  getBalances = async (req: Request, res: Response) => {
    console.log('HEYYY')
    const balances = await this.ledgerService.getBalances();

    res.json(balances);
  }
}