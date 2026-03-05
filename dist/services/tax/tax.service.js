"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxService = void 0;
class TaxService {
    computeTaxCents(grossCents) {
        if (grossCents <= 100000) {
            return Math.round(grossCents * 0.1);
        }
        if (grossCents <= 300000) {
            return Math.round(grossCents * 0.15);
        }
        return Math.round(grossCents * 0.25);
    }
}
exports.TaxService = TaxService;
//# sourceMappingURL=tax.service.js.map