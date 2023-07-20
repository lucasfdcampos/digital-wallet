import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ValidIdUUidParam {
  @IsUUID('4')
  @ApiProperty({ format: 'uuid' })
  id: string;
}
