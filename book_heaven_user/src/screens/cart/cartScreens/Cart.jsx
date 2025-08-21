import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
  Text,
  Animated,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';
import Header from '../../../utils/customComponents/customHeader/Header';
import CartCard from '../../../utils/customComponents/customCards/cartCard/CartCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAllCartItems,
  addToCart,
  removeFromCart,
  removeAllFromCart,
  updateCartItem,
} from '../../../redux/slices/cartSlice';
import Loader from '../../../utils/customComponents/customLoader/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../utils/customComponents/customButton/Button';
import {useNavigation} from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const {width, height} = Dimensions.get('screen');

const Cart = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {cartItems, loading} = useSelector(state => state.cart);
  const [removingAll, setRemovingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const bounceAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    dispatch(getAllCartItems());
  }, []);

  useEffect(() => {
    if (!loading && cartItems?.length === 0 && removingAll) {
      setRemovingAll(false);
    }
    if (!loading && cartItems?.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    }
  }, [loading, cartItems]);

  const handleAddToCart = async bookId => {
    dispatch(updateCartItem({bookId, quantity: 1}));
    await dispatch(addToCart({bookId}));
    dispatch(getAllCartItems());
  };

  const handleRemoveFromCart = async bookId => {
    const item = cartItems.find(item => item.bookId._id === bookId);
    if (item.quantity > 1) {
      dispatch(updateCartItem({bookId, quantity: -1}));
    }
    await dispatch(removeFromCart({bookId}));
    dispatch(getAllCartItems());
  };

  const handleCompleteRemove = async bookId => {
    setRemovingAll(true);
    await dispatch(removeAllFromCart({bookId}));
    dispatch(getAllCartItems());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getAllCartItems());
    setRefreshing(false);
  };

  const shippingFee = 50;

  const handleNavigateCheckOut = () => {
    if (!cartItems.length) return;

    const formattedItems = cartItems.map(item => ({
      productId: item.bookId._id, // Changed to use bookId._id
      title: item.bookId.title,
      quantity: item.quantity,
      unitPrice: item.bookId.price, // Changed to use bookId.price
    }));

    const userDetails = {
      address: cartItems[0].userId.address,
      phone: cartItems[0].userId.phone,
      userName: cartItems[0].userId.userName,
    };

    const itemTotal = cartItems.reduce(
      (sum, item) => sum + item.bookId.price * item.quantity,
      0,
    );

    const shippingFee = 50;
    const totalAmount = itemTotal + shippingFee;

    navigation.navigate('CheckOut', {
      cartItems: formattedItems,
      userDetails,
      totalAmount,
      shippingFee,
    });
  };

  const itemTotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + (item?.bookId?.price || 0) * item.quantity,
        0,
      )
    : 0;

  const totalAmount = itemTotal + shippingFee;

  return (
    <SafeAreaView
      style={[globalStyles.container, {backgroundColor: theme.colors.white}]}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../../assets/splashScreen/splash-logo.png')}
          title="Cart"
          leftIcon={
            <FontAwesome5
              name="chevron-left"
              size={width * 0.06}
              color={theme.colors.white}
            />
          }
          rightIcon={
            <FontAwesome5
              name="bell"
              size={width * 0.06}
              color={theme.colors.white}
            />
          }
        />
      </View>

      {loading && !removingAll ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : cartItems?.length > 0 ? (
        <FlatList
          data={cartItems}
          keyExtractor={item => item._id.toString()}
          renderItem={({item}) => (
            <CartCard
              title={item.bookId.title}
              price={item.price}
              imageUrl={item.bookId.bookImage}
              onRemove={() => handleCompleteRemove(item.bookId._id)}
              onIncrease={() => handleAddToCart(item.bookId._id)}
              onDecrease={() => handleRemoveFromCart(item.bookId._id)}
              quantity={item.quantity}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }>
          <Animated.View
            style={[
              {opacity: fadeAnim, transform: [{translateY: bounceAnim}]},
            ]}>
            <View style={{alignSelf: 'center'}}>
              <Ionicons
                name="cart-outline"
                size={width * 0.28}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.emptyText}>Cart Is Empty</Text>
          </Animated.View>
        </ScrollView>
      )}
      <View style={styles.fixedBottomContainer}>
        <View style={styles.bottomContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.titleText}>Price</Text>
            <Text style={styles.amountText}>${itemTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.shippingFeeContainer}>
            <Text style={styles.titleText}>Shipping Fee</Text>
            <Text style={styles.amountText}>${shippingFee.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <Button
            title="Checkout"
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            onPress={handleNavigateCheckOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
    marginTop: height * 0.02,
  },

  listContainer: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
  },

  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  shippingFeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  titleText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
  },

  amountText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.black,
  },
});
