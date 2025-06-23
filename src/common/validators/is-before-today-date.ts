import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsBeforeTodayDateConstraint implements ValidatorConstraintInterface {
  validate(date: string | Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && parsedDate < today;
  }

  defaultMessage() {
    return 'Date must be before today';
  }
}

export function IsBeforeTodayDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBeforeTodayDateConstraint,
    });
  };
}
