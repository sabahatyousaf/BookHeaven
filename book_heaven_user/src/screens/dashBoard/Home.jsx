import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../../redux/slices/userSlice';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getAllBooks } from '../../redux/slices/bookSlice';
import BookCard from '../../utils/customComponents/customCards/bookCard/BookCard';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/customComponents/customLoader/Loader';
import { getAllReviews } from '../../redux/slices/reviewSlice';
import ReviewCard from '../../utils/customComponents/customReview/Review';

const { width, height } = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);
  const books = useSelector(state => state.book.books);
  const reviews = useSelector(state => state.review.reviews);

  console.log('Books Array length:', books?.length || 0);

  // ──────────────────────────────────────────────
  //  Robust genre parser (same as in Categories screen)
  // ──────────────────────────────────────────────
  const parseGenres = (genreField) => {
    if (!genreField) return [];

    let raw = genreField;

    // Handle common messed-up formats from backend
    if (Array.isArray(genreField)) {
      if (typeof genreField[0] === 'string') {
        raw = genreField[0];
      } else if (Array.isArray(genreField[0])) {
        raw = genreField.flat();
      }
    }

    try {
      let cleaned = typeof raw === 'string' ? raw : JSON.stringify(raw);
      cleaned = cleaned
        .replace(/[\[\]\"']/g, '')
        .replace(/\s*,\s*/g, ',')
        .replace(/,,/g, ','); // clean double commas

      return cleaned
        .split(',')
        .map(g => g.trim())
        .filter(g => g.length > 0);
    } catch (e) {
      console.warn('Failed to parse genre:', genreField, e);
      return [];
    }
  };

  const chunkArray = (arr, size) => {
    if (!arr || !Array.isArray(arr)) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
      arr.slice(index * size, index * size + size)
    );
  };

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
      dispatch(getAllBooks());
      dispatch(getAllReviews());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const formattedReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return reviews.map(review => ({
      text: review?.comment || '',
      name: review?.user?.userName || userProfile?.userName || 'Anonymous',
      animation: require('../../assets/animations/customer-reviews.json'),
    }));
  }, [reviews, userProfile?.userName]);

  // Get one representative book per unique genre
  const featuredBooksByCategory = useMemo(() => {
    if (!Array.isArray(books) || books.length === 0) return [];

    const categoryMap = {};
    const usedBookIds = new Set();

    books.forEach(book => {
      const genres = parseGenres(book.genre);

      genres.forEach(genre => {
        if (genre && !categoryMap[genre] && !usedBookIds.has(book._id)) {
          categoryMap[genre] = book;
          usedBookIds.add(book._id);
        }
      });
    });

    return Object.entries(categoryMap).map(([category, book]) => ({
      category,
      book,
    }));
  }, [books]);

  const handleCategoryPress = (genreName) => {
    if (!genreName) return;

    const genreBooks = books.filter(book =>
      parseGenres(book.genre).includes(genreName)
    );

    navigation.navigate('Category_Books', {
      categoryName: genreName,
      categoryId: genreName.toLowerCase().replace(/\s+/g, '-'),
      books: genreBooks, // flat array
    });
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={globalStyles.container}
    >
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../assets/splashScreen/splash-logo.png')}
          title="Home"
          leftIcon={
            <FontAwesome5
              name="search"
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

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <View style={styles.greetingLeftContainer}>
              <Text style={styles.greetingTitle}>{greeting}!</Text>
              <Text style={styles.greetingDescription}>
                Let's get you a book!{' '}
                <Feather name="book" size={width * 0.044} color={theme.colors.white} />
              </Text>
            </View>
            <View style={styles.greetingRightContainer}>
              <TouchableOpacity activeOpacity={0.8}>
                <Image
                  source={
                    userProfile?.profilePicture
                      ? { uri: userProfile.profilePicture }
                      : require('../../assets/placeholders/default-avatar.png')
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Books by Category */}
          <View style={styles.booksSection}>
            <Text style={styles.sectionTitle}>Explore by Category</Text>

            {featuredBooksByCategory.length === 0 ? (
              <Text style={styles.noDataText}>No books available yet</Text>
            ) : (
              chunkArray(featuredBooksByCategory, 2).map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={styles.categoryRow}
                >
                  {row.map(({ category, book }) => (
                    <View key={category} style={styles.categoryItem}>
                      <Text style={styles.categoryLabel}>{category}</Text>
                      <BookCard
                        title={book.title}
                        imageUrl={book.bookImage}
                        onPress={() => handleCategoryPress(category)}
                        cardStyle={styles.elevatedCard}
                        titleStyle={styles.cardTitle}
                      />
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>

          {/* Customer Reviews */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Customer Reviews</Text>
            <Text style={styles.reviewDescription}>
              We always appreciate feedback from our customers, both excellent and constructive.
            </Text>
            {formattedReviews.length > 0 ? (
              <ReviewCard reviews={formattedReviews} />
            ) : (
              <Text style={styles.noDataText}>No reviews yet</Text>
            )}
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 8,
  },
  greetingContainer: {
    marginTop: height * 0.03,
    paddingHorizontal: width * 0.06,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.white,
  },
  greetingDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.secondary,
    marginTop: 4,
  },
  profileImage: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: width * 0.08,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  booksSection: {
    marginTop: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.white,
    marginBottom: height * 0.015,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryItem: {
    flex: 1,
    marginHorizontal: 6,
  },
  categoryLabel: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: height * 0.12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewSection: {
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.06,
  },
  reviewTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.white,
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  reviewDescription: {
    fontSize: width * 0.038,
    fontFamily: theme.typography.fontFamilyRegular,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  noDataText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
  },
  elevatedCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  cardTitle: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});