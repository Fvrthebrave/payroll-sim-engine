export class TaxService {
  computeTaxCents(grossCents: number): number {
    if(grossCents <= 100_000) {
      return Math.round(grossCents * 0.1);
    }

    if(grossCents <= 300_000) {
      return Math.round(grossCents * 0.15);
    }

    return Math.round(grossCents * 0.25);
  }
}