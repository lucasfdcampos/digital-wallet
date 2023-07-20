import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { SortType } from '../enums/sort-type.enum';

export class ListTransactionParamsDto {
  @Transform(({ value }) => Number.parseInt(value))
  @IsOptional()
  @Min(1)
  @Max(20)
  @IsNumber()
  @ApiProperty({ required: false })
  limit = 20;

  @IsOptional()
  @IsEnum(SortType)
  @ApiProperty({
    description: 'data order',
    required: false,
    default: SortType.DESC,
    enum: SortType,
  })
  sort: SortType = SortType.DESC;

  @Transform(({ value }) => Number.parseInt(value))
  @IsOptional()
  @Min(0)
  @IsNumber()
  @ApiProperty({ required: false })
  offset = 0;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({ description: 'wallet id to get transaction from' })
  walletId: string;

  @IsOptional()
  @ApiProperty({ required: false })
  createdAtStart?: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  createdAtEnd?: Date;
}
