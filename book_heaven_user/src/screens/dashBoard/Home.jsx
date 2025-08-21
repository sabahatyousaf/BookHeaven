import React, {useEffect, useState, useMemo} from 'react';
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
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slices/userSlice';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {getAllBooks} from '../../redux/slices/bookSlice';
import BookCard from '../../utils/customComponents/customCards/bookCard/BookCard';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/customComponents/customLoader/Loader';
import {getAllReviews} from '../../redux/slices/reviewSlice';
import ReviewCard from '../../utils/customComponents/customReview/Review';

const {width, height} = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);
  const books = useSelector(state => state.book.books);
  const reviews = useSelector(state => state.review.reviews);

  const chunkArray = (arr, size) => {
    return Array.from({length: Math.ceil(arr.length / size)}, (_, index) =>
      arr.slice(index * size, index * size + size),
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
  }, [dispatch, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
  }, [reviews, userProfile]);

  // ✅ Get one book per category
  const getBooksByCategory = () => {
    if (!Array.isArray(books) || books.length === 0) return [];

    const categoryMap = {};
    const usedBooks = new Set();

    books.forEach(book => {
      let genres = [];

      if (book.genre) {
        try {
          // Try parsing JSON
          const parsed = JSON.parse(book.genre);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (typeof item === 'string') {
                item.split(',').forEach(g => genres.push(g.trim()));
              }
            });
          }
        } catch {
          // Fallback: split by comma if not JSON
          book.genre.split(',').forEach(g => genres.push(g.trim()));
        }
      }

      genres.forEach(g => {
        if (g && !categoryMap[g] && !usedBooks.has(book._id)) {
          categoryMap[g] = book;
          usedBooks.add(book._id);
        }
      });
    });

    // Convert map to array
    return Object.entries(categoryMap).map(([category, book]) => ({
      category,
      book,
    }));
  };

  const handleCategoryPress = genreName => {
    console.log('🎯 handleCategoryPress called with genreName:', genreName);
    console.log('📚 Total books available:', books.length);

    if (!genreName) {
      console.warn('⚠️ No genre name provided to handleCategoryPress');
      return;
    }

    const genreBooks = books.filter(book => {
      try {
        const genres = Array.isArray(book.genre)
          ? book.genre
          : JSON.parse(book.genre || '[]');

        console.log(`🔍 Checking book: ${book.title}`);
        console.log('📂 Parsed genres:', genres);

        return genres.includes(genreName);
      } catch (err) {
        console.error('❌ Error parsing genres for book:', book.title, err);
        return false;
      }
    });

    console.log('📊 Books matching genre:', genreBooks.length);

    navigation.navigate('Category_Books', {
      categoryId: Array.isArray(genreName)
        ? genreName[0].split(',')[0].trim()
        : genreName.split(',')[0].trim(),
      books: chunkArray(genreBooks, 2),
    });
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={globalStyles.container}>
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
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingLeftContainer}>
              <Text style={styles.greetingTitle}>{greeting}!</Text>
              <Text style={styles.greetingDescription}>
                Let's get you a book!{' '}
                <Feather
                  name={'book'}
                  size={width * 0.044}
                  color={theme.colors.white}
                />
              </Text>
            </View>
            <View style={styles.greetingRightContainer}>
              <TouchableOpacity activeOpacity={0.8}>
                <Image
                  source={
                    userProfile?.profilePicture
                      ? {uri: userProfile.profilePicture}
                      : require('../../assets/placeholders/default-avatar.png')
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 📚 Books by Category */}
          <View style={styles.booksSection}>
            <Text style={styles.sectionTitle}>Books by Category</Text>
            {chunkArray(getBooksByCategory(), 2).map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}>
                {row.map(({category, book}) => (
                  <View key={category} style={{flex: 1, marginHorizontal: 5}}>
                    <Text
                      style={{
                        color: theme.colors.white,
                        fontSize: 18,
                        marginBottom: 8,
                      }}>
                      {category}
                    </Text>
                    <BookCard
                      title={book.title}
                      imageUrl={book.bookImage}
                      onPress={() =>
                        handleCategoryPress(book.genre?.[0] || book.genre)
                      }
                      cardStyle={styles.elevatedCard}
                      titleStyle={styles.cardTitle}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* 💬 Reviews */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Customer's Review</Text>
            <Text style={styles.reviewDescription}>
              We always appreciate feedback from our customers, both excellent
              and even constructive.
            </Text>
            {formattedReviews.length > 0 && (
              <ReviewCard reviews={formattedReviews} />
            )}
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  greetingContainer: {
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.06,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.gap(2),
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
  },
  profileImage: {
    width: width * 0.16,
    height: height * 0.076,
    resizeMode: 'cover',
    borderRadius: theme.borderRadius.circle,
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
  scrollContent: {
    paddingBottom: height * 0.1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewSection: {
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.04,
  },
  reviewTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.white,
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  reviewDescription: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.fontFamilyRegular,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});
