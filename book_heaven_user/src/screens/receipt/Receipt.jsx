import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {globalStyles} from '../../styles/globalStyles';
import {theme} from '../../styles/theme';
import Header from '../../utils/customComponents/customHeader/Header';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const {width, height} = Dimensions.get('screen');

const Receipt = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {receiptData} = route.params;

  console.log('Receipt Data:', receiptData);

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../assets/splashScreen/splash-logo.png')}
          title={'CoffeeSpot'}
          leftIcon={
            <FontAwesome5
              name="chevron-left"
              size={width * 0.06}
              color={theme.colors.white}
            />
          }
          onPressLeft={() => navigation.replace('Main')}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderContainer}>
          <FontAwesome5
            name="receipt"
            size={width * 0.06}
            color={theme.colors.tertiary}
          />
          <Text style={styles.headerTitle}>Your Order Receipt</Text>
        </View>

        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeaderContainer}>
            <Text style={styles.recieptLabel}>Thank You!</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* Order Section */}
            <View style={styles.orderSection}>
              <View style={styles.orderRow}>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.value}>
                  V{receiptData.orderId.substring(18, 24).toUpperCase()}
                </Text>
              </View>

              <View style={styles.orderRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{receiptData.date}</Text>
              </View>

              <View style={styles.orderRow}>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.value}>{receiptData.time}</Text>
              </View>
            </View>

            {/* Items Section */}
            <View style={styles.itemsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Items</Text>
              </View>

              {receiptData?.items?.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Product</Text>
                    <Text style={styles.value}>{item.name}</Text>
                  </View>

                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Quantity</Text>
                    <Text style={styles.value}>{item.quantity}</Text>
                  </View>

                  <View style={styles.itemRow}>
                    <Text style={styles.label}>Item Price</Text>
                    <Text style={styles.value}>PKR {item.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <Text style={styles.recieptLabel}>Payment Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.value}>
                  PKR {receiptData?.paymentSummary?.total}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.label}>Payment Method</Text>
                <Text style={styles.value}>
                  {receiptData?.paymentSummary?.paymentMethod}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Receipt;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.1,
  },

  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: height * 0.06,
    gap: theme.gap(2),
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.tertiary,
  },

  receiptContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    margin: height * 0.014,
    marginTop: height * 0.09,
  },

  recieptLabel: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.tertiary,
    textAlign: 'center',
  },

  // Order Section Styles
  orderSection: {
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderBottomColor: theme.colors.dark,
    margin: height * 0.014,
  },

  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: height * 0.004,
  },

  // Items Section Styles
  itemsSection: {
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderBottomColor: theme.colors.dark,
    margin: height * 0.014,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.tertiary,
    textAlign: 'center',
  },

  itemContainer: {
    width: '100%',
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: height * 0.004,
  },

  // Summary Section Styles
  summarySection: {
    margin: height * 0.014,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: height * 0.004,
  },

  // Common Styles
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.primary,
  },

  value: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.tertiary,
  },
});
