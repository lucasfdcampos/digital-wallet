import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty()
  accountId: string;
}
