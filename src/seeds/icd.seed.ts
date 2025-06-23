import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync } from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';
import { Icd } from 'src/icd10/schema/icd.schema';
import * as XLSX from 'xlsx';


@Injectable()
export class IcdSeeder {
  constructor(@InjectModel(Icd.name) private icdModel: Model<Icd>,
  ) { }
  async seed() {
    const filePathDev = join(process.cwd(), 'src', 'files', 'icd10.xlsx');
    const filePathProd = join(process.cwd(), 'dist', 'files', 'icd10.xlsx');
    const filePath = existsSync(filePathDev) ? filePathDev : filePathProd;
    const icds = this.readExcelFile(filePath);
    for (const icd of icds) {
      const existingIcd = await this.icdModel.findOne({ code: icd.code });
      if (!existingIcd) {
        await this.icdModel.create(icd);
      }
    }
  }

  readExcelFile(filePath: string): { code: string, description: string }[] {
    const icdData: { code: string, description: string }[] = [];
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(jsonData);
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      icdData.push({ code: row[0], description: row[1] });
    }
    return icdData;
  }

}