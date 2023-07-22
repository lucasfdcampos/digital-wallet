import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateAccountService } from './services/create-account.service';
import { GetAccountService } from './services/get-account.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountSwagger } from './swagger/create-account.swagger';
import { BadRequestSwagger } from '@common/swagger/bad-request.swagger';
import { ShowAccountSwagger } from './swagger/show-account.swagger';
import { ValidIdUUidParam } from '@common/dto/valid-id-uuid-param';
import { Account } from './entities/account.entity';
import { UnprocessableSwagger } from '@common/swagger/unprocessable-swagger';
import { NotFoundSwagger } from '@common/swagger/not-found.swagger';

@ApiTags('Accounts')
@Controller('v1/account')
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
  @ApiResponse({
    status: 422,
    description: 'Email already exists',
    type: UnprocessableSwagger,
  })
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
  async findOne(@Param() param: ValidIdUUidParam): Promise<Account> {
    return await this.getAccountservice.execute(param.id);
  }
}
