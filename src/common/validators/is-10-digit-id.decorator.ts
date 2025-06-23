import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class Is10DigitIdConstraint implements ValidatorConstraintInterface {
  validate(nationalId: string) {
    return /^[0-9]{10}$/.test(nationalId); // Validate 10 digits
  }

  defaultMessage() {
    return 'National ID must be exactly 10 digits';
  }
}

export function Is10DigitId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: Is10DigitIdConstraint,
    });
  };
}
