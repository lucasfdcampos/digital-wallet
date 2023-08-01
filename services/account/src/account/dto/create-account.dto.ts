import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    example: 'johndoe@wallet.com',
  })
  email: string;
}
