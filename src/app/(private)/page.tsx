'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/reusables/Button/Button';
import CardItem from '@/components/Cards/CardItem/CardItem';
import ShareCardModal from '@/components/Cards/ShareCardModal/ShareCardModal';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/types/cardTypes';
import { CardApi } from '@/api';

import TypeWriter from 'public/typewriter.png';

import styles from './App.module.scss';
import DeleteCardModal from '@/components/Cards/DeleteCardModal/DeleteCardModal';

const c = 'list';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data } = await CardApi.getAllUserCards();
      setCards(data);
    } catch (error) {
      toast.error('Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    router.push('/create');
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const handleShareClick = (card: Card) => {
    setSelectedCard(card);
    setShareModalOpen(true);
  };

  const handleClickDelete = (card: Card) => {
    setSelectedCard(card);
    setDeleteModalOpen(true);
  };

  const handleSubmitDelete = () => {
    if (selectedCard) {
      const cardsCopy = cards.filter((card) => card.uuid !== selectedCard.uuid);
      setCards(cardsCopy);
      setDeleteModalOpen(false);
      setSelectedCard(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className={styles[`${c}`]}>
        <div className={styles[`${c}-content`]}>
          <div className={styles[`${c}-content-logo`]}>
            <Image width={40} height={40} src={TypeWriter} alt="logo" />
          </div>
          <h1 className={styles[`${c}-content-title`]}>
            {cards.length > 0 ? 'Your Cards' : loading ? 'Loading...' : "You don't have any cards"}
          </h1>
        </div>

        <div className={styles[`${c}-container`]}>
          {cards.map((card) => (
            <div key={card.uuid} className={styles[`${c}-container-wrapper`]}>
              <CardItem
                onClickDeleteCard={() => handleClickDelete(card)}
                onClickShare={() => handleShareClick(card)}
                card={card}
              />
            </div>
          ))}
        </div>
        <div className={styles[`${c}-actions`]}>
          <Button
            className={styles[`${c}-actions-create`]}
            onClick={handleRedirect}
            variant="plain"
          >
            Create new card
          </Button>

          <Button className={styles[`${c}-actions-logout`]} onClick={handleLogout} variant="plain">
            Log out
          </Button>
        </div>
      </div>

      <ShareCardModal
        uuid={selectedCard?.uuid}
        username={selectedCard?.username}
        open={shareModalOpen}
        setOpen={setShareModalOpen}
      />

      <DeleteCardModal
        uuid={selectedCard?.uuid}
        onSubmit={handleSubmitDelete}
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
      />
    </>
  );
}
