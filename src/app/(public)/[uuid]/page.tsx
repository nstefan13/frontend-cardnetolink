'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import classNames from 'classnames';

import Input from '@/components/reusables/Input/Input';
import Button from '@/components/reusables/Button/Button';
import ShareCardModal from '@/components/Cards/ShareCardModal/ShareCardModal';

import { CardApi } from '@/api';
import { constants } from '@/configs';
import { Card } from '@/types/cardTypes';

import SharePicture from 'public/svgs/share.svg';
import AddPicture from 'public/svgs/add.svg';
import PhonePicture from 'public/svgs/white-phone.svg';
import AddressPicture from 'public/svgs/white-address.svg';
import WebsitePicture from 'public/svgs/links.svg';
import NotePicture from 'public/svgs/white-note.svg';
import EmailPicture from 'public/svgs/white-email.svg';
import ProfilePicture from 'public/svgs/profile-picture.svg';

import styles from './Card.module.scss';
import Link from 'next/link';

const c = 'card-view';

interface CardPageProps {
  params: { uuid: string };
}

const patterns = {
  viber: /(viber:\/\/|https:\/\/viber\.com)/,
  instagram: /https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+/,
  telegram: /https?:\/\/(www\.)?(t\.me|telegram\.me)\/[A-Za-z0-9_]+/,
  linkedin: /https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+/,
  tiktok: /https?:\/\/(www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)/,
  calendly: /https?:\/\/(www\.)?calendly\.com\/[A-Za-z0-9_-]+/,
  whatsapp: /https?:\/\/(www\.)?wa\.me\/(\+?\d+)(\/|\?[\w=&]+)?/,
  linktree: /https?:\/\/(www\.)?linktr\.ee\/[A-Za-z0-9_.]+/
};

