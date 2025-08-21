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
} from 'react-native';
import {globalStyles} from '../../../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import Header from '../../../../utils/customComponents/customHeader/Header';
import {theme} from '../../../../styles/theme';
import FavoriteCard from '../../../../utils/customComponents/customCards/favoriteCard/FavoriteCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAllFavorites,
  removeFromFavorite,
} from '../../../../redux/slices/favoriteSlice';
import Loader from '../../../../utils/customComponents/customLoader/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('screen');

const Favorites = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const bounceAnim = useState(new Animated.Value(0))[0];

  const user = useSelector(state => state.auth.user);
  const {favorites} = useSelector(state => state.favorite);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getAllFavorites()).finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (!loading && favorites?.length === 0) {
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
  }, [loading, favorites]);

  const userFavorites = favorites?.filter(fav => fav.userId._id === user.id);

  const handleRemoveFavorite = async bookId => {
    setRemovingId(bookId);
    await dispatch(removeFromFavorite({bookId}));
    setRemovingId(null);
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
          title="My Favorites"
          leftIcon={require('../../../../assets/icons/arrow-left.png')}
          onPressLeft={() => navigation.goBack()}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : userFavorites?.length > 0 ? (
        <FlatList
          data={userFavorites}
          keyExtractor={item => item._id.toString()}
          renderItem={({item}) => (
            <FavoriteCard
              image={item.bookId.bookImage}
              title={item.bookId.title}
              price={`$${item.bookId.price}`}
              icon={require('../../../../assets/icons/heart-filled.png')}
              onPress={() => handleRemoveFavorite(item.bookId._id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
            name="heart-outline"
            size={80}
            color={theme.colors.primary}
          />
          <Text style={styles.emptyText}>No Favorites Found</Text>
        </Animated.View>
      )}

      {removingId && (
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.02,
    paddingBottom: height * 0.02,
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

  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
