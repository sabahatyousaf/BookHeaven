import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  useColorScheme,
  StatusBar,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Button from '../../utils/customComponents/customButton/Button';

const {width, height} = Dimensions.get('screen');

const images = {
  image1: require('../../assets/onBoardingScreen/onBoard-1.jpg'),
  image2: require('../../assets/onBoardingScreen/onBoard-2.jpg'),
  image3: require('../../assets/onBoardingScreen/onBoard-3.jpg'),
};

const slides = [
  {
    key: '1',
    image: images.image1,
    title: 'Now reading books will be easier',
    description:
      'Discover new worlds, join a vibrant reading community. Start your reading adventure with us.',
  },
  {
    key: '2',
    image: images.image2,
    title: 'Your Bookish Soulmate Awaits',
    description:
      'Let us be your guide to the perfect read. Discover books tailored to your tastes.',
  },
  {
    key: '3',
    image: images.image3,
    title: 'Start Your Adventure With Us',
    description:
      "Ready to embark on a quest for inspiration and knowledge? Your adventure begins now. Let's go!",
  },
];

const OnBoarding = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const statusBarColor = theme.colors.white;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const handleSlideChange = index => {
    setActiveIndex(index);
    fadeAnim.setValue(0);
    imageScale.setValue(0.8);
  };

  const goToNextSlide = () => {
    if (sliderRef.current && activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      sliderRef.current.goToSlide(nextIndex);
      setActiveIndex(nextIndex);
    } else {
      handleOnComplete();
    }
  };

  const handleOnComplete = () => {
    navigation.replace('Signin');
  };

  const renderItem = ({item, index}) => (
    <SafeAreaView
      style={[
        globalStyles.container,
        styles.primaryContainer,
        {
          backgroundColor: theme.colors.white,
        },
      ]}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [
              {scale: imageScale},
              {
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    index === activeIndex
                      ? 0
                      : index < activeIndex
                      ? -width * 0.2
                      : width * 0.2,
                    0,
                  ],
                }),
              },
            ],
          },
        ]}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <View style={styles.imageOverlay} />
      </Animated.View>

      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.title,
            {
              color: theme.colors.dark,
            },
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}>
          {item.title}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.description,
            {
              color: theme.colors.dark,
            },
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}>
          {item.description}
        </Animated.Text>
      </View>

      <View style={styles.btnContainer}>
        {index === slides.length - 1 ? (
          <View>
            <Button
              title="GET STARTED"
              width={width * 0.9}
              onPress={handleOnComplete}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          </View>
        ) : (
          <>
            <View>
              <Button
                title="SKIP"
                width={width * 0.46}
                onPress={handleOnComplete}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
              />
            </View>

            <View>
              <Button
                title="NEXT"
                width={width * 0.46}
                onPress={goToNextSlide}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            activeIndex === index && styles.activeDot,
            {
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <AppIntroSlider
      ref={sliderRef}
      renderItem={renderItem}
      data={slides}
      renderPagination={renderPagination}
      onSlideChange={handleSlideChange}
      showSkipButton={false}
      showDoneButton={false}
      showNextButton={false}
      activeDotStyle={styles.activeDot}
    />
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },

  imageContainer: {
    flex: 1.4,
    marginHorizontal: width * 0.06,
    marginTop: height * 0.06,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.large,
    position: 'relative',
  },

  image: {
    width: width * 0.9,
    height: height * 0.4,
    alignSelf: 'center',
    borderRadius: theme.borderRadius.large,
  },

  textContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
  },

  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamilySemiBold,
    textAlign: 'center',
    marginBottom: height * 0.02,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },

  description: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyRegular,
    textAlign: 'center',
    marginBottom: height * 0.02,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },

  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.04,
    gap: theme.gap(2),
  },

  paginationContainer: {
    position: 'absolute',
    bottom: height * 0.16,
    flexDirection: 'row',
    alignSelf: 'center',
  },

  dot: {
    width: width * 0.03,
    height: height * 0.014,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.gray,
    marginHorizontal: width * 0.014,
  },

  activeDot: {
    backgroundColor: theme.colors.primary,
    width: width * 0.03,
  },
});
