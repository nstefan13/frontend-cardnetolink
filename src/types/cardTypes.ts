import { PhoneTypeEnum } from '@/enums/phoneTypeEnum';
import { EmailTypeEnum } from '@/enums/emailTypeEnum';
import { WebsiteTypeEnum } from '@/enums/websiteTypeEnum';
import { AddressTypeEnum } from '@/enums/addressTypeEnum';

export interface Card {
  id?: number;
  uuid?: string;
  username?: string;
  name: string;
  title: string;
  suffix: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  positionTitle: string;
  note: string;
  addresses: CardAddress[];
  emails: CardEmail[];
  websites: CardWebsite[];
  phones: CardPhone[];
  userId?: number;
  fileKey?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CardEmail {
  id?: number;
  type: EmailTypeEnum | null;
  email: string;
  card?: string;
  cardId?: number;
}

export interface CardPhone {
  id?: number;
  type: PhoneTypeEnum | null;
  phoneNumber: string;
  card?: string;
  cardId?: number;
}

export interface CardWebsite {
  id?: number;
  type: WebsiteTypeEnum | null;
  url: string;
  card?: string;
  cardId?: number;
}

export interface CardAddress {
  id?: number;
  type: AddressTypeEnum | null;
  addressName: string;
  streetAddress: string;
  apartment: string;
  city: string;
  region: string;
  country: string;
  zipCode: string;
  card?: string;
  cardId?: number;
}
