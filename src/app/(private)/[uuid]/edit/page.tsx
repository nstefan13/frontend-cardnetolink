'use client';
import CardForm from '@/components/Cards/CardForm/CardForm';

interface CardPageProps {
  params: { uuid: string };
}

export default function Edit({ params }: CardPageProps) {
  return <CardForm uuid={params.uuid} />;
}
