import React from 'react';
import {View, Image, StyleSheet, Dimensions, Text} from 'react-native';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const AuthHeader = ({logo, title}) => {
  return (
    <View style={styles.headerContainer}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.authText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: height * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: width * 0.2,
    height: height * 0.08,
    marginRight: width * 0.066,
  },

  authText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamilyBold,
    marginLeft: -width * 0.064,
  },
});

export default AuthHeader;
