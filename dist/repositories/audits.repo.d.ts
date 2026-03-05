import { PoolClient } from 'pg';
type LedgerRow = {
    id: string;
    type: string;
    createdDate: string;
};
export declare class AuditRepo {
    insert(client: PoolClient, params: {
        entity_type: string;
        entity_id: number;
        action: string;
        metadata: any;
    }): Promise<any>;
    getAuditData(client: PoolClient): Promise<LedgerRow[]>;
}
export {};
//# sourceMappingURL=audits.repo.d.ts.map