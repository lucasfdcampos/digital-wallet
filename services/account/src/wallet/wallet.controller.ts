import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateWalletService } from './services/create-wallet.service';
import { Wallet } from './entities/wallet.entity';
import { GetWalletService } from './services/get-wallet.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidIdUUidParam } from 'src/common/dto/valid-id-uuid-param';
import { CreateWalletSwagger } from './swagger/create-wallet.swagger';
import { BadRequestSwagger } from 'src/common/swagger/bad-request.swagger';
import { ShowWalletSwagger } from './swagger/show-wallet.swagger';
import { NotFoundSwagger } from 'src/common/swagger/not-found.swagger';

@Controller('v1/wallet')
@ApiTags('Wallets')
export class WalletController {
  constructor(
    private readonly createWalletService: CreateWalletService,
    private readonly getWalletService: GetWalletService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new wallet' })
  @ApiResponse({
    status: 201,
    description: 'New wallet created successfully',
    type: CreateWalletSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid params',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Account does not exist',
    type: NotFoundSwagger,
  })
  async create(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    return await this.createWalletService.execute(createWalletDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Show wallet data' })
  @ApiResponse({
    status: 200,
    description: 'Data from a wallet returned successfully',
    type: ShowWalletSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Wallet does not exist',
    type: NotFoundSwagger,
  })
  async findOne(@Param() param: ValidIdUUidParam): Promise<Wallet> {
    return await this.getWalletService.execute(param.id);
  }
}
