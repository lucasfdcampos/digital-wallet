import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndexTransactionSwagger } from './swagger/index-transaction.swagger';
import { ShowTransactionSwagger } from './swagger/show-transaction.swagger';
import { ListTransactionService } from './services/list-transaction.service';
import { GetTransactionService } from './services/get-transaction.service';
import { ValidIdUUidParam } from 'src/common/dto/valid-id-uuid-param';
import { ListTransactionParamsDto } from './dto/list-transaction-query-params.dto';
import { NotFoundSwagger } from 'src/common/swagger/not-found.swagger';

@Controller('v1/transaction')
@ApiTags('Transactions')
export class TransactionController {
  constructor(
    private readonly listTransactionService: ListTransactionService,
    private readonly getTransactionService: GetTransactionService,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Transaction list returned successfully',
    type: IndexTransactionSwagger,
    isArray: true,
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
    status: 404,
    description: 'History does not exist',
    type: NotFoundSwagger,
  })
  async findOne(@Param() param: ValidIdUUidParam) {
    return await this.getTransactionService.execute(param.id);
  }
}
