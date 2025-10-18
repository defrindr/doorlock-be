export enum AccountType {
  EMPLOYEE = 'employee',
  INTERN = 'intern',
  GUEST = 'guest',
}

export enum IdentificationType {
  KTP = 'ktp',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  OTHER = 'other',
}

export const getIdentificationTypes = (name: string) => {
  switch (name) {
    case 'ID Card':
      return IdentificationType.KTP;
    case 'Passport':
      return IdentificationType.PASSPORT;
    case 'Driver License':
      return IdentificationType.DRIVER_LICENSE;
    default:
      return IdentificationType.OTHER;
  }
};
