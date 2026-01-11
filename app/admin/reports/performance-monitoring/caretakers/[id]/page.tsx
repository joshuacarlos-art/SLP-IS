'use client';

import { useParams } from 'next/navigation';
import CaretakerPerformance from '@/components/performance/caretakers/caretakerperformance';

export default function IndividualCaretakerPerformancePage() {
  const params = useParams();
  const caretakerId = params.id as string;

  return <CaretakerPerformance caretakerId={caretakerId} />;
}