import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import BookCard from '../../../utils/customComponents/customCards/bookCard/BookCard';
import InputField from '../../../utils/customComponents/customInputField/InputField';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loader from '../../../utils/customComponents/customLoader/Loader';

const {width, height} = Dimensions.get('screen');

const BookCategory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {categoryId, books} = route.params || {};

  // 🛠 Clean the category name for display
  const cleanCategoryName = (() => {
    if (!categoryId) return 'Unknown';
    if (Array.isArray(categoryId)) {
      return categoryId[0]
        ?.replace(/[\[\]"]/g, '')
        .split(',')[0]
        .trim();
    }
    return String(categoryId)
      .replace(/[\[\]"]/g, '')
      .split(',')[0]
      .trim();
  })();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books || []);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const noBookFadeAnim = useRef(new Animated.Value(0)).current;
  const noBookBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      if (!books || books.length === 0) {
        startNoBookAnimation();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books
        .map(row =>
          row.filter(book => book.title.toLowerCase().includes(query)),
        )
        .filter(row => row.length > 0);
      setFilteredBooks(filtered);

      if (filtered.length === 0) {
        startNoBookAnimation();
      }
    }
  }, [searchQuery, books]);

  const startNoBookAnimation = () => {
    Animated.parallel([
      Animated.timing(noBookFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(noBookBounceAnim, {
            toValue: 10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(noBookBounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  };

  const handleBookPress = book => {
    navigation.navigate('Book_Detail', {book});
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <Header
            logo={require('../../../assets/splashScreen/splash-logo.png')}
            title={cleanCategoryName}
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
            onPressLeft={() => navigation.goBack()}
          />
        </View>

        <Animated.View
          style={[
            styles.searchWrapper,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          <InputField
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <FontAwesome5
                name="search"
                size={width * 0.04}
                color={theme.colors.primary}
              />
            }
          />
        </Animated.View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            {filteredBooks.length > 0 ? (
              filteredBooks.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((book, index) => (
                    <View key={book._id || index} style={styles.cardWrapper}>
                      <BookCard
                        title={book.title}
                        imageUrl={book.bookImage}
                        price={book.price}
                        cardStyle={styles.card}
                        titleStyle={styles.cardTitle}
                        onPress={() => handleBookPress(book)}
                      />
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Animated.View
                style={[
                  styles.noBookView,
                  {
                    opacity: noBookFadeAnim,
                    transform: [{translateY: noBookBounceAnim}],
                  },
                ]}>
                <FontAwesome6
                  name={'book-open'}
                  size={width * 0.28}
                  color={theme.colors.primary}
                />
                <Text style={styles.noBookTitle}>No Books Found!</Text>
              </Animated.View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BookCategory;

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  headerWrapper: {
    marginBottom: height * 0.015,
    paddingBottom: height * 0.01,
  },
  searchWrapper: {
    marginHorizontal: width * 0.024,
    marginBottom: height * 0.015,
  },
  scrollContainer: {
    paddingHorizontal: width * 0.045,
    paddingBottom: height * 0.1,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
    gap: width * 0.04,
  },
  cardWrapper: {flex: 1},
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamilySemiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  noBookView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(2),
  },
  noBookTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.primary,
  },
});
