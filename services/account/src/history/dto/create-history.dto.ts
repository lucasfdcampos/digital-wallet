import { HistoryType } from 'src/common/enums/history-type.enum';

export class CreateHistoryDto {
  walletId: string;

  oldAmount: number;

  newAmount: number;

  type: HistoryType;

  transactionId: string;
}
