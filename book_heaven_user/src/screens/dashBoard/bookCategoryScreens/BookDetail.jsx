import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';
import Header from '../../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart} from '../../../redux/slices/cartSlice';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const {width, height} = Dimensions.get('screen');

const BookDetail = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {book} = useRoute().params;
  const userDetails = useSelector(state => state.user.user);
  const shippingFee = 50; // You can set your shipping fee here or fetch it from somewhere

  const handleAddToCart = async () => {
    try {
      const resultAction = await dispatch(addToCart({bookId: book._id}));
      if (addToCart.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Added to cart',
          text2: `${book.title} has been added successfully 👌`,
        });
      } else {
        throw new Error(resultAction.payload || 'Something went wrong');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  const handleBuyNow = () => {
    // Create a properly formatted cart item for direct checkout
    const cartItem = {
      productId: book._id, // Changed from 'book' to 'productId' to match your order slice
      title: book.title,
      description: book.description,
      unitPrice: book.price,
      quantity: 1,
      bookImage: book.bookImage,
    };

    // Calculate totals
    const subtotal = book.price;
    const totalAmount = subtotal + shippingFee;

    navigation.navigate('CheckOut', {
      cartItems: [cartItem], // Pass as array with single item
      userDetails: {
        address: userDetails.address,
        phone: userDetails.phone,
        userName: userDetails.userName,
      },
      totalAmount,
      shippingFee,
      subtotal, // Pass subtotal explicitly if needed
    });
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      <View style={styles.imageContainer}>
        <Image source={{uri: book.bookImage}} style={styles.image} />
      </View>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../../assets/splashScreen/splash-logo.png')}
          title="BookHeaven"
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

      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.description}>{book.description}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Author</Text>
            <Text style={styles.infoValue}>{book.author}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>
              {JSON.parse(book.genre[0]).join(', ')}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Publication Year</Text>
            <Text style={styles.infoValue}>{book.publicationYear}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Publisher</Text>
            <Text style={styles.infoValue}>{book.publisher}</Text>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.price}>PKR {book.price}</Text>

            <View style={styles.btnContainer}>
              <TouchableOpacity
                onPress={handleAddToCart}
                style={styles.iconContainer}>
                <Feather
                  name="shopping-bag"
                  size={width * 0.06}
                  color={theme.colors.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBuyNow} // 👈 Updated to use handleBuyNow
                style={styles.iconContainer}>
                <Feather
                  name="credit-card"
                  size={width * 0.06}
                  color={theme.colors.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default BookDetail;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  imageContainer: {
    height: height * 0.5,
    width: '100%',
  },

  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.04,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    marginTop: -height * 0.02,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.primary,
    marginBottom: height * 0.01,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyRegular,
    color: theme.colors.tertiary,
    lineHeight: theme.typography.lineHeight.md,
    marginBottom: height * 0.01,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.012,
    marginBottom: height * 0.01,
  },

  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyMedium,
  },

  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilyMedium,
  },

  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.034,
    paddingBottom: height * 0.02,
    justifyContent: 'space-between',
  },

  price: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.primary,
    top: height * 0.006,
  },

  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },

  iconContainer: {
    backgroundColor: theme.colors.primary,
    padding: height * 0.014,
    borderRadius: theme.borderRadius.circle,
  },
});
