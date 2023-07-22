import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndexTransactionSwagger } from './swagger/index-transaction.swagger';
import { ShowTransactionSwagger } from './swagger/show-transaction.swagger';
import { ListTransactionService } from './services/list-transaction.service';
import { GetTransactionService } from './services/get-transaction.service';
import { ValidIdUUidParam } from '@common/dto/valid-id-uuid-param';
import { ListTransactionParamsDto } from './dto/list-transaction-query-params.dto';
import { NotFoundSwagger } from '@common/swagger/not-found.swagger';
import { CancelTransactionService } from './services/cancel-transaction.service';
import { UnprocessableSwagger } from '@common/swagger/unprocessable-swagger';
import { TransactionType } from './enums/transaction-type.enum';
import { ReverseTransactionService } from './services/reverse-transaction.service';
import { BadRequestSwagger } from '@common/swagger/bad-request.swagger';

@ApiTags('Transactions')
@Controller('v1/transaction')
export class TransactionController {
  constructor(
    private readonly listTransactionService: ListTransactionService,
    private readonly getTransactionService: GetTransactionService,
    private readonly cancelTransactionService: CancelTransactionService,
    private readonly reverseTransactionService: ReverseTransactionService,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Transaction list returned successfully',
    type: IndexTransactionSwagger,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid params',
    type: BadRequestSwagger,
  })
  @ApiOperation({ summary: 'List transactions' })
  async index(@Query() query: ListTransactionParamsDto) {
    return await this.listTransactionService.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Show transaction data' })
  @ApiResponse({
    status: 200,
    description: 'Data from a transaction returned successfully',
    type: ShowTransactionSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid params',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction does not exist',
    type: NotFoundSwagger,
  })
  async findOne(@Param() param: ValidIdUUidParam) {
    return await this.getTransactionService.execute(param.id);
  }

  @Post('cancel/:id')
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction data sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid params',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction does not exist',
    type: NotFoundSwagger,
  })
  @ApiResponse({
    status: 422,
    description: `Transaction type must be ${TransactionType.PURCHASE}`,
    type: UnprocessableSwagger,
  })
  @ApiResponse({
    status: 422,
    description: 'The original transaction has already been canceled',
    type: UnprocessableSwagger,
  })
  @ApiResponse({
    status: 404,
    description: `Last transaction of type ${TransactionType.PURCHASE} not found`,
    type: NotFoundSwagger,
  })
  @ApiResponse({
    status: 422,
    description: 'Cannot cancel the transaction as it is not the last purchase',
    type: UnprocessableSwagger,
  })
  async cancelTransaction(@Param() param: ValidIdUUidParam): Promise<void> {
    return await this.cancelTransactionService.execute(param.id);
  }

  @Post('reverse/:id')
  @ApiOperation({ summary: 'Reverse a transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction data sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid params',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction does not exist',
    type: NotFoundSwagger,
  })
  @ApiResponse({
    status: 422,
    description: `Transaction type must be ${TransactionType.PURCHASE}`,
    type: UnprocessableSwagger,
  })
  @ApiResponse({
    status: 422,
    description: 'The original transaction has already been reversed',
    type: UnprocessableSwagger,
  })
  async reverseTransaction(@Param() param: ValidIdUUidParam): Promise<void> {
    return await this.reverseTransactionService.execute(param.id);
  }
}
