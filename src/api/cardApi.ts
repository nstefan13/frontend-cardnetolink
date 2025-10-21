import { objectToFormData } from '@/helpers/objectToFormData';
import { sanitizePayload } from '@/helpers/sanitizePayload';
import { requestService } from '@/services';
import { Card } from '@/types/cardTypes';

export function getCardByUuid(uuid: string) {
  return requestService<Card>({ url: `/cards/${uuid}`, method: 'GET' });
}

export function createCard(card: Card, file?: File) {
  if (file) {
    const formData = objectToFormData(card);
    formData.append('image', file);

    return requestService<Card>({
      url: `/cards`,
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  return requestService<Card>({
    url: `/cards`,
    method: 'POST',
    data: card
  });
}

export function getAllUserCards() {
  return requestService<Card[]>({ url: `/cards`, method: 'GET' });
}

export function updateCardByUuid(uuid: string, card: Card, file?: File) {
  const { id, uuid: cardUuid, createdAt, updatedAt, ...cardData } = card;
  sanitizePayload(cardData);

  if (!cardData.fileKey) {
    delete cardData.fileKey;
  }

  delete cardData.imageUrl;

  if (file) {
    const formData = objectToFormData(cardData);
    formData.append('image', file);

    return requestService<Card>({
      url: `/cards/${uuid}`,
      method: 'PATCH',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  return requestService<Card>({
    url: `/cards/${uuid}`,
    method: 'PATCH',
    data: cardData
  });
}

export function deleteCardByUuid(uuid: string) {
  return requestService<Card>({ url: `/cards/${uuid}`, method: 'DELETE' });
}

export function getCardVcfFile(uuid: string) {
  return requestService<string>({ url: `/cards/${uuid}/vcf` });
}

export function getCardOnlineQrCode(uuid: string) {
  return requestService<string>({ url: `/cards/${uuid}/qr-online` });
}

export function getCardOfflineQrCode(uuid: string) {
  return requestService<string>({ url: `/cards/${uuid}/qr-offline` });
}

export function getCardJsonFile(uuid: string) {
  return requestService<string>({ url: `/cards/${uuid}/json` });
}

export function getUsernameAvailability(username: string) {
  return requestService({ url: `/cards/username/${username}` });
}
