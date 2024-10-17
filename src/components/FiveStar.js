import { faStar as faStarRegular, faStarHalfAlt as faStarHalfRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FiveStar = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const totalStars = hasHalfStar ? fullStars + 1 : fullStars;

    for (let i = 1; i <= fullStars; i++) {
        stars.push(<FontAwesomeIcon icon={faStarSolid} key={i} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
        stars.push(<FontAwesomeIcon icon={faStarHalfRegular} key={fullStars + 1} className="text-yellow-400" />);
    }

    for (let i = totalStars + 1; i <= 5; i++) {
        stars.push(<FontAwesomeIcon icon={faStarRegular} key={i} className="text-yellow-400" />);
    }

    return (
        <div>
            {stars}
        </div>
    );
};

export default FiveStar;
