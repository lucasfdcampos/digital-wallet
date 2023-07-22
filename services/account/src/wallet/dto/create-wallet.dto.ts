import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  accountId: string;
}
