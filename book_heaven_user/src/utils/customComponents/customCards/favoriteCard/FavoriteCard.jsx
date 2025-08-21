import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {theme} from '../../../../styles/theme';
import {globalStyles} from '../../../../styles/globalStyles';

const {width, height} = Dimensions.get('screen');

const FavoriteCard = ({image, title, price, icon, onPress}) => {
  return (
    <SafeAreaView
      style={[globalStyles.container, globalStyles.card, styles.cardContainer]}>
      <View style={styles.imgContainer}>
        <Image source={{uri: image}} style={styles.img} />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, globalStyles.cardTitle]}>{title}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, globalStyles.cardContent]}>{price}</Text>
        </View>
      </View>
      <View style={styles.leftIconContainer}>
        <TouchableOpacity onPress={onPress}>
          <Image source={icon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FavoriteCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: height * 0.024,
    borderRadius: theme.borderRadius.medium,
    marginVertical: height * 0.012,
    gap: theme.gap(2),
  },

  imgContainer: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
  },

  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  leftIconContainer: {
    alignSelf: 'center',
  },

  icon: {
    width: width * 0.06,
    height: width * 0.06,
  },
});
