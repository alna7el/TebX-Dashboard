import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsRequiredIfNotSpecialAppointmentConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any;
    if (obj.is_waiting_list === false && obj.is_emergency === false) {
      return value !== undefined && value !== null && value !== '';
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is required for regular appointments`;
  }
}

export function IsRequiredIfNotSpecialAppointment(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRequiredIfNotSpecialAppointmentConstraint,
    });
  };
} 