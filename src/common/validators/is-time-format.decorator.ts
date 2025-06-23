import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsTimeFormatConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!value) return true;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be in HH:mm format`;
  }
}

export function IsTimeFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeFormatConstraint,
    });
  };
} 