import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { TransactionService } from "./transactions.service";
import { TransactionDto } from "./dto/transaction.dto";
import { Response } from "express";

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Get()
  async findAll(@Query() transactionDto: TransactionDto) {
    return await this.transactionService.findAll(transactionDto);
  }

  @Get('excel-export')
  async downloadTransactionsExcel(@Query() transactionDto: TransactionDto, @Res() res: Response): Promise<void> {
    const fileBuffer = await this.transactionService.exportExcel(transactionDto);
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(fileBuffer);
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    const transaction = await this.transactionService.findById(id);
    return { transaction }
  }

}