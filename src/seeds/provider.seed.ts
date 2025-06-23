import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Provider } from 'src/providers/schema/Provider.schema';

@Injectable()
export class ProviderSeeder {
  constructor(@InjectModel(Provider.name) private providerModel: Model<Provider>) { }

  async seed() {
    const providers = [
      { name_en: 'Tamima', name_ar: 'تميمة', email: 'tamima@gmail.com', phone: '+2010973855600' },
      { name_en: 'Elmokhtar', name_ar: 'المختار', email: 'elmokhtar@gmail.com', phone: '+2010973851100' },
    ];

    for (const provider of providers) {
      const existingProvider = await this.providerModel.findOne({ name_en: provider.name_en });
      if (!existingProvider) {
        await this.providerModel.create(provider);
      }
    }
  }
}
