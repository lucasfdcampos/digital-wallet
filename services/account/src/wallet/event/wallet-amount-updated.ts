import { HistoryType } from 'src/common/enums/history-type.enum';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';

export class WalletAmountUpdated {
  walletId: string;

  type: HistoryType;

  value: number;

  status: TransactionStatus;

  transactionId: string;
}
