import { Pool } from 'pg';
import { LedgerRepo } from '../../repositories/ledger.repo';
import { AccountLabels } from '../../repositories/ledger.repo';

export class LedgerService {
  constructor(
    private pool: Pool,
    private ledgerRepo: LedgerRepo
  ) {}

  async getBalances() {
    const client = await this.pool.connect();

    try {
      const balances = await this.ledgerRepo.getBalances(client);
      
      return balances.map(r => ({
        account: r.account,
        label: AccountLabels[r.account] ?? r.account,
        balance: r.balance
      }))
    } finally {
      client.release();
    }
  }
}