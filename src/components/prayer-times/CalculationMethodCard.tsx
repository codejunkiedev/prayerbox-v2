import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CalculationMethod, JuristicSchool } from '@/constants';
import type { PrayerTimes } from '@/types';
import { useMemo } from 'react';

interface CalculationMethodCardProps {
  savedSettings: PrayerTimes | null;
}

export function CalculationMethodCard({ savedSettings }: CalculationMethodCardProps) {
  const calculationMethod = useMemo(() => {
    type CalculationMethodType = keyof typeof CalculationMethod;
    const method = Object.keys(CalculationMethod).find(
      key => CalculationMethod[key as CalculationMethodType] === savedSettings?.calculation_method
    );
    return method?.replace(/_/g, ' ');
  }, [savedSettings?.calculation_method]);

  const juristicSchool = useMemo(() => {
    type JuristicSchoolType = keyof typeof JuristicSchool;
    const school = Object.keys(JuristicSchool).find(
      key => JuristicSchool[key as JuristicSchoolType] === savedSettings?.juristic_school
    );
    return school?.replace(/_/g, ' ');
  }, [savedSettings?.juristic_school]);

  return (
    <Card>
      <CardHeader className='bg-primary/5 pb-2'>
        <CardTitle>Calculation Method</CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <p className='font-semibold'>Method:</p>
            <p>{calculationMethod}</p>
          </div>
          <div>
            <p className='font-semibold'>School:</p>
            <p>{juristicSchool}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
