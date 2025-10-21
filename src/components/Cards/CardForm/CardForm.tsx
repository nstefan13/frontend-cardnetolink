'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Popover } from 'react-tiny-popover';
import toast from 'react-hot-toast';
import classNames from 'classnames';

import Textarea from '@/components/reusables/Textarea/Textarea';
import Input from '@/components/reusables/Input/Input';
import Button from '@/components/reusables/Button/Button';
import Select from '@/components/reusables/Select/Select';

import { EmailTypeEnum } from '@/enums/emailTypeEnum';
import { PhoneTypeEnum } from '@/enums/phoneTypeEnum';
import { TitleTypeEnum } from '@/enums/titleTypeEnum';
import { WebsiteTypeEnum } from '@/enums/websiteTypeEnum';
import { AddressTypeEnum } from '@/enums/addressTypeEnum';
import { Card, CardEmail, CardPhone, CardWebsite, CardAddress } from '@/types/cardTypes';

import { CardApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

import IdentityEdit from 'public/edit-identity.png';
import IdentityCard from 'public/identity-card.png';
import NotePicture from 'public/svgs/note.svg';
import PersonalPicture from 'public/svgs/personal.svg';
import OccupationPicture from 'public/svgs/occupation.svg';
import PhonePicture from 'public/svgs/phone.svg';
import EmailPicture from 'public/svgs/email.svg';
import LinkPicture from 'public/svgs/links.svg';
import DeletePicture from 'public/svgs/trash-can.svg';
import AddressPicture from 'public/svgs/address.svg';
import PenPicture from 'public/svgs/pen.svg';
import ProfilePicture from 'public/svgs/profile-picture.svg';
import WarningIcon from 'public/svgs/warning.svg';
import CheckmarkIcon from 'public/svgs/checkmark.svg';

import styles from './CardForm.module.scss';

interface CardFormProps {
  uuid?: string;
}

interface ValidationErrors {
  phones: boolean[];
  emails: boolean[];
  websites: boolean[];
  addresses: boolean[];
}

interface ApiValidationErrors {
  phones: { [key: string]: string[] };
  emails: { [key: string]: string[] };
  websites: { [key: string]: string[] };
  addresses: { [key: string]: string[] };
  general: string[];
}

const c = 'card-form';

const defaultCard: Card = {
  name: '',
  title: '',
  suffix: '',
  firstName: '',
  lastName: '',
  organizationName: '',
  positionTitle: '',
  note: '',
  addresses: [],
  emails: [],
  websites: [],
  phones: []
};

const defaultPhone: CardPhone = {
  type: PhoneTypeEnum.Home,
  phoneNumber: ''
};

const defaultEmail: CardEmail = {
  type: EmailTypeEnum.Home,
  email: ''
};

const defaultWebsite: CardWebsite = {
  type: WebsiteTypeEnum.Home,
  url: ''
};

const defaultAddress: CardAddress = {
  type: AddressTypeEnum.Home,
  addressName: '',
  streetAddress: '',
  apartment: '',
  city: '',
  region: '',
  country: '',
  zipCode: ''
};

const phoneTypeOptions = Object.entries(PhoneTypeEnum).map(([key, value]) => ({
  label: key,
  value
}));

const emailTypeOptions = Object.entries(EmailTypeEnum).map(([key, value]) => ({
  label: key,
  value
}));

const websiteTypeOptions = Object.entries(WebsiteTypeEnum).map(([key, value]) => ({
  label: key,
  value
}));

const addressTypeOptions = Object.entries(AddressTypeEnum).map(([key, value]) => ({
  label: key,
  value
}));

const titleOptions = Object.entries(TitleTypeEnum).map(([key, value]) => ({
  label: value,
  value: value,
}))

// Utility to deeply trim all string fields in the card object
function deepTrimCard(card: Card): Card {
  const trimString = (value: any) => (typeof value === 'string' ? value.trim() : value);
  return {
    ...card,
    firstName: trimString(card.firstName),
    lastName: trimString(card.lastName),
    title: trimString(card.title),
    suffix: trimString(card.suffix),
    organizationName: trimString(card.organizationName),
    positionTitle: trimString(card.positionTitle),
    note: trimString(card.note),
    username: trimString((card as any).username),
    addresses: card.addresses.map(addr => ({
      ...addr,
      addressName: trimString(addr.addressName),
      streetAddress: trimString(addr.streetAddress),
      apartment: trimString(addr.apartment),
      city: trimString(addr.city),
      region: trimString(addr.region),
      country: trimString(addr.country),
      zipCode: trimString(addr.zipCode),
    })),
    emails: card.emails.map(email => ({
      ...email,
      email: trimString(email.email),
    })),
    phones: card.phones.map(phone => ({
      ...phone,
      phoneNumber: trimString(phone.phoneNumber),
    })),
    websites: card.websites.map(site => ({
      ...site,
      url: trimString(site.url),
    })),
  };
}

function CardForm({ uuid }: CardFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileRefKey, setFileRefKey] = useState('file');
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [card, setCard] = useState<Card>(defaultCard);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    phones: [],
    emails: [],
    websites: [],
    addresses: []
  });

  const [apiValidationErrors, setApiValidationErrors] = useState<ApiValidationErrors>({
    phones: {},
    emails: {},
    websites: {},
    addresses: {},
    general: []
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [usernamePopoverOpen, setUsernamePopoverOpen] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [originalUsername, setOriginalUsername] = useState<string | null>(null);

  useEffect(() => {
    if (uuid) {
      fetchCardData();
    }
  }, [uuid]);

  const fetchCardData = async () => {
    try {
      setLoading(true);
      if (uuid) {
        const { data } = await CardApi.getCardByUuid(uuid);

        setCard(data);

        setIsUsernameAvailable(!!data.username);
        if (data.username) {
          setOriginalUsername(data.username);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch card data.');
    } finally {
      setLoading(false);
    }
  };

  const parseApiValidationErrors = (error: any): ApiValidationErrors => {
    const errors: ApiValidationErrors = {
      phones: {},
      emails: {},
      websites: {},
      addresses: {},
      general: []
    };

    if (error?.response?.data?.message && Array.isArray(error.response.data.message)) {
      error.response.data.message.forEach((message: string) => {
        // Parse validation messages like "phones.0.phoneNumber must be a valid phone number"
        const match = message.match(/^(\w+)\.(\d+)\.(\w+)\s+(.+)$/);
        
        if (match) {
          const [, fieldType, index, fieldName, errorMessage] = match;
          const fieldIndex = parseInt(index);
          
          if (fieldType in errors) {
            if (!errors[fieldType as keyof Omit<ApiValidationErrors, 'general'>][fieldIndex]) {
              errors[fieldType as keyof Omit<ApiValidationErrors, 'general'>][fieldIndex] = [];
            }
            // Store the specific field name that has the error
            errors[fieldType as keyof Omit<ApiValidationErrors, 'general'>][fieldIndex].push(`${fieldName}: ${errorMessage}`);
          }
        } else {
          // General error message
          errors.general.push(message);
        }
      });
    }

    return errors;
  };

  const handleUpdateCard = async () => {
    setSaving(true);
    try {
      if (uuid) {
        const { userId, ...payload } = deepTrimCard(card);
        const file = fileInputRef.current?.files?.[0];

        if (!payload.username) {
          delete payload.username;
        }

        const { data } = await CardApi.updateCardByUuid(uuid, payload, file);
        setCard(data);
        router.push(`/${data.uuid}`);
      }
    } catch (error) {
      const apiErrors = parseApiValidationErrors(error);
      setApiValidationErrors(apiErrors);
      
      if (apiErrors.general.length > 0) {
        toast.error(apiErrors.general[0]);
      } else {
        toast.error("Couldn't update card, please check the form for errors.");
      }
    } finally {
      setSaving(false);
    }
  };

  const validateFields = () => {
    const newValidationErrors: ValidationErrors = {
      phones: [],
      emails: [],
      websites: [],
      addresses: []
    };

    let hasErrors = false;

    // Validate phones
    card.phones.forEach((phone, index) => {
      const trimmedPhoneNumber = (phone.phoneNumber ?? '').trim();
      const hasType = !!phone.type;
      const hasValue = !!trimmedPhoneNumber;
      const isInvalid = (hasType || hasValue) && !(hasType && hasValue);

      newValidationErrors.phones[index] = isInvalid;
      if (isInvalid) hasErrors = true;
    });

    // Validate emails
    card.emails.forEach((email, index) => {
      const trimmedEmail = (email.email ?? '').trim();
      const hasType = !!email.type;
      const hasValue = !!trimmedEmail;
      const isInvalid = (hasType || hasValue) && !(hasType && hasValue);

      newValidationErrors.emails[index] = isInvalid;
      if (isInvalid) hasErrors = true;
    });

    // Validate websites
    card.websites.forEach((website, index) => {
      const trimmedUrl = (website.url ?? '').trim();
      const hasType = !!website.type;
      const hasValue = !!trimmedUrl;
      const isInvalid = (hasType || hasValue) && !(hasType && hasValue);

      newValidationErrors.websites[index] = isInvalid;
      if (isInvalid) hasErrors = true;
    });

    // Validate addresses
    card.addresses.forEach((address, index) => {
      const trimmedAddressName = (address.addressName ?? '').trim();
      const hasType = !!address.type;
      const hasValue = !!trimmedAddressName;
      const isInvalid = (hasType || hasValue) && !(hasType && hasValue);

      newValidationErrors.addresses[index] = isInvalid;
      if (isInvalid) hasErrors = true;
    });

    setValidationErrors(newValidationErrors);

    if (hasErrors) {
      toast.error('Complete all the required fields');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      handleSave();
    }
  };

  const handleSave = () => {
    if (uuid) {
      handleUpdateCard();
    } else {
      handleCreateCard();
    }
  };

  const handleCreateCard = async () => {
    setSaving(true);

    try {
      if (!uuid) {
        const file = fileInputRef.current?.files?.[0];
        const trimmedCard = deepTrimCard(card);
        const { data } = await CardApi.createCard(trimmedCard, file);
        router.push(`/${data.uuid}`);
      }
    } catch (error) {
      const apiErrors = parseApiValidationErrors(error);
      setApiValidationErrors(apiErrors);
      
      if (apiErrors.general.length > 0) {
        toast.error(apiErrors.general[0]);
      } else {
        toast.error('Something went wrong, please check the form for errors.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPress = () => {
    if (uuid) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const addPhone = () => {
    const phones = [...card.phones, { ...defaultPhone }];
    setCard({ ...card, phones });
    setValidationErrors(prev => ({
      ...prev,
      phones: [...prev.phones, false]
    }));
  };

  const addEmail = () => {
    const emails = [...card.emails, { ...defaultEmail }];
    setCard({ ...card, emails });
    setValidationErrors(prev => ({
      ...prev,
      emails: [...prev.emails, false]
    }));
  };

  const addWebsite = () => {
    const websites = [...card.websites, { ...defaultWebsite }];
    setCard({ ...card, websites });
    setValidationErrors(prev => ({
      ...prev,
      websites: [...prev.websites, false]
    }));
  };

  const addAddress = () => {
    const addresses = [...card.addresses, { ...defaultAddress }];
    setCard({ ...card, addresses });
    setValidationErrors(prev => ({
      ...prev,
      addresses: [...prev.addresses, false]
    }));
  };

  const handlePhoneChange = (index: number, key: keyof CardPhone, value: string) => {
    const phonesCopy = [...card.phones];
    phonesCopy[index] = { ...phonesCopy[index], [key]: value };
    setCard({ ...card, phones: phonesCopy });
    
    // Clear API validation errors for this field when user starts typing
    if (apiValidationErrors.phones[index]) {
      const newApiErrors = { ...apiValidationErrors };
      delete newApiErrors.phones[index];
      setApiValidationErrors(newApiErrors);
    }
  };

  const handleEmailChange = (index: number, key: keyof CardEmail, value: string) => {
    const emailsCopy = [...card.emails];
    emailsCopy[index] = { ...emailsCopy[index], [key]: value };
    setCard({ ...card, emails: emailsCopy });
    
    // Clear API validation errors for this field when user starts typing
    if (apiValidationErrors.emails[index]) {
      const newApiErrors = { ...apiValidationErrors };
      delete newApiErrors.emails[index];
      setApiValidationErrors(newApiErrors);
    }
  };

  const handleWebsiteChange = (index: number, key: keyof CardWebsite, value: string) => {
    const websitesCopy = [...card.websites];
    websitesCopy[index] = { ...websitesCopy[index], [key]: value };
    setCard({ ...card, websites: websitesCopy });
    
    // Clear API validation errors for this field when user starts typing
    if (apiValidationErrors.websites[index]) {
      const newApiErrors = { ...apiValidationErrors };
      delete newApiErrors.websites[index];
      setApiValidationErrors(newApiErrors);
    }
  };

  const handleAddressChange = (index: number, key: keyof CardAddress, value: string) => {
    const addressesCopy = [...card.addresses];
    addressesCopy[index] = { ...addressesCopy[index], [key]: value };
    setCard({ ...card, addresses: addressesCopy });
    
    // Clear API validation errors for this field when user starts typing
    if (apiValidationErrors.addresses[index]) {
      const newApiErrors = { ...apiValidationErrors };
      delete newApiErrors.addresses[index];
      setApiValidationErrors(newApiErrors);
    }
  };

  const handleChangeCard = (key: keyof Card, value: string) => {
    setCard({ ...card, [key]: value });
  };

  const removePhone = (index: number) => {
    const phones = card.phones.filter((_, i) => i !== index);
    setCard({ ...card, phones });
    setValidationErrors(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  const removeEmail = (index: number) => {
    const emails = card.emails.filter((_, i) => i !== index);
    setCard({ ...card, emails });
    setValidationErrors(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const removeWebsite = (index: number) => {
    const websites = card.websites.filter((_, i) => i !== index);
    setCard({ ...card, websites });
    setValidationErrors(prev => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index)
    }));
  };

  const removeAddress = (index: number) => {
    const addresses = card.addresses.filter((_, i) => i !== index);
    setCard({ ...card, addresses });
    setValidationErrors(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const renderPopover = () => {
    return (
      <div className={styles[`${c}__popover`]}>
        <div onClick={handleAddPhoto} className={classNames(styles[`${c}__popover-action`])}>
          Upload
        </div>
        <div
          onClick={handleRemovePhoto}
          className={classNames(
            styles[`${c}__popover-action`],
            styles[`${c}__popover-action--error`]
          )}
        >
          Remove
        </div>
      </div>
    );
  };

  const handleAddPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = () => {
    // Safely destructure only if properties exist
    const updatedCard = { ...card };
    delete updatedCard.fileKey;
    delete updatedCard.imageUrl;
    setCard(updatedCard);

    setFileRefKey(new Date().getTime().toString());
    setImageDataUrl('');
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (PNG, JPEG, or WebP)');
        return;
      }

      // Validate file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImageDataUrl(dataUrl);
      };

      reader.onerror = () => {
        toast.error('Failed to read the selected file');
      };

      reader.readAsDataURL(file);
    }
  };

  const handleGetUsernameAvailability = useCallback((username: string) => {
    if (username === originalUsername) {
      setIsUsernameAvailable(true);
      setIsUsernameChecking(false);
      return;
    }

    if (!username.trim()) {
      setIsUsernameAvailable(false);
      setIsUsernameChecking(false);
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    setIsUsernameChecking(true);

    // Debounce the API call
    usernameCheckTimeoutRef.current = setTimeout(() => {
      CardApi.getUsernameAvailability(username)
        .then(() => {
          setIsUsernameAvailable(true);
        })
        .catch(() => {
          setIsUsernameAvailable(false);
        })
        .finally(() => {
          setIsUsernameChecking(false);
        });
    }, 500);
  }, [originalUsername]);

  const getPhoto = () => {
    if (imageDataUrl) {
      return imageDataUrl;
    } else if (card.imageUrl) {
      return card.imageUrl;
    }

    return ProfilePicture;
  };

  const renderUsername = () => {
    return (
      <div className={styles[`${c}__section-user-name`]}>
        <Input
          id="username-link"
          className={styles[`${c}__section-user-name-input-left`]}
          disabled
          value={'cardneto.link/'}
        />

        <Popover
          isOpen={usernamePopoverOpen}
          reposition={true}
          onClickOutside={() => setUsernamePopoverOpen(false)}
          positions={['top', 'bottom']}
          containerStyle={{ top: '12px' }}
          content={
            <div className={styles[`${c}__section-user-name-input-popup`]}>
              <Image 
                src={isUsernameChecking ? WarningIcon : (isUsernameAvailable ? CheckmarkIcon : WarningIcon)} 
                alt="icon" 
              />
              {isUsernameChecking 
                ? 'Checking...' 
                : isUsernameAvailable 
                  ? 'Username Available' 
                  : 'Username Unavailable'
              }
            </div>
          }
        >
          <div>
            <Input
              id="username"
              icon={isUsernameChecking ? WarningIcon : (isUsernameAvailable ? CheckmarkIcon : WarningIcon)}
              height={20}
              onIconClick={() => setUsernamePopoverOpen(!usernamePopoverOpen)}
              className={styles[`${c}__section-user-name-input-right`]}
              value={card?.username || ''}
              style={{
                paddingRight: '2px'
              }}
              onChange={(e) => {
                handleChangeCard('username', e.target.value);
                handleGetUsernameAvailability(e.target.value);
              }}
            />
          </div>
        </Popover>
      </div>
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  if (uuid && card && user && card.userId && card.userId !== user.id) {
    toast.error('Can not edit this card, as you are not the owner.');
    router.push('/');
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles[`${c}-container`]}>
      <div className={styles[`${c}-header`]}>
        <div className={styles[`${c}-header-image-container`]}>
          <Image
            width={36}
            height={36}
            src={card.uuid ? IdentityEdit : IdentityCard}
            alt="identity card"
          />
        </div>
        <p className={styles[`${c}-header-text`]}>
          {card.uuid ? 'Edit your Card' : 'Create a New Card'}
        </p>
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-user`]}>
          <Image
            objectFit="cover"
            src={getPhoto()}
            alt="profile picture"
            quality="100"
            width={103}
            height={103}
            className={styles[`${c}__section-user-image`]}
          />
          <Popover
            onClickOutside={() => setImagePopoverOpen(false)}
            content={renderPopover()}
            positions={['bottom', 'top']}
            isOpen={imagePopoverOpen}
          >
            <div className={styles[`${c}__section-user-edit-button-container`]}>
              <Button
                className={styles[`${c}__section-user-edit-button`]}
                variant="plain"
                onClick={() => setImagePopoverOpen(true)}
                icon={PenPicture}
              />
            </div>
          </Popover>
          <div className={styles[`${c}__section-user-data`]}>
            <p>{user?.email}</p>
            {renderUsername()}
          </div>
        </div>
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={PersonalPicture} alt="icon image" width={16} height={16} />
          <label>Personal</label>
        </div>

        <div className={styles[`${c}__section-title`]}>
          <Select
            className={styles[`${c}__section-prefix`]}
            placeholder="Title"
            options={titleOptions}
            defaultValue={titleOptions.find((option) => option.value === card.title)}
            onChange={(option) => handleChangeCard('title', (option as any).value)}
          />
          
          <Input
            fullWidth
            id="first-name"
            type="text"
            value={card.firstName || ''}
            onChange={(e) => handleChangeCard('firstName', e.target.value)}
            label="First Name"
          />
        </div>


        <Input
          id="last-name"
          type="text"
          value={card.lastName || ''}
          onChange={(e) => handleChangeCard('lastName', e.target.value)}
          label="Last Name"
        />
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={OccupationPicture} alt="purse image" width={16} height={16} />
          <label>Occupation</label>
        </div>

        <Input
          id="organization"
          value={card.organizationName || ''}
          onChange={(e) => handleChangeCard('organizationName', e.target.value)}
          label="Organization Name"
        />

        <Input
          id="position"
          value={card.positionTitle || ''}
          onChange={(e) => handleChangeCard('positionTitle', e.target.value)}
          label="Position Title"
        />
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={PhonePicture} alt="phone image" width={16} height={16} />

          <label>Phone</label>
        </div>

        {card.phones.map((phone, index) => (
          <div key={index} className={styles[`${c}__section-item`]}>
            <div key={index} className={styles[`${c}-row`]}>
              <Select
                className={styles[`${c}-row-select`]}
                placeholder="Type"
                options={phoneTypeOptions}
                value={phoneTypeOptions.find((option) => option.value === phone.type)}
                onChange={(option) =>
                  handlePhoneChange(index, 'type', (option as any).value as PhoneTypeEnum)
                }
                error={!!validationErrors.phones[index] || !!apiValidationErrors.phones[index]}
              />
              <Input
                id={'phone' + index}
                type="text"
                value={phone.phoneNumber || ''}
                label={index ? `Phone Number ${index + 1}` : 'Phone Number'}
                onChange={(e) => handlePhoneChange(index, 'phoneNumber', e.target.value)}
                className={styles[`${c}-row-input`]}
                error={!!validationErrors.phones[index] || !!apiValidationErrors.phones[index]}
              />
              <Button
                className={styles[`${c}-row-action`]}
                onClick={() => removePhone(index)}
                icon={DeletePicture}
                variant="plain"
              />
            </div>
          </div>
        ))}

        <p className={styles[`${c}__section-item-add`]} onClick={addPhone}>
          Add Phone
        </p>
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={EmailPicture} alt="email image" width={16} height={16} />

          <label>Email</label>
        </div>

        {card.emails.map((email, index) => (
          <div key={index} className={styles[`${c}__section-item`]}>
            <div key={index} className={styles[`${c}-row`]}>
              <Select
                className={styles[`${c}-row-select`]}
                placeholder="Type"
                options={emailTypeOptions}
                value={emailTypeOptions.find((option) => option.value === email.type)}
                onChange={(option) =>
                  handleEmailChange(index, 'type', (option as any).value as EmailTypeEnum)
                }
                error={!!validationErrors.emails[index]}
              />

              <Input
                id={'email' + index}
                type="text"
                value={email.email || ''}
                label={index ? `Email ${index + 1}` : 'Email'}
                onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                className={styles[`${c}-row-input`]}
                error={!!validationErrors.emails[index]}
              />
              <Button
                className={styles[`${c}-row-action`]}
                onClick={() => removeEmail(index)}
                icon={DeletePicture}
                variant="plain"
              />
            </div>
          </div>
        ))}

        <p className={styles[`${c}__section-item-add`]} onClick={addEmail}>
          Add Email
        </p>
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={LinkPicture} alt="link image" width={16} height={16} />

          <label>Links</label>
        </div>

        {card.websites.map((website, index) => (
          <div key={index} className={styles[`${c}__section-item`]}>
            <div key={index} className={styles[`${c}-row`]}>
              <Select
                className={styles[`${c}-row-select`]}
                placeholder="Type"
                options={websiteTypeOptions}
                value={websiteTypeOptions.find((option) => option.value === website.type)}
                onChange={(option) =>
                  handleWebsiteChange(index, 'type', (option as any).value as WebsiteTypeEnum)
                }
                error={!!validationErrors.websites[index]}
              />

              <Input
                id={'link' + index}
                type="text"
                value={website.url || ''}
                label={index ? `Link ${index + 1}` : 'Link'}
                onChange={(e) => handleWebsiteChange(index, 'url', e.target.value)}
                className={styles[`${c}-row-input`]}
                error={!!validationErrors.websites[index]}
              />
              <Button
                className={styles[`${c}-row-action`]}
                onClick={() => removeWebsite(index)}
                icon={DeletePicture}
                variant="plain"
              />
            </div>
          </div>
        ))}

        <p className={styles[`${c}__section-item-add`]} onClick={addWebsite}>
          Add Website
        </p>
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={AddressPicture} alt="address image" width={16} height={16} />
          <label>Address</label>
        </div>

        {card.addresses.map((address, index) => (
          <div key={index} className={styles[`${c}__section-item`]}>
            <label>{index ? `Address ${index + 1}` : ''}</label>
            <div key={index} className={styles[`${c}-row`]}>
              <Select
                className={styles[`${c}-row-select`]}
                placeholder="Type"
                options={addressTypeOptions}
                value={addressTypeOptions.find((option) => option.value === address.type)}
                onChange={(option) =>
                  handleAddressChange(index, 'type', (option as any).value as AddressTypeEnum)
                }
                error={!!validationErrors.addresses[index]}
              />
              <Input
                id={'address-name' + index}
                type="text"
                value={address.addressName || ''}
                label={index ? `Name ${index + 1}` : 'Name'}
                onChange={(e) => handleAddressChange(index, 'addressName', e.target.value)}
                className={styles[`${c}-row-input`]}
                error={!!validationErrors.addresses[index]}
              />

              <Button
                className={styles[`${c}-row-action`]}
                onClick={() => removeAddress(index)}
                icon={DeletePicture}
                variant="plain"
              />
            </div>

            <Input
              id={'street-address' + index}
              type="text"
              value={address.streetAddress || ''}
              label="Street"
              onChange={(e) => handleAddressChange(index, 'streetAddress', e.target.value)}
            />

            <Input
              id={'apartment' + index}
              type="text"
              value={address.apartment || ''}
              label="Apt, Suite, Bldg."
              onChange={(e) => handleAddressChange(index, 'apartment', e.target.value)}
            />

            <div className={styles[`${c}-row`]}>
              <Input
                id={'city' + index}
                type="text"
                value={address.city || ''}
                label="City"
                fullWidth
                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
              />
              <Input
                id={'region' + index}
                type="text"
                value={address.region || ''}
                label="Region"
                className={styles[`${c}-row-input--country`]}
                onChange={(e) => handleAddressChange(index, 'region', e.target.value)}
              />
            </div>
            <div className={styles[`${c}-row`]}>
              <Input
                id={'country' + index}
                type="text"
                value={address.country || ''}
                label="Country"
                fullWidth
                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
              />
              <Input
                id={'postal-code' + index}
                className={styles[`${c}-row-input--postal`]}
                type="text"
                value={address.zipCode || ''}
                label="Zip/Postal Code"
                onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
              />
            </div>
          </div>
        ))}
        <p className={styles[`${c}__section-item-add`]} onClick={addAddress}>
          Add Address
        </p>
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-label`]}>
          <Image src={NotePicture} alt="note image" width={16} height={16} />
          <label>Note</label>
        </div>
        <Textarea
          id="notes"
          rows={3}
          value={card.note || ''}
          label="Type notes here"
          placeholder=" "
          onChange={(e) => handleChangeCard('note', e.target.value)}
        />
      </div>

      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-buttons`]}>
          <Button fullWidth onClick={handleSubmit} disabled={saving || loading}>
            {loading ? 'Loading...' : saving ? 'Saving...' : uuid ? 'Update Card' : 'Create Card'}
          </Button>
          <Button
            fullWidth
            variant="error"
            className={styles[`${c}-button-error`]}
            onClick={handleCancelPress}
          >
            Cancel
          </Button>
        </div>
      </div>
      <input
        accept="image/png, image/jpeg, image/webp"
        type="file"
        ref={fileInputRef}
        key={fileRefKey}
        style={{ display: 'none' }}
        onChange={handlePhotoChange}
      />
    </div>
  );
}

export default CardForm;
