import { Carousel } from "flowbite-react";

const NewsCarousel = ({ newsItems }) => {
  return (
    <div id="news" className="news-carousel">
      <Carousel slideInterval={3000} indicators={true}>
        {newsItems.map(({ src, title }, index) => (
          <div key={index} className="carousel-slide">
            <img src={src} alt={`slide_${index + 1}`} className="carousel-image" />
            <p className="carousel-caption">{title}</p>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default NewsCarousel;
