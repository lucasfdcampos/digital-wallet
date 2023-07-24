import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { Audit } from './schemas/audit.schema';
import { TransactionType } from '@transaction/enums/transaction-type.enum';
import { TransactionStatus } from '@transaction/enums/transaction-status.enum';

const auditList: Audit[] = [
  new Audit({
    id: '1',
    walletId: '1',
    value: 100,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.APPROVED,
    createdAt: '2023-07-23T00:00:00.000Z',
  }),
];

describe('AuditController', () => {
  let auditController: AuditController;
  let auditService: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: {
            find: jest.fn().mockResolvedValue(auditList),
          },
        },
      ],
    }).compile();

    auditController = module.get<AuditController>(AuditController);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(auditController).toBeDefined();
    expect(auditService).toBeDefined();
  });

  describe('find', () => {
    it('should return audit list data', async () => {
      // Act
      const result = await auditController.index();

      // Assert
      expect(result).toEqual(auditList);
    });
  });
});
