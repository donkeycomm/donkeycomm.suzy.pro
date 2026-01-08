import type { FC } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';

import 'swiper/css/pagination';

import 'swiper/css/effect-fade';

interface gallerySwiperProps {
  images: Array<string>;
}

const GallerySwiper: FC<gallerySwiperProps> = ({ images }) => {
  return (
    <div className="relative">
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        pagination={{
          el: '#swiper-pagination',
          type: 'bullets',
          bulletClass: 'bullet',
          bulletActiveClass: 'bullet-active',
          clickable: true,
        }}
        effect="fade"
        autoplay={{ delay: 2000 }}
        loop={true}
        speed={1000}
        modules={[Pagination, Autoplay, EffectFade]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-[250px] md:h-[350px] lg:h-[500px] overflow-hidden rounded-lg">
              <img
                className="absolute top-0 left-0 object-cover object-center w-full h-full"
                src={image}
                alt="Suzy"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute z-10 w-full bottom-10">
        <div id="swiper-pagination"></div>
      </div>
    </div>
  );
};
export default GallerySwiper;
