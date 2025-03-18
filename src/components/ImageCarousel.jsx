import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { server } from "../constants/config";

const ImageCarousel = () => {
  const [images, setImages] = useState([]);

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  // Fetch images from API
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${server}api/v1/misc/get-images`);
      const imageUrls = response.data.data.map((image) => image.image.url);
      setImages(imageUrls);
    } catch (error) {
      toast.error("Failed to fetch images", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="w-full rounded-lg cursor-not-allowed overflow-hidden mx-auto mb-1">
      <Slider {...settings}>
        {images.length > 0 ? (
          images.map((url, index) => (
            <div key={index}>
              <img
                src={url}
                alt={`Slide ${index + 1}`}
                className="w-full h-full lg:h-64 object-cover rounded-lg"
              />
            </div>
          ))
        ) : (
          <></>
        )}
      </Slider>
    </div>
  );
};

export default ImageCarousel;
