import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { ProducerService } from '@kafka/producer.service';
import { AuditModule } from '@audit/audit.module';

dotenv.config();

interface MockProducerService {
  execute: jest.Mock<any, any>;
  produce: jest.Mock<any, any>;
}

describe('AuditController (e2e)', () => {
  let app: INestApplication;
  let mockProducerService: MockProducerService;

  beforeAll(async () => {
    // Mock do ProducerService
    mockProducerService = {
      execute: jest.fn(),
      produce: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuditModule,
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
      ],
      providers: [
        {
          provide: ProducerService,
          useValue: mockProducerService,
        },
      ],
    })
      .overrideProvider(ProducerService)
      .useValue(mockProducerService as any)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[GET] /v1/audit', () => {
    it('should list an audit list', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/audit')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
