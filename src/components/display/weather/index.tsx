import { DisplayContainer } from '../shared';
import { AnimationProvider } from '../shared/animation-provider';
import type { WeatherForecast } from '@/types';
import bgImage from '@/assets/backgrounds/04.jpeg';
import { format } from 'date-fns';
import { getWeatherIconWithTimeContext } from '@/utils';
import raindropIcon from '@/assets/icons/weather/raindrop.svg';
import windIcon from '@/assets/icons/weather/wind.svg';

interface WeatherDisplayProps {
  weatherForecast: WeatherForecast;
  area?: string;
}

/**
 * Displays current weather conditions and forecast with animated background video and weather icons
 */
export function WeatherDisplay({ weatherForecast, area }: WeatherDisplayProps) {
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
        <div className='flex flex-col items-center justify-center w-full h-full px-[5vw] py-[2.5vh]'>
          {area && (
            <div className='text-white text-center mb-[3vh] stagger-item animate-fade-in-up'>
              <h3 className='text-[3.5vw] font-bold drop-shadow-lg'>{area}</h3>
            </div>
          )}

          {/* Today's Weather - Prominent Display */}
          <div className='flex flex-col items-center mb-[6vh] w-full stagger-item animate-fade-in-up'>
            <div className='flex flex-row items-center justify-center gap-[8vw]'>
              <img
                src={getWeatherIconWithTimeContext(current.conditionId, current.icon)}
                alt={current.description}
                style={{ width: '12vw', height: '12vw' }}
                className='drop-shadow-2xl'
              />
              <div className='text-center'>
                <div className='text-[6vw] font-bold text-white drop-shadow-lg mb-[1vh]'>
                  {current.temperature}°C
                </div>
                <div className='text-[2vw] text-white font-semibold drop-shadow-md mb-[1vh]'>
                  Feels like {current.feelsLike}°C
                </div>
                <div className='text-[2.5vw] text-white font-semibold drop-shadow-md'>
                  {formatDescription(current.description)}
                </div>
              </div>
              <div className='flex flex-col gap-[4vh] text-white'>
                <div className='flex items-center gap-[1vw] bg-black/40 backdrop-blur-md rounded-xl px-[2vw] py-[2vh] shadow-lg'>
                  <img
                    src={raindropIcon}
                    alt='Humidity'
                    style={{ width: '3vw', height: '3vw' }}
                    className='drop-shadow-md'
                  />
                  <div>
                    <div className='text-[1.2vw] text-white font-medium'>Humidity</div>
                    <div className='text-[2vw] font-bold text-white'>{current.humidity}%</div>
                  </div>
                </div>
                <div className='flex items-center gap-[1vw] bg-black/40 backdrop-blur-md rounded-xl px-[2vw] py-[2vh] shadow-lg'>
                  <img
                    src={windIcon}
                    alt='Wind'
                    style={{ width: '3vw', height: '3vw' }}
                    className='drop-shadow-md'
                  />
                  <div>
                    <div className='text-[1.2vw] text-white font-medium'>Wind</div>
                    <div className='text-[2vw] font-bold text-white'>{current.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Forecast */}
          <div className='w-full flex flex-col items-center stagger-item animate-fade-in-up'>
            {forecast.length > 0 ? (
              <div className='w-full flex justify-center'>
                <div className='flex gap-[2vw]'>
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className='flex flex-col items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl shadow-lg animate-fade-in-up'
                      style={{
                        padding: '1.5vh 1vw',
                        width: '12vw',
                        animationDelay: `${0.3 + index * 0.1}s`,
                      }}
                    >
                      <div className='text-white font-bold text-[1.3vw] drop-shadow-md'>
                        {getDayName(day.date)}
                      </div>
                      <img
                        src={getWeatherIconWithTimeContext(day.conditionId, day.icon)}
                        alt={day.description}
                        style={{ width: '4.5vw', height: '4.5vw' }}
                        className='drop-shadow-lg'
                      />
                      <div className='flex flex-col items-center gap-[0.5vh]'>
                        <div className='text-white font-bold text-[1.8vw] drop-shadow-md'>
                          {day.tempMax}°
                        </div>
                        <div className='text-white/90 text-[1.3vw] drop-shadow-md'>
                          {day.tempMin}°
                        </div>
                      </div>
                      <div
                        className='text-white text-[0.9vw] text-center font-medium drop-shadow-sm flex items-center justify-center'
                        style={{ height: '4vh', lineHeight: '1.2' }}
                      >
                        {formatDescription(day.description).split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-white/70 text-[2vw]'>Forecast data unavailable</div>
            )}
          </div>
        </div>
      </AnimationProvider>
    </DisplayContainer>
  );
}
