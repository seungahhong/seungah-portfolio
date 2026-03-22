'use client';

import { detectCardType } from '@/lib/chat/keyword-detector';
import { CareerResponseCard } from './cards/CareerResponseCard';
import { ProfileResponseCard } from './cards/ProfileResponseCard';

interface A2UICardsProps {
  userMessage: string;
}

export function A2UICards({ userMessage }: A2UICardsProps) {
  const cardType = detectCardType(userMessage);

  if (!cardType) return null;

  return (
    <div className="mb-5 ml-0 animate-fade-in-up">
      {cardType === 'career' && <CareerResponseCard />}
      {cardType === 'profile' && <ProfileResponseCard />}
    </div>
  );
}
