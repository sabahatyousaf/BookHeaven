import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getAllBooks } from '../../redux/slices/bookSlice';
import { theme } from '../../styles/theme';
import Header from '../../utils/customComponents/customHeader/Header';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margin
const CARD_HEIGHT = CARD_WIDTH * 1.45; // Slightly taller for better image

const Categories = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { books, loading } = useSelector((state) => state.book);

  useEffect(() => {
    dispatch(getAllBooks());
  }, [dispatch]);

  // ─── Genre Parser ────────────────────────────────────────
  const parseGenres = (genreField) => {
    if (!genreField) return [];

    let raw = genreField;
    if (Array.isArray(genreField)) {
      if (typeof genreField[0] === 'string') raw = genreField[0];
      else if (Array.isArray(genreField[0])) raw = genreField.flat();
    }

    try {
      let cleaned = typeof raw === 'string' ? raw : JSON.stringify(raw);
      cleaned = cleaned
        .replace(/[\[\]\"']/g, '')
        .replace(/\s*,\s*/g, ',')
        .replace(/,,/g, ',');
      return cleaned
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g.length > 0);
    } catch (e) {
      console.warn('Genre parsing failed:', genreField, e);
      return [];
    }
  };

  // ─── Memoized Categories ─────────────────────────────────
  const categories = useMemo(() => {
    const categoryMap = {};

    books.forEach((book) => {
      const genres = parseGenres(book.genre);
      genres.forEach((genreName) => {
        if (!categoryMap[genreName]) {
          categoryMap[genreName] = {
            id: genreName.toLowerCase().replace(/\s+/g, '-'),
            name: genreName,
            thumbnail:
              book.bookImage ||
              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300',
            count: 0,
            lastUpdated: book.createdAt,
          };
        }
        categoryMap[genreName].count += 1;
      });
    });

    return Object.values(categoryMap).sort(
      (a, b) => b.count - a.count || new Date(b.lastUpdated) - new Date(a.lastUpdated)
    );
  }, [books]);

  const handleCategoryPress = (genreName) => {
    if (!genreName) return;

    const genreBooks = books.filter((book) =>
      parseGenres(book.genre).includes(genreName)
    );

    navigation.navigate('Category_Books', {
      categoryName: genreName,
      categoryId: genreName.toLowerCase().replace(/\s+/g, '-'),
      books: genreBooks,
    });
  };

  // ─── Entrance Animation ──────────────────────────────────
  const animatedValues = useRef([]);

  useEffect(() => {
    animatedValues.current = categories.map(() => new Animated.Value(0));
  }, [categories.length]);

  useEffect(() => {
    if (!loading && categories.length > 0) {
      const animations = animatedValues.current.map((val, idx) =>
        Animated.timing(val, {
          toValue: 1,
          duration: 700,
          delay: idx * 90,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        })
      );
      Animated.stagger(90, animations).start();
    }
  }, [loading, categories.length]);

  const renderItem = ({ item, index }) => {
    const animValue = animatedValues.current[index] || new Animated.Value(0);

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [60, 0],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1],
    });

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.card}
          onPress={() => handleCategoryPress(item.name)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            style={styles.image}
            imageStyle={styles.imageStyle}
            resizeMode="cover"
          >
            {/* Gradient overlay + glass effect */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.88)']}
              style={styles.overlay}
            >
              <View style={styles.content}>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countNumber}>{item.count}</Text>
                  <Text style={styles.countText}> Books</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Subtle shine */}
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'transparent']}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0d001a', '#1a0033', '#2a004d']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Explore Categories"
          leftIcon={<FontAwesome5 name="arrow-left" size={24} color="#fff" />}
          onPressLeft={() => navigation.goBack()}
          titleStyle={{ fontSize: 24, letterSpacing: 0.4, fontWeight: '700' }}
        />

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Discovering genres...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.centerContainer}>
            <FontAwesome5 name="book-dead" size={80} color="#4b5563" />
            <Text style={styles.emptyTitle}>No Categories Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add some books to start exploring!
            </Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: 6,
    marginVertical: 12,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  image: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  content: {
    marginBottom: 4,
  },
  categoryName: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  countNumber: {
    color: '#c084fc',
    fontSize: 17,
    fontWeight: 'bold',
  },
  countText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Categories;