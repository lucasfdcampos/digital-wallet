import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    example: 'john_doe@picpay.com',
  })
  email: string;
}
