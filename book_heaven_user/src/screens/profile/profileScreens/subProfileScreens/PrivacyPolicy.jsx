import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../../../styles/theme';
import Header from '../../../../utils/customComponents/customHeader/Header';
import {globalStyles} from '../../../../styles/globalStyles';

const {width, height} = Dimensions.get('window');

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        styles.primaryContainer,
        {
          backgroundColor: theme.colors.white,
        },
      ]}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../../../assets/splashScreen/splash-logo.png')}
          title="Privacy Policy"
          leftIcon={
            <FontAwesome5
              name="chevron-left"
              size={width * 0.06}
              color={theme.colors.white}
            />
          }
          onPressLeft={() => navigation.goBack()}
        />
      </View>

      <View style={styles.headerTextContainer}>
        <Text
          style={[
            styles.headerTitleText,
            {
              color: theme.colors.dark,
            },
          ]}>
          Privacy Policy
        </Text>
        <Text
          style={[
            styles.headerDescriptionText,
            {
              color: theme.colors.dark,
            },
          ]}>
          How we handle your data at Book Heaven.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text
          style={[
            styles.heading,
            {
              color: theme.colors.dark,
            },
          ]}>
          Introduction
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.dark,
            },
          ]}>
          Welcome to Book_Heaven! We value your privacy and are committed to
          protecting your data. This Privacy Policy explains how we collect,
          use, and safeguard your information when you use our platform to
          browse, purchase, and review books.
        </Text>

        <Text
          style={[
            styles.heading,
            {
              color: theme.colors.dark,
            },
          ]}>
          Information Collection
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.dark,
            },
          ]}>
          We collect the following types of information:
        </Text>
        <View style={styles.bulletContainer}>
          <Ionicons
            name="person-outline"
            size={width * 0.06}
            color={theme.colors.primary}
            style={styles.bulletIcon}
          />
          <Text
            style={[
              styles.bulletText,
              {
                color: theme.colors.dark,
              },
            ]}>
            Personal Information: such as your name, email address, and contact
            details.
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Ionicons
            name="cart-outline"
            size={width * 0.06}
            color={theme.colors.primary}
            style={styles.bulletIcon}
          />
          <Text
            style={[
              styles.bulletText,
              {
                color: theme.colors.dark,
              },
            ]}>
            Purchase History: details of books you have bought and order status.
          </Text>
        </View>

        <Text
          style={[
            styles.heading,
            {
              color: theme.colors.dark,
            },
          ]}>
          How We Use Your Information
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.dark,
            },
          ]}>
          We use your information to:
        </Text>
        <View style={styles.bulletContainer}>
          <Ionicons
            name="cube-outline"
            size={width * 0.06}
            color={theme.colors.primary}
            style={styles.bulletIcon}
          />
          <Text
            style={[
              styles.bulletText,
              {
                color: theme.colors.dark,
              },
            ]}>
            Process and deliver your book orders efficiently.
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Ionicons
            name="notifications-outline"
            size={width * 0.06}
            color={theme.colors.primary}
            style={styles.bulletIcon}
          />
          <Text
            style={[
              styles.bulletText,
              {
                color: theme.colors.dark,
              },
            ]}>
            Notify you about special offers, discounts, and order updates.
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Ionicons
            name="shield-outline"
            size={width * 0.06}
            color={theme.colors.primary}
            style={styles.bulletIcon}
          />
          <Text
            style={[
              styles.bulletText,
              {
                color: theme.colors.dark,
              },
            ]}>
            Ensure the security of your transactions and personal data.
          </Text>
        </View>

        <Text
          style={[
            styles.heading,
            {
              color: theme.colors.dark,
            },
          ]}>
          Contact Us
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.dark,
            },
          ]}>
          If you have any questions about our Privacy Policy, feel free to
          contact us at:
        </Text>
        <View style={styles.contactContainer}>
          <Ionicons
            name="mail-outline"
            size={width * 0.06}
            color={theme.colors.primary}
            style={styles.contactIcon}
          />
          <Text
            style={[
              styles.contactText,
              {
                color: theme.colors.dark,
              },
            ]}>
            support@bookheaven.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  headerTextContainer: {
    marginTop: height * 0.04,
    marginHorizontal: width * 0.04,
  },

  headerTitleText: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamilyBold,
  },

  headerDescriptionText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyMedium,
    top: height * 0.01,
  },

  contentContainer: {
    marginTop: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilySemiBold,
    marginVertical: height * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyRegular,
    marginBottom: height * 0.02,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
  },

  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  bulletIcon: {
    right: width * 0.05,
  },

  bulletText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyRegular,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
  },

  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    marginTop: height * 0.03,
  },

  contactIcon: {
    marginRight: width * 0.03,
  },

  contactText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyRegular,
    lineHeight: theme.typography.lineHeight.md,
  },
});
