import { TransactionType } from '../enums/transaction-type.enum';

export class TransactionCreated {
  walletId: string;

  type: TransactionType;

  value: number;

  originalTransactionId?: string;
}
