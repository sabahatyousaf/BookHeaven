import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  FlatList,
  Animated,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import BookCard from '../../../utils/customComponents/customCards/bookCard/BookCard';
import InputField from '../../../utils/customComponents/customInputField/InputField';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Loader from '../../../utils/customComponents/customLoader/Loader';

const { width } = Dimensions.get('screen');

const BookCategory = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Get params (support both categoryName and categoryId)
  const {
    categoryName,
    categoryId,
    books = []
  } = route.params || {};

  // Clean category display name
  const displayCategoryName = categoryName
    ? categoryName
    : categoryId
      ? String(categoryId)
        .replace(/[\[\]"]/g, '')
        .split(',')[0]
        .trim() || 'Books'
      : 'Books';

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [isSearching, setIsSearching] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const noResultsAnim = useRef(new Animated.Value(0)).current;

  // Animate entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Search logic (flat array)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();

    const results = books.filter(book =>
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query)
    );

    setFilteredBooks(results);
    setIsSearching(false);

    if (results.length === 0) {
      Animated.timing(noResultsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [searchQuery, books]);

  const handleBookPress = (book) => {
    navigation.navigate('Book_Detail', { book });
  };

  const renderBook = ({ item }) => (
    <View style={styles.cardWrapper}>
      <BookCard
        title={item.title}
        imageUrl={item.bookImage}
        price={item.price}
        cardStyle={styles.card}
        titleStyle={styles.cardTitle}
        onPress={() => handleBookPress(item)}
      />
    </View>
  );

  const ListEmptyComponent = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: noResultsAnim,
        },
      ]}
    >
      <FontAwesome6
        name="book-open"
        size={width * 0.25}
        color={theme.colors.primary + '80'}
      />
      <Text style={styles.emptyTitle}>No Books Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim()
          ? "Try a different search term"
          : "No books available in this category"}
      </Text>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <Header
            logo={require('../../../assets/splashScreen/splash-logo.png')}
            title={displayCategoryName}
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

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <InputField
            placeholder="Search books..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <FontAwesome5
                name="search"
                size={width * 0.045}
                color={theme.colors.primary}
              />
            }
            containerStyle={styles.inputContainer}
          />
        </Animated.View>

        {/* Content */}
        {isSearching ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : (
          <FlatList
            data={filteredBooks}
            renderItem={renderBook}
            keyExtractor={(item) => item._id || `${item.title}-${Math.random()}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ListEmptyComponent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={11}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    marginBottom: 8,
  },
  searchWrapper: {
    marginHorizontal: width * 0.04,
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
  },
  listContent: {
    paddingHorizontal: width * 0.04,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontFamily: theme.typography?.fontFamilySemiBold,
    fontSize: 15,
    color: theme.colors.white,
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
    marginTop: 120,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default BookCategory;