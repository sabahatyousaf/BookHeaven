import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  Text,
  Dimensions,
  Animated,
  SectionList,
} from 'react-native';
import {globalStyles} from '../../../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import Header from '../../../../utils/customComponents/customHeader/Header';
import {theme} from '../../../../styles/theme';
import {useDispatch, useSelector} from 'react-redux';
import {getAllOrders} from '../../../../redux/slices/orderSlice';
import Loader from '../../../../utils/customComponents/customLoader/Loader';
import OrderCard from '../../../../utils/customComponents/customCards/orderCard/OrderCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import InputField from '../../../../utils/customComponents/customInputField/InputField';

const {width, height} = Dimensions.get('screen');

const Orders = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const bounceAnim = useState(new Animated.Value(0))[0];

  const user = useSelector(state => state.auth.user);
  const {orders} = useSelector(state => state.order);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getAllOrders()).finally(() => setLoading(false));
  }, [dispatch]);

  const userOrders =
    orders?.filter(order => order.orderId?.userId?._id === user.id) || [];

  const filteredOrders = userOrders.filter(order => {
    const orderData = order.orderId || order;
    const itemTitle = orderData.items[0]?.bookId?.title?.toLowerCase() || '';
    const status = orderData.status?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return itemTitle.includes(query) || status.includes(query);
  });

  const groupOrdersByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sections = [
      {title: 'Today', data: []},
      {title: 'Yesterday', data: []},
      {title: 'Older', data: []},
    ];

    // Sort orders by date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.orderId?.placedAt || a.placedAt || a.createdAt);
      const dateB = new Date(b.orderId?.placedAt || b.placedAt || b.createdAt);
      return dateB - dateA; // Descending order (newest first)
    });

    sortedOrders.forEach(order => {
      const orderData = order.orderId || order;
      const orderDate = new Date(orderData.placedAt || orderData.createdAt);
      const formattedDate = orderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      orderDate.setHours(0, 0, 0, 0);

      if (orderDate.getTime() === today.getTime()) {
        sections[0].data.push({...order, formattedDate});
      } else if (orderDate.getTime() === yesterday.getTime()) {
        sections[1].data.push({...order, formattedDate});
      } else {
        sections[2].data.push({...order, formattedDate});
      }
    });

    return sections.filter(section => section.data.length > 0);
  };

  const renderSectionHeader = ({section}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {section.title} - {section.data[0]?.formattedDate}
      </Text>
    </View>
  );

  const dateSections = groupOrdersByDate();

  useEffect(() => {
    if (!loading && filteredOrders.length === 0) {
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
    } else {
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [loading, filteredOrders]);

  const renderItem = ({item}) => {
    const order = item.orderId || item;
    return (
      <OrderCard
        bookImage={order.items[0]?.bookId?.bookImage}
        title={order.items[0]?.bookId?.title}
        orderStatus={order.status}
        itemsCount={order.items.length}
      />
    );
  };

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
            title="My Orders"
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

      <View style={styles.searchContainer}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="search"
            size={width * 0.05}
            color={theme.colors.primary}
            style={styles.searchIcon}
          />
        </View>
        <InputField
          placeholder="Search by Title or Status"
          placeholderTextColor={theme.colors.gray}
          backgroundColor={theme.colors.lightGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.ordersContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : dateSections.length > 0 ? (
          <SectionList
            sections={dateSections}
            keyExtractor={item => item._id.toString()}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{translateY: bounceAnim}],
              },
            ]}>
            <Ionicons
              name="cart-outline"
              size={80}
              color={theme.colors.primary}
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No orders found' : 'No Orders Found!'}
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  ordersContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    paddingHorizontal: width * 0.04,
  },

  iconContainer: {
    position: 'absolute',
    left: width * 0.06,
    transform: [{translateY: height * 0.038}],
    zIndex: 8,
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
  },

  sectionHeader: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
    marginTop: height * 0.02,
    borderRadius: theme.borderRadius.medium,
  },

  sectionHeaderText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.white,
  },
});
