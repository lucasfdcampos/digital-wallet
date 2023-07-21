import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';
import { ProducerService } from 'src/kafka/producer.service';
import { TransactionType } from '../enums/transaction-type.enum';

@Injectable()
export class SendTransactionsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly producerService: ProducerService,
  ) {}

  async execute(id: string, data: SendTransactionDto): Promise<void> {
    await this.validateWallet(id, data);

    await this.producerService.produce({
      topic: KafkaTopics.CREATE_TRANSACTION,
      messages: [
        {
          value: JSON.stringify({
            walletId: id,
            type: data.type,
            value: data.value,
          }),
        },
      ],
    });
  }

  private async validateWallet(
    id: string,
    transaction: SendTransactionDto,
  ): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet does not exist');
    }

    if (!wallet.isEnabled) {
      throw new UnprocessableEntityException('Wallet is not enabled');
    }

    if (
      transaction.type === TransactionType.WITHDRAW &&
      wallet.amount < transaction.value
    ) {
      throw new UnprocessableEntityException(
        'Insufficient balance for the transaction',
      );
    }
  }
}
