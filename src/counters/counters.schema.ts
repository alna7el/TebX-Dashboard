import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Counter {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, default: 0 })
  value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
