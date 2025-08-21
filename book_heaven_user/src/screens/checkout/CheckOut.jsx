import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useRoute, useNavigation} from '@react-navigation/native';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import {placeOrder} from '../../redux/slices/orderSlice';
import {removeAllFromCart} from '../../redux/slices/cartSlice';
import BottomSheet from '../../utils/customComponents/customBottomSheet/BottomSheet';
import CustomModal from '../../utils/customModals/CustomModal';

const {width, height} = Dimensions.get('screen');

const paymentIcons = {
  JazzCash: require('../../assets/paymentMethodIcons/jazzcash-payment-method.png'),
  EasyPaisa: require('../../assets/paymentMethodIcons/easypaisa-payment-method.png'),
  CashOnDelivery: require('../../assets/paymentMethodIcons/cash-on-delivery-payment-method.png'),
};

const CheckOut = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {cartItems, userDetails, totalAmount, shippingFee} = route.params;
  const [selectedMethod, setSelectedMethod] = useState('JazzCash');
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const paymentAnim = new Animated.Value(0);

  const paymentMethods = [
    {
      id: 'JazzCash',
      name: 'JazzCash (+92-3090207411)',
      icon: paymentIcons.JazzCash,
    },
    {
      id: 'EasyPaisa',
      name: 'EasyPaisa (+92-3147718070)',
      icon: paymentIcons.EasyPaisa,
    },
    {
      id: 'CashOnDelivery',
      name: 'Cash on Delivery',
      icon: paymentIcons.CashOnDelivery,
    },
  ];

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      Toast.show({
        type: 'error',
        text1: 'Empty Cart',
        text2: 'Your cart is empty. Please add items before placing an order.',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Calculate totals
      const subtotal = cartItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      );
      const totalAmount = subtotal + Number(shippingFee);

      // Prepare order data
      const orderData = {
        items: orderItems,
        shippingAddress: userDetails.address,
        shippingFee: shippingFee.toString(),
        totalAmount: totalAmount,
        paymentMethod: selectedMethod,
      };

      // Dispatch the order
      const resultAction = await dispatch(placeOrder(orderData));

      if (placeOrder.fulfilled.match(resultAction)) {
        const placedOrder = resultAction.payload.order;

        // Clear cart after successful order
        await Promise.all(
          cartItems.map(item =>
            dispatch(removeAllFromCart({productId: item.productId})),
          ),
        );

        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Order Placed!',
          text2: 'Your order has been placed successfully.',
        });

        // Prepare receipt data
        const receiptData = {
          orderId: placedOrder._id,
          date: new Date(placedOrder.createdAt).toLocaleDateString(),
          time: new Date(placedOrder.createdAt).toLocaleTimeString(),
          items: cartItems.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.unitPrice,
          })),
          shippingAddress: placedOrder.shippingAddress,
          paymentSummary: {
            subtotal: subtotal,
            shippingFee: placedOrder.shippingFee,
            total: placedOrder.totalAmount,
            paymentMethod: placedOrder.paymentMethod,
          },
        };

        // Navigate to receipt screen
        navigation.navigate('Receipt', {receiptData});
      } else {
        throw new Error(
          resultAction.payload?.message || 'Failed to place order',
        );
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error.message || 'An error occurred while placing your order',
      });
      console.error('Order placement error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header
        logo={require('../../assets/splashScreen/splash-logo.png')}
        title="CheckOut"
        leftIcon={
          <FontAwesome5
            name="chevron-left"
            size={width * 0.06}
            color={theme.colors.white}
          />
        }
        onPressLeft={() => navigation.goBack()}

        rightIcon={
          <FontAwesome5
            name="bell"
            size={width * 0.06}
            color={theme.colors.white}
          />
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="truck"
              size={width * 0.06}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Delivery To</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <View style={styles.iconContainer}>
              <Feather
                name="map-pin"
                size={width * 0.06}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{userDetails.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="credit-card"
              size={width * 0.06}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowPaymentInfoModal(true)}>
              <Feather
                name="info"
                size={width * 0.06}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Animated.View style={styles.paymentMethods}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethod === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => {
                  Animated.timing(paymentAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setSelectedMethod(method.id);
                    paymentAnim.setValue(0);
                  });
                }}>
                <Image
                  source={method.icon}
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentMethodText}>{method.name}</Text>
                {selectedMethod === method.id && (
                  <Feather
                    name="check-circle"
                    size={width * 0.06}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="clipboard"
              size={width * 0.06}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setIsSheetVisible(true)}>
              <Feather
                name="info"
                size={width * 0.06}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>PKR {subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>PKR {shippingFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                PKR {subtotal + Number(shippingFee)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handlePlaceOrder}
          title={loading ? 'Placing Order...' : 'Place Order'}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          disabled={!cartItems.length || loading}
          width={width * 0.94}
        />
      </View>

      <CustomModal
        visible={showPaymentInfoModal}
        onClose={() => setShowPaymentInfoModal(false)}
        title="Payment Method Information"
        contentList={paymentMethods}
      />

      <BottomSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        cartItems={cartItems}
      />
    </SafeAreaView>
  );
};

export default CheckOut;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: height * 0.02,
    backgroundColor: theme.colors.white,
  },

  section: {
    marginBottom: height * 0.03,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
    gap: theme.gap(1),
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.dark,
  },

  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.015,
    backgroundColor: '#D9CBB5',
    borderRadius: theme.borderRadius.large,
  },

  iconContainer: {
    backgroundColor: '#C1A97B',
    padding: height * 0.01,
    borderRadius: theme.borderRadius.circle,
  },

  addressContainer: {
    flex: 1,
    marginLeft: width * 0.04,
  },

  addressText: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.dark,
  },

  paymentMethods: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },

  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.018,
    backgroundColor: '#F7EFD2',
    marginBottom: height * 0.012,
    borderRadius: theme.borderRadius.large,
  },

  selectedPaymentMethod: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#E9D8A6',
  },

  paymentIcon: {
    width: width * 0.08,
    height: height * 0.04,
  },

  paymentMethodText: {
    marginLeft: width * 0.04,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.dark,
    flex: 1,
  },

  checkIcon: {
    marginLeft: 'auto',
  },

  orderSummary: {
    backgroundColor: '#FFF2DC',
    borderRadius: theme.borderRadius.large,
    padding: height * 0.015,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.008,
  },

  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: '#7B6F5E',
  },

  summaryValue: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: '#40342D',
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.primary,
    marginVertical: height * 0.012,
  },

  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    color: '#40342D',
  },

  totalValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.primary,
  },

  footer: {
    padding: height * 0.01,
    borderTopColor: theme.colors.secondary,
    borderTopWidth: 1,
    alignItems: 'center',
    backgroundColor: '#FDF6EC',
  },
});
