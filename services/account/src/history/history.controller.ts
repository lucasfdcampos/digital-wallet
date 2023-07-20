import { Controller, Get, Param, Query } from '@nestjs/common';
import { ValidIdUUidParam } from 'src/common/dto/valid-id-uuid-param';
import { GetHistoryService } from './services/get-history.service';
import { ListHistoryParamsDto } from './dto/list-history-query-params.dto';
import { ListHistoryService } from './services/list-history.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShowHistorySwagger } from './swagger/show-history.swagger';
import { IndexHistorySwagger } from './swagger/index-history.swagger';
import { NotFoundSwagger } from 'src/common/swagger/not-found.swagger';
import { UnprocessableSwagger } from 'src/common/swagger/unprocessable-swagger';

@Controller('v1/history')
@ApiTags('Historic')
export class HistoryController {
  constructor(
    private readonly listHistoryService: ListHistoryService,
    private readonly getHistoryService: GetHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List historic' })
  @ApiResponse({
    status: 200,
    description: 'History list returned successfully',
    type: IndexHistorySwagger,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Wallet does not exist',
    type: NotFoundSwagger,
  })
  @ApiResponse({
    status: 422,
    description: 'Wallet is not enabled',
    type: UnprocessableSwagger,
  })
  async index(@Query() query: ListHistoryParamsDto) {
    return await this.listHistoryService.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Show history data' })
  @ApiResponse({
    status: 200,
    description: 'Data from a history returned successfully',
    type: ShowHistorySwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'History does not exist',
    type: NotFoundSwagger,
  })
  async findOne(@Param() param: ValidIdUUidParam) {
    return await this.getHistoryService.execute(param.id);
  }
}
