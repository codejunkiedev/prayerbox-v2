import { DisplayContainer } from '../shared';
import { AnimationProvider, itemVariants } from '../shared/animation-provider';
import { motion } from 'framer-motion';
import type { WeatherForecast } from '@/types';
import bgImage from '@/assets/backgrounds/05.jpeg';
import { format } from 'date-fns';
import { getWeatherIconWithTimeContext } from '@/utils/weatherIconMapping';
import raindropIcon from '@/assets/icons/weather/raindrop.svg';
import windIcon from '@/assets/icons/weather/wind.svg';

interface WeatherDisplayProps {
  weatherForecast: WeatherForecast;
}

export function WeatherDisplay({ weatherForecast }: WeatherDisplayProps) {
  const { current, forecast } = weatherForecast;

  const formatDescription = (description: string) => {
    return description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <AnimationProvider>
        <div className='flex flex-col items-center justify-center w-full max-w-7xl mx-auto'>
          <motion.div variants={itemVariants} className='text-white text-center mb-6'>
            <h3 className='text-4xl md:text-5xl font-bold drop-shadow-lg'>{current.cityName}</h3>
          </motion.div>

          {/* Today's Weather - Prominent Display */}
          <motion.div variants={itemVariants} className='flex flex-col items-center mb-12 w-full'>
            <div className='flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16'>
              <img
                src={getWeatherIconWithTimeContext(current.conditionId, current.icon)}
                alt={current.description}
                className='w-48 h-48 md:w-56 md:h-56 drop-shadow-2xl animate-pulse'
              />
              <div className='text-center space-y-4'>
                <div className='text-8xl md:text-9xl font-bold text-white drop-shadow-lg'>
                  {current.temperature}°C
                </div>
                <div className='text-2xl md:text-3xl text-white font-semibold drop-shadow-md'>
                  Feels like {current.feelsLike}°C
                </div>
                <div className='text-3xl md:text-4xl text-white mt-6 font-semibold drop-shadow-md'>
                  {formatDescription(current.description)}
                </div>
              </div>
              <div className='flex flex-row md:flex-col gap-8 text-white mt-8 md:mt-0'>
                <div className='flex items-center gap-5 bg-black/40 backdrop-blur-md rounded-xl px-8 py-6 shadow-lg'>
                  <img
                    src={raindropIcon}
                    alt='Humidity'
                    className='w-14 h-14 md:w-16 md:h-16 drop-shadow-md'
                  />
                  <div>
                    <div className='text-lg text-white font-medium'>Humidity</div>
                    <div className='text-3xl font-bold text-white'>{current.humidity}%</div>
                  </div>
                </div>
                <div className='flex items-center gap-5 bg-black/40 backdrop-blur-md rounded-xl px-8 py-6 shadow-lg'>
                  <img
                    src={windIcon}
                    alt='Wind'
                    className='w-14 h-14 md:w-16 md:h-16 drop-shadow-md'
                  />
                  <div>
                    <div className='text-lg text-white font-medium'>Wind</div>
                    <div className='text-3xl font-bold text-white'>{current.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weather Forecast */}
          <motion.div variants={itemVariants} className='w-full flex flex-col items-center'>
            {forecast.length > 0 ? (
              <div className='w-full flex justify-center'>
                <div className='flex gap-4 md:gap-6'>
                  {forecast.map((day, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className='flex flex-col items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl p-4 md:p-6 w-[140px] md:w-[170px] h-[220px] md:h-[260px] hover:bg-black/50 transition-colors shadow-lg'
                    >
                      <div className='text-white font-bold text-xl md:text-2xl drop-shadow-md'>
                        {getDayName(day.date)}
                      </div>
                      <img
                        src={getWeatherIconWithTimeContext(day.conditionId, day.icon)}
                        alt={day.description}
                        className='w-20 h-20 md:w-24 md:h-24 drop-shadow-lg'
                      />
                      <div className='flex flex-col items-center'>
                        <div className='text-white font-bold text-2xl md:text-3xl drop-shadow-md'>
                          {day.tempMax}°
                        </div>
                        <div className='text-white/90 text-xl drop-shadow-md'>{day.tempMin}°</div>
                      </div>
                      <div className='text-white text-base text-center font-medium drop-shadow-sm h-10 flex items-center'>
                        {formatDescription(day.description).split(' ').slice(0, 2).join(' ')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-white/70 text-2xl'>Forecast data unavailable</div>
            )}
          </motion.div>
        </div>
      </AnimationProvider>
    </DisplayContainer>
  );
}
