import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {globalStyles} from '../../../../styles/globalStyles';
import {theme} from '../../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const OrderCard = ({bookImage, title, orderStatus, itemsCount = 0}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = () => {
    switch (orderStatus) {
      case 'DELIVERED':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View style={{opacity: fadeAnim, transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[globalStyles.container, styles.cardContainer]}
        activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image source={{uri: bookImage}} style={styles.image} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                {backgroundColor: getStatusColor()},
              ]}
            />
            <Text style={[styles.status, {color: getStatusColor()}]}>
              {orderStatus.toLowerCase()} - {itemsCount}{' '}
              {itemsCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: height * 0.02,
    marginVertical: height * 0.01,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: height * 0.02,
  },

  imageContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: width * 0.04,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  textContainer: {
    flex: 1,
    flexDirection: 'column',
  },

  title: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.dark,
    marginBottom: height * 0.001,
  },

  statusIndicator: {
    width: width * 0.02,
    height: width * 0.02,
    borderRadius: width * 0.01,
    marginRight: width * 0.02,
  },

  status: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilySemiBold,
    textTransform: 'capitalize',
  },
});
