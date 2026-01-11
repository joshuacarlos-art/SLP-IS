import { Caretaker, PerformanceAssessment, CaretakerFormData } from '@/components/caretaker/types';

export async function fetchCaretakers(): Promise<Caretaker[]> {
  try {
    const response = await fetch('/api/caretakers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch caretakers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching caretakers:', error);
    throw error;
  }
}

export async function fetchAssessments(caretakerId?: string): Promise<PerformanceAssessment[]> {
  try {
    const url = caretakerId 
      ? `/api/assessments?caretakerId=${caretakerId}`
      : '/api/assessments';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch assessments: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw error;
  }
}

export async function addCaretaker(caretakerData: CaretakerFormData): Promise<{ caretaker: Caretaker }> {
  try {
    const response = await fetch('/api/caretakers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caretakerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to add caretaker: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding caretaker:', error);
    throw error;
  }
}