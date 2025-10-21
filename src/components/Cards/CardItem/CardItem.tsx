import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Button from '@/components/reusables/Button/Button';
import { Card } from '@/types/cardTypes';

import ProfilePicture from 'public/pfp.jpg';
import RemoveIcon from 'public/svgs/remove.svg';

import styles from './CardItem.module.scss';

interface CardItemProps {
  card: Card;
  onClickDeleteCard: () => void;
  onClickShare: () => void;
}

const c = 'card-item';

function CardItem({ card, onClickDeleteCard, onClickShare }: CardItemProps) {
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/${card.uuid}/edit`);
  };

  const getImage = () => {
    return card.imageUrl ?? ProfilePicture;
  };

  return (
    <>
      <div className={styles[c]}>
        <div onClick={onClickDeleteCard} className={styles[`${c}-remove`]}>
          <Image src={RemoveIcon} alt="remove" />
        </div>
        <div className={styles[`${c}-profile`]}>
          <div className={styles[`${c}-profile-image`]}>
            <Image quality="100" width={100} height={100} src={getImage()} alt="profile" />
          </div>
          <div className={styles[`${c}-profile-info`]}>
            <div className={styles[`${c}-profile-info-name`]}>
              {card.firstName + ' ' + card.lastName}
            </div>
            <div className={styles[`${c}-profile-info-title`]}>{card.title}</div>
          </div>
        </div>
        <div className={styles[`${c}-actions`]}>
          <Button
            fullWidth
            variant="text"
            onClick={handleEditClick}
            className={styles[`${c}-actions-edit`]}
          >
            Edit Card
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={onClickShare}
            className={styles[`${c}-actions-share`]}
          >
            Share
          </Button>
        </div>
      </div>
    </>
  );
}

export default CardItem;
