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
import {useDispatch, useSelector} from 'react-redux';
import {getLibraryBooks} from '../../../../redux/slices/librarySlice';
import Loader from '../../../../utils/customComponents/customLoader/Loader';
import LibraryCard from '../../../../utils/customComponents/customCards/libraryCard/LibraryCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InputField from '../../../../utils/customComponents/customInputField/InputField';

const {width, height} = Dimensions.get('screen');

const Library = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const bounceAnim = useState(new Animated.Value(0))[0];

  const {library} = useSelector(state => state.library);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getLibraryBooks()).finally(() => setLoading(false));
  }, [dispatch]);

  const filteredBooks = library?.filter(item => {
    const title = item.bookId?.title?.toLowerCase() || '';
    const author = item.bookId?.author?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return title.includes(query) || author.includes(query);
  });

  useEffect(() => {
    if (!loading && filteredBooks?.length === 0) {
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
  }, [loading, filteredBooks]);

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
          title="My Library"
          leftIcon={require('../../../../assets/icons/arrow-left.png')}
          onPressLeft={() => navigation.goBack()}
        />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="search"
            size={width * 0.05}
            color={theme.colors.primary}
          />
        </View>
        <InputField
          placeholder="Search by Title or Author"
          placeholderTextColor={theme.colors.gray}
          backgroundColor={theme.colors.lightGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.booksContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : filteredBooks?.length > 0 ? (
          <FlatList
            data={filteredBooks}
            keyExtractor={item => item._id.toString()}
            renderItem={({item}) => (
              <LibraryCard
                bookImage={item.bookId.bookImage}
                title={item.bookId.title}
                author={item.bookId.author}
                bookFile={item.bookFile}
              />
            )}
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
              name="book-outline"
              size={80}
              color={theme.colors.primary}
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No Books found' : 'Library Is Empty!'}
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Library;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  booksContainer: {
    flex: 1,
    justifyContent: 'center',
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
    marginTop: height * 0.02,
  },
});
