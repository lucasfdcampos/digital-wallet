import { ApiProperty } from '@nestjs/swagger';

export class UnprocessableSwagger {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string[];

  @ApiProperty()
  error: string;
}