function CardPage({ params }: CardPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchCardData = async () => {
    try {
      const { data } = await CardApi.getCardByUuid(params.uuid);
      setCard(data);
    } catch (error) {
      setError('Failed to fetch card data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToContacts = () => {
    window.location.href = `${constants.apiUrl}/cards/${params.uuid}/vcf`;
  };

  useEffect(() => {
    if (searchParams.get('importContact') !== null) {
      handleAddToContacts();
    }
    fetchCardData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (loading || !card) {
    return <div></div>;
  }



  const handleClickLink = (url: string) => {
    window.open(url, '_blank');
  };

  const renderLinks = () => {
    const matchedLinks: { platform: string; url: string }[] = [];

    card.websites.forEach((website) => {
      if (matchedLinks.length < 4) {
        for (const [platform, pattern] of Object.entries(patterns)) {
          if (pattern.test(website.url)) {
            matchedLinks.push({ platform, url: website.url });
            break;
          }
        }
      }
    });

    if (matchedLinks.length > 0) {
      return (
        <div className={styles[`${c}__section`]}>
          <div className={styles[`${c}__section-links`]}>
            {matchedLinks.map((link, index) => (
              <div key={index} className={styles[`${c}__section-links-item`]}>
                <Button
                  variant="plain"
                  onClick={() => handleClickLink(link.url)}
                  className={styles[`${c}__section-links-item-action`]}
                >
                  <Image
                    height={0}
                    width={0}
                    src={`/svgs/links/${link.platform}.svg`}
                    alt={`${link.platform} icon`}
                  />
                </Button>
                <p className={styles[`${c}__section-links-item-text`]}>{link.platform}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles[`${c}-container`]}>
      <div className={styles[`${c}__section`]}>
        <div className={styles[`${c}__section-user`]}>
          <Image
            objectFit="cover"
            src={card.imageUrl ?? ProfilePicture}
            alt="profile picture"
            quality="100"
            width={103}
            height={103}
            className={styles[`${c}__section-user-image`]}
          />

          <div className={styles[`${c}__section-user-titles`]}>
            <div className={styles[`${c}__section-user-titles-name`]}>
              <p>{card ? card.firstName + ' ' + card.lastName : ''}</p>
            </div>

            <div className={styles[`${c}__section-user-titles-position`]}>
              <p>{card.title ? card.title : ''}</p>
              <p>{card.organizationName ? card.organizationName : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles[`${c}-contacts`]}>
        <button onClick={() => setShareModalOpen(true)} className={styles[`${c}-contacts-share`]}>
          <Image src={SharePicture} alt="share icon" />
          Share
        </button>
        <button onClick={handleAddToContacts} className={styles[`${c}-contacts-add`]}>
          <Image src={AddPicture} alt="add icon" />
          Add to Contacts
        </button>
      </div>

      {renderLinks()}

      {!!card.phones.length && (
        <div className={styles[`${c}__section`]}>
          {card.phones.map((phone, index) => (
            <div
              key={index}
              className={classNames(
                styles[`${c}__section-user`],
                styles[`${c}__section-user-data`]
              )}
            >
              <Link href={`tel:${phone.phoneNumber}`}>
                <div className={styles[`${c}__section-user-data-icon`]}>
                  <Image src={PhonePicture} alt="phone icon" />
                </div>
              </Link>
              <Link
                className={styles[`${c}__section-user-data-input`]}
                href={`tel:${phone.phoneNumber}`}
              >
                <Input
                  id="phone-number"
                  style={{ cursor: 'pointer' }}
                  type="tel"
                  readOnly
                  value={phone.phoneNumber}
                />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!!card.emails.length && (
        <div className={styles[`${c}__section`]}>
          {card.emails.map((email, index) => (
            <div
              key={index}
              className={classNames(
                styles[`${c}__section-user`],
                styles[`${c}__section-user-data`]
              )}
            >
              <Link href={`mailto:${email.email}`}>
                <div className={styles[`${c}__section-user-data-icon`]}>
                  <Image src={EmailPicture} alt="email picture" />
                </div>
              </Link>
              <Link
                className={styles[`${c}__section-user-data-input`]}
                href={`mailto:${email.email}`}
              >
                <Input
                  style={{ cursor: 'pointer' }}
                  id="email"
                  type="email"
                  readOnly
                  value={email.email}
                />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!!card.websites.length && (
        <div className={styles[`${c}__section`]}>
          {card.websites.map((website, index) => (
            <div
              key={index}
              className={classNames(
                styles[`${c}__section-user`],
                styles[`${c}__section-user-data`]
              )}
            >
              <Link href={website.url} target="_blank">
                <div className={styles[`${c}__section-user-data-icon`]}>
                  <Image height={24} src={WebsitePicture} alt="link picture" />
                </div>
              </Link>

              <Link
                className={styles[`${c}__section-user-data-input`]}
                target="_blank"
                href={website.url}
              >
                <Input
                  id="link"
                  style={{ cursor: 'pointer' }}
                  type="url"
                  readOnly
                  fullWidth
                  value={website.url}
                />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!!card.addresses.length && (
        <div className={styles[`${c}__section`]}>
          {card.addresses.map((address, index) => (
            <div
              key={index}
              className={classNames(
                styles[`${c}__section-user`],
                styles[`${c}__section-user-data`]
              )}
            >
              <div className={styles[`${c}__section-user-data-icon`]}>
                <Image src={AddressPicture} alt="address picture" />
              </div>
              <Input
                id="street-address"
                type="text"
                readOnly
                value={`${address.streetAddress}, ${address.apartment}`}
                className={styles[`${c}__section-user-data-input`]}
              />
            </div>
          ))}
        </div>
      )}

      {!!card.note.length && (
        <div className={styles[`${c}__section`]}>
          <div
            className={classNames(styles[`${c}__section-user`], styles[`${c}__section-user-data`])}
          >
            <div className={styles[`${c}__section-user-data-icon`]}>
              <Image src={NotePicture} alt="note icon" />
            </div>
            <Input
              id="note"
              type="text"
              readOnly
              value={card.note}
              className={styles[`${c}__section-user-data-input`]}
            />
          </div>
        </div>
      )}

      <Button fullWidth variant="text" onClick={() => router.push(`/${card.uuid}/edit`)}>
        Edit Card
      </Button>
      <ShareCardModal
        open={shareModalOpen}
        setOpen={setShareModalOpen}
        uuid={card.uuid}
        username={card.username}
      />
    </div>
  );
}

export default CardPage;
