const NewsCarousel = ({ newsItems }) => {
  return (
    <div id="news-carousel" className="carousel-container">
      {newsItems.length > 0 ? (
        newsItems.map(({ src, title }, index) => (
          <div key={index} className="carousel-slide">
            <img src={src} alt={`Slide ${index}`} className="carousel-image" />
            <p className="carousel-caption">{title}</p>
          </div>
        ))
      ) : (
        <p>No news available</p>
      )}
    </div>
  );
};

export default NewsCarousel;
