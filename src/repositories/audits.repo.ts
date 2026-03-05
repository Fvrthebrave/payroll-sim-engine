import { PoolClient } from 'pg';

type LedgerRow = {
  id: string;
  type: string;
  createdDate: string
};

export class AuditRepo {
  async insert(
    client: PoolClient,
    params: {
      entity_type: string;
      entity_id: number;
      action: string;
      metadata: any;
    }
  ) {
    const res = await client.query(`
      INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
      VALUES ($1, $2, $3, $4)
      `,
      [params.entity_type, 
       params.entity_id,  
       params.action, 
       params.metadata ?? {}]
    );

    return res.rows[0];
  }

  async getAuditData(
    client: PoolClient
  ): Promise<LedgerRow[]> {
    const res = await client.query(`
        SELECT id, entity_type, action, metadata, created_at
        FROM audit_logs
        ORDER BY created_at
      `)

      return res.rows;
  }
}