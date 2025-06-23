import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { RoleService } from 'src/roles/roles.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsSpecialityRequiredConstraint
  implements ValidatorConstraintInterface {
  constructor(private readonly roleService: RoleService) { }

  async validate(speciality: string, args: ValidationArguments): Promise<boolean> {
    const { role_id } = args.object as any;
    if (!role_id) return true;
    const role = await this.roleService.findById(role_id);
    if (role?.name === 'doctor') {
      return !!speciality;
    }
    return true;
  }

  defaultMessage(): string {
    return 'Speciality is required for users with the role "doctor".';
  }
}

export function IsSpecialityRequired(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSpecialityRequiredConstraint,
    });
  };
}
