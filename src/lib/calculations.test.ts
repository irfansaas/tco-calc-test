import { describe, it, expect } from 'vitest';
import { calculate } from './calculations';

describe('TCO Calculator', () => {
  describe('with 600 users (Victor\'s example)', () => {
    const result = calculate({ userCount: 600 });

    describe('Infrastructure calculations', () => {
      it('should calculate concurrent users correctly', () => {
        expect(result.infrastructure.concurrentUsers).toBe(240);
      });

      it('should calculate MAU users correctly', () => {
        expect(result.infrastructure.mauUsers).toBe(300);
      });

      it('should calculate session hosts needed correctly', () => {
        expect(result.infrastructure.sessionHostsNeeded).toBe(15);
      });

      it('should calculate physical servers needed correctly', () => {
        expect(result.infrastructure.physicalServersNeeded).toBe(3);
      });
    });

    describe('On-Prem costs', () => {
      it('should calculate Citrix license correctly', () => {
        expect(Math.round(result.onPrem.citrixLicense)).toBe(44477);
      });

      it('should calculate RDS CALs correctly', () => {
        expect(result.onPrem.rdsCalLicense).toBe(39600);
      });

      it('should calculate Windows Server license correctly', () => {
        // Expected ~$30,720.00
        expect(result.onPrem.windowsServerLicense).toBeCloseTo(30720, -2);
      });
    });

    describe('Cloud costs', () => {
      it('should calculate AVD compute correctly', () => {
        expect(result.cloud.avdCompute).toBe(2640);
      });

      it('should calculate Nerdio license correctly', () => {
        // 300 MAU * $10/MAU/month = $3,000
        expect(result.cloud.nerdioLicense).toBe(3000);
      });

      it('should calculate cloud total monthly correctly', () => {
        // $2,640 (AVD) + $3,000 (Nerdio) = $5,640
        expect(result.cloud.totalMonthly).toBe(5640);
      });

      it('should calculate cloud total annual correctly', () => {
        // $5,640 * 12 = $67,680
        expect(result.cloud.totalAnnual).toBe(67680);
      });
    });

    describe('Savings', () => {
      it('should calculate savings percentage close to 41%', () => {
        // Without server hardware in base calc (user-added), ~41% savings
        expect(result.savings.percentage).toBeGreaterThan(39);
        expect(result.savings.percentage).toBeLessThan(43);
      });
    });

    describe('Cost of Delay', () => {
      it('should calculate cost of delay per day', () => {
        // Without server hardware in base calc, ~$131 per day
        expect(result.costOfDelay.perDay).toBeCloseTo(131, 0);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero users with minimum server buffer', () => {
      const result = calculate({ userCount: 0 });
      // With 0 users, cloud costs are 0 (no compute/licenses needed)
      expect(result.cloud.totalMonthly).toBe(0);
      // On-prem still has minimum Windows Server cost due to serverBuffer (1 server)
      // physicalServersNeeded = ceil(0/64) + 1 = 1
      // windowsServerLicense = 160 * 1 * 64 = 10240
      expect(result.onPrem.windowsServerLicense).toBe(10240);
      expect(result.infrastructure.concurrentUsers).toBe(0);
    });

    it('should handle small user counts', () => {
      const result = calculate({ userCount: 10 });
      expect(result.infrastructure.concurrentUsers).toBeGreaterThanOrEqual(0);
      expect(result.cloud.totalMonthly).toBeGreaterThanOrEqual(0);
    });

    it('should handle large user counts', () => {
      const result = calculate({ userCount: 10000 });
      expect(result.infrastructure.concurrentUsers).toBeGreaterThan(0);
      expect(result.cloud.totalMonthly).toBeGreaterThan(0);
    });
  });
});
