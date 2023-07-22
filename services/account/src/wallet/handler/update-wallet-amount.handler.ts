import { Injectable } from '@nestjs/common';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';
import { WalletAmountUpdated } from '../event/wallet-amount-updated';
import { HistoryType } from '@common/enums/history-type.enum';
import { Repository } from 'typeorm';
import { Wallet } from '@wallet/entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHistoryDto } from '@history/dto/create-history.dto';
import { History } from '@history/entities/history.entity';

@Injectable()
export class UpdateWalletAmountHandler {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  eventname = KafkaTopics.UPDATE_WALLET_AMOUNT;

  async execute(event: WalletAmountUpdated): Promise<void> {
    const isWithdrawOrPurchase = [
      HistoryType.WITHDRAW,
      HistoryType.PURCHASE,
    ].includes(event.type);

    const wallet = await this.updateWalletAmount(
      event.walletId,
      isWithdrawOrPurchase ? -event.value : event.value,
    );

    await this.createHistory({
      walletId: wallet.id,
      oldAmount:
        parseFloat(wallet.amount.toString()) +
        (isWithdrawOrPurchase ? event.value : -event.value),
      newAmount: parseFloat(wallet.amount.toString()),
      type: event.type,
      transactionId: event.transactionId,
    });
  }

  private async updateWalletAmount(
    id: string,
    amountChange: number,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
    });

    const oldAmount = parseFloat(wallet.amount.toString());
    const newAmount = oldAmount + parseFloat(amountChange.toString());

    wallet.amount = parseFloat(newAmount.toString());

    return this.walletRepository.save(wallet);
  }

  private async createHistory(data: CreateHistoryDto): Promise<History> {
    const history = this.historyRepository.create({
      walletId: data.walletId,
      oldAmount: data.oldAmount,
      newAmount: data.newAmount,
      type: data.type,
      transactionId: data.transactionId,
    });

    return await this.historyRepository.save(history);
  }
}
