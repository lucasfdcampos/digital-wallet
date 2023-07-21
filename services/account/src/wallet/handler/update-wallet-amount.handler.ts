import { Injectable } from '@nestjs/common';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';
import { WalletAmountUpdated } from '../event/wallet-amount-updated';
import { HistoryType } from 'src/common/enums/history-type.enum';
import { UpdateWalletAmountService } from '../services/update-wallet-amount.service';
import { CreateHistoryService } from 'src/history/services/create-history.service';

@Injectable()
export class UpdateWalletAmountHandler {
  constructor(
    private readonly updateWalletAmountService: UpdateWalletAmountService,
    private readonly createHistoryService: CreateHistoryService,
  ) {}

  eventname = KafkaTopics.UPDATE_WALLET_AMOUNT;

  async execute(event: WalletAmountUpdated): Promise<void> {
    const isWithdrawOrPurchase = [
      HistoryType.WITHDRAW,
      HistoryType.PURCHASE,
    ].includes(event.type);

    const wallet = await this.updateWalletAmountService.execute(
      event.walletId,
      isWithdrawOrPurchase ? -event.value : event.value,
    );

    await this.createHistoryService.execute({
      walletId: wallet.id,
      oldAmount:
        parseFloat(wallet.amount.toString()) +
        (isWithdrawOrPurchase ? event.value : -event.value),
      newAmount: parseFloat(wallet.amount.toString()),
      type: event.type,
      transactionId: event.transactionId,
    });
  }
}
