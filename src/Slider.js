import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Images directly inside src folder
import hospitalImg1 from './hospital.webp';
import hospitalImg2 from './hospital2.webp';
import hospitalImg3 from './hospital3.webp';

// NOTE: this file is not imported anywhere in App.js (the login screen uses
// its own built-in LoginSlider component instead), so it has no effect on the
// running app. It's fixed here only for completeness — the original file
// referenced hospitalImg / hospital2Img / hospital3Img, which were never
// defined (only hospitalImg1/2/3 were imported), so this component would
// have crashed immediately if it were ever rendered.
const Slider = () => {

  const slidesData = [
    {
      id: 1,
      image: hospitalImg1,
      title: 'Choithram Hospital Main Building',
    },
    {
      id: 2,
      image: hospitalImg2,
      title: 'Choithram Hospital & Research Centre',
    },
    {
      id: 3,
      image: hospitalImg3,
      title: 'Advanced Healthcare Services',
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '20px auto',
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >

        {slidesData.map((slide) => (
          <SwiperSlide key={slide.id}>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '380px',
              }}
            >

              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Dark overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '30px 25px 20px',
                  background:
                    'linear-gradient(transparent, rgba(0,0,0,0.7))',
                }}
              >

                <h2
                  style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                  }}
                >
                  {slide.title}
                </h2>

              </div>

            </div>

          </SwiperSlide>
        ))}

      </Swiper>
    </div>
  );
};

export default Slider;
