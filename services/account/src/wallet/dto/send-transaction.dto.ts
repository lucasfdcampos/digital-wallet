import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class SendTransactionDto {
  @IsEnum(TransactionType)
  @ApiProperty({
    description: 'transaction type',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'value of the transaction',
    minLength: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  value: number;
}
