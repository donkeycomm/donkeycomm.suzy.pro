import type { FC } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
// Import Swiper styles
import 'swiper/css';

import 'swiper/css/effect-fade';

interface gallerySwiperProps {
  collections: Array<any>;
}

const CollectionsSwiper: FC<gallerySwiperProps> = ({ collections }) => {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        effect="fade"
        autoplay={{ delay: 1000 }}
        loop={true}
        speed={1000}
        modules={[Autoplay, EffectFade]}
      >
        {collections.map((collection, index) => (
          <SwiperSlide key={index}>
            <div
              onClick={() => navigate('/files', { state: collection.path })}
              className="relative w-full group cursor-pointer  h-[250px] md:h-[350px] lg:h-[400px] xl:h-[500px] overflow-hidden rounded-lg"
            >
              <img
                className="absolute top-0 left-0 object-cover object-center w-full h-full"
                src={collection.image}
                alt="Suzy"
              />
              <div className="absolute w-full h-full transition-all opacity-0 mask bg-default group-hover:opacity-30" />
              <h3 className="absolute text-3xl text-white transition-all opacity-0 bottom-10 left-10 group-hover:opacity-100">
                {collection.title}
              </h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
export default CollectionsSwiper;
