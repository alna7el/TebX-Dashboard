import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Transaction } from "./schema/transaction.schema";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Model } from "mongoose";
import { TransactionDto } from "./dto/transaction.dto";
import * as XLSX from 'xlsx';


@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>
  ) {

  }
  async create(createTransactioDto: CreateTransactionDto) {
    return await this.transactionModel.create(createTransactioDto);
  }

  async findById(id: string) {
    return await this.transactionModel.findById(id)
      .populate('patient')
      .populate('clinic')
      .populate('branch')
      .populate('services')
      .exec();
  }

  async findAll(transactionDto: TransactionDto) {
    const { keyword, date_from, date_to } = transactionDto;
    const page = Number(transactionDto.page) || 1;
    const perPage = Number(transactionDto.perPage) || 10;
    const skip = (page - 1) * perPage;
    const query: any = {};

    if (keyword && keyword !== 'null') {
      query.$or = [
        { number: { $regex: keyword, $options: 'i' } },
        { 'patient.first_name_ar': { $regex: keyword, $options: 'i' } },
        { 'patient.first_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_ar': { $regex: keyword, $options: 'i' } },
      ];
    }
    if (date_from || date_to) {
      query.date = {};
      if (date_from) {
        const startDate = new Date(date_from);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59)
        query.date.$lte = endDate;
      }
    }

    const pipeline = [
      // Lookup for patient data
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },

      // Lookup for services data
      {
        $lookup: {
          from: 'services',
          localField: 'services',
          foreignField: '_id',
          as: 'services',
        },
      },
      // Apply filters
      { $match: query },

      // Sorting, Pagination
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: perPage },
    ];

    const [results, total] = await Promise.all([
      this.transactionModel.aggregate(<any>pipeline).exec(),
      this.transactionModel
        .aggregate([
          {
            $lookup: {
              from: 'patients',
              localField: 'patient',
              foreignField: '_id',
              as: 'patient',
            },
          },
          { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'services',
              localField: 'services',
              foreignField: '_id',
              as: 'services',
            },
          },
          { $match: query },
          { $count: 'total' },
        ])
        .exec(),
    ]);

    const totalCount = total[0]?.total || 0;
    const lastPage = Math.ceil(totalCount / perPage);
    const from = totalCount > 0 ? skip + 1 : 0;
    const to = Math.min(skip + perPage, totalCount);

    return {
      from,
      to,
      total: totalCount,
      page,
      per_page: perPage,
      last_page: lastPage,
      results,
    };
  }

  async exportExcel(transactionDto: TransactionDto) {
    const transactions = await this.getTransactions(transactionDto);
    const formattedData = transactions.map((transaction) => ({
      number: transaction.number,
      PatientName: transaction.patient ? `${transaction.patient.first_name_ar} ${transaction.patient.last_name_ar}` : 'N/A',
      Date: transaction.date.toISOString(),
      type: transaction.type,
      tax: transaction.tax,
      Total: transaction.total,
      Net_total: transaction.net_total,
      Invoice_number: transaction.inv_number,
      Services: transaction.services.map((service: any) => `${service.name_ar}`).join(', '),
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private async getTransactions(transactionDto: TransactionDto) {
    const { keyword, date_from, date_to } = transactionDto;
    const page = Number(transactionDto.page) || 1;
    const perPage = Number(transactionDto.perPage) || 10;
    const skip = (page - 1) * perPage;
    const query: any = {};

    if (keyword && keyword !== 'null') {
      query.$or = [
        { number: { $regex: keyword, $options: 'i' } },
        { 'patient.first_name_ar': { $regex: keyword, $options: 'i' } },
        { 'patient.first_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_en': { $regex: keyword, $options: 'i' } },
        { 'patient.last_name_ar': { $regex: keyword, $options: 'i' } },
      ];
    }
    if (date_from || date_to) {
      query.date = {};
      if (date_from) {
        const startDate = new Date(date_from);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59)
        query.date.$lte = endDate;
      }
    }


    const pipeline = [
      // Lookup for patient data
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },

      // Lookup for services data
      {
        $lookup: {
          from: 'services',
          localField: 'services',
          foreignField: '_id',
          as: 'services',
        },
      },
      // Apply filters
      { $match: query },

      // Sorting, Pagination
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: perPage },
    ];
    return await this.transactionModel.aggregate(<any>pipeline).exec()
  }

}