import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { global } from '../../styles/globals';
import Svg, { Circle, G } from 'react-native-svg';
import WaterIcon from 'react-native-vector-icons/Ionicons';
import OpenSvg from 'react-native-vector-icons/Ionicons';
import { useContext, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { styles } from './PlantItemCardOverlayStyles';
import { UserContext } from '../../context/UserContext';

type Props = NativeStackScreenProps<any> & {
  plantId: string;
  latin: string;
  plantCommon: string;
  plantCustomName: string;
  plantWatering: any;
  plantImage: ImageSourcePropType & string;
  plantDescription: string;
  plantWaterPercent: number;
  isVerticalScroll: boolean;
  setIsVerticalScroll: (isVerticalScroll: boolean) => void;
};

export const PlantImage = ({
  imageSrc,
  small = false,
}: {
  imageSrc: string;
  small?: boolean;
}) => {
  return (
    <View
      style={
        !small
          ? styles.plantImage__container
          : styles.plantImage__container__small
      }
    >
      <View style={styles.plantImage__topLeftShadow} />
      <View style={styles.plantImage__bottomRightShadow} />
      <Image
        source={{ uri: 'data:image/png;base64,' + imageSrc }}
        style={styles.plantImage__image}
      />
    </View>
  );
};

const PlantInformation = ({
  plantCustomName,
  plantCommon,
}: Pick<Props, 'plantCustomName' | 'plantCommon'>) => {
  return (
    <View style={styles.plantInformation__container}>
      <Text style={styles.plantInformation__plantName}>{plantCustomName}</Text>
      <Text style={styles.plantInformation__plantDescription}>
        {plantCommon}
      </Text>
    </View>
  );
};

const WateringInformation = ({
  plantWaterPercent,
}: {
  plantWaterPercent: number;
}) => {
  const size = 36;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.plantWatering__container}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={center}>
          <Circle
            stroke={global.color.secondary.color}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />

          <Circle
            stroke={global.color.primary.backgroundColor}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference - (circumference * plantWaterPercent) / 100
            }
          />
        </G>
      </Svg>
      <WaterIcon
        name="water"
        size={21}
        color={global.color.primary.backgroundColor}
        style={{
          position: 'absolute',
          top: center - 12,
          left: center + 2,
        }}
      />
    </View>
  );
};

const ExpandedCardIndicator = ({ expanded }: { expanded: boolean }) => {
  return (
    <View style={styles.expandedCard__container}>
      <Svg width={30} height={20}>
        <G rotation="-90" origin={10}>
          <Circle
            fill={global.color['button-dark'].color}
            cx={10}
            cy={10}
            r={4}
          />
          <Circle fill={global.color.secondary.color} cx={10} cy={20} r={4} />
        </G>
      </Svg>
    </View>
  );
};

export const PlantItemCardOverlay = ({
  plantId,
  latin,
  plantCustomName,
  plantCommon,
  plantWatering,
  plantImage,
  plantDescription,
  plantWaterPercent,
  navigation,
  route,
  isVerticalScroll,
  setIsVerticalScroll,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const pan = useRef(new Animated.Value(0)).current;

  const { user } = useContext(UserContext);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (isVerticalScroll) {
          return;
        }
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const screenWidth = Dimensions.get('window').width;
        const threshold = 0.2 * screenWidth;

        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setIsVerticalScroll(false);
      },
    })
  ).current;

  const overlayStyles = {
    transform: [{ translateX: pan }],
  };

  return (
    <Animated.View
      style={[styles.overlay_container, overlayStyles]}
      {...panResponder.panHandlers}
    >
      <PlantImage imageSrc={plantImage} />
      <PlantInformation
        plantCustomName={plantCustomName}
        plantCommon={plantCommon}
      />
      <WateringInformation plantWaterPercent={plantWaterPercent} />
      <TouchableOpacity
        style={styles.showPlantButton__container}
        onPress={() =>
          navigation.navigate('PlantViewScreen', {
            _id: plantId,
            latin: latin,
            customName: plantCustomName,
            description: plantDescription,
            watering: plantWatering,
            image: plantImage,
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.showPlantButton__button}>
          <OpenSvg
            name={'md-open-outline'}
            size={25}
            color={global.color.primary.backgroundColor}
          />
        </View>
      </TouchableOpacity>

      <ExpandedCardIndicator expanded={expanded} />
    </Animated.View>
  );
};
