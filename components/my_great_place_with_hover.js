import { greatPlaceStyle, greatPlaceStyleHover } from './my_great_place_with_hover_styles.js';

const MyGreatPlaceWithHover = ({ $hover, text }) => {

  const style = $hover ? greatPlaceStyleHover : greatPlaceStyle;

  return (
    <div style={style}>
      {text}
    </div>
  );
}

export default MyGreatPlaceWithHover
