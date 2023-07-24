import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { Model } from 'mongoose';
import { CreateAuditDto } from './dto/create-audit.dto';
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

const someAudit = new Audit({
  id: '1',
  walletId: '1',
  value: 100,
  type: TransactionType.DEPOSIT,
  status: TransactionStatus.APPROVED,
  createdAt: '2023-07-23T00:00:00.000Z',
});

describe('AuditService', () => {
  let auditService: AuditService;
  let auditModel: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getModelToken(Audit.name),
          useFactory: () => ({
            create: jest.fn().mockImplementation((dto: CreateAuditDto) => ({
              ...dto,
              save: jest.fn().mockResolvedValue(someAudit),
            })),
            find: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(auditList),
              }),
            }),
          }),
        },
      ],
    }).compile();

    auditService = module.get<AuditService>(AuditService);
    auditModel = module.get<Model<any>>(getModelToken(Audit.name)); // Use the correct token for your model name
  });

  it('should be defined', () => {
    expect(auditService).toBeDefined();
    expect(auditModel).toBeDefined();
  });

  describe('create', () => {
    it('should return the created audit object', async () => {
      // Arrange
      const createAuditDto: CreateAuditDto = {
        id: '1',
        walletId: '1',
        value: 100,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED,
        createdAt: '2023-07-23T00:00:00.000Z',
      };

      // Act
      const result = await auditService.create(createAuditDto);

      expect(result).toEqual(someAudit);
    });
  });

  describe('find', () => {
    it('should return an array of audit objects', async () => {
      // Act
      const result = await auditService.find();

      // Assert
      expect(result).toEqual(auditList);
    });
  });
});
