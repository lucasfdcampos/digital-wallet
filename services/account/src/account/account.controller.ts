import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateAccountService } from './services/create-account.service';
import { GetAccountService } from './services/get-account.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountSwagger } from './swagger/create-account.swagger';
import { BadRequestSwagger } from 'src/common/swagger/bad-request.swagger';
import { ShowAccountSwagger } from './swagger/show-account.swagger';
import { ValidIdUUidParam } from 'src/common/dto/valid-id-uuid-param';
import { Account } from './entities/account.entity';

@Controller('v1/account')
@ApiTags('Accounts')
export class AccountController {
  constructor(
    private readonly createAccountService: CreateAccountService,
    private readonly getAccountservice: GetAccountService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new account' })
  @ApiResponse({
    status: 201,
    description: 'New account created successfully',
    type: CreateAccountSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid params',
    type: BadRequestSwagger,
  })
  @ApiResponse({ status: 422, description: 'Email already exists' })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return await this.createAccountService.execute(createAccountDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Show account data' })
  @ApiResponse({
    status: 200,
    description: 'Data from an account returned successfully',
    type: ShowAccountSwagger,
  })
  @ApiResponse({ status: 404, description: 'Account does not exist' })
  async findOne(@Param() param: ValidIdUUidParam): Promise<Account> {
    return await this.getAccountservice.execute(param.id);
  }
}
