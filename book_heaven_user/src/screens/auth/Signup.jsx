import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {theme} from '../../styles/theme';
import * as Animatable from 'react-native-animatable';
import {globalStyles} from '../../styles/globalStyles';
import AuthHeader from '../../utils/customComponents/customHeader/AuthHeader';
import Logo from '../../assets/splashScreen/splash-logo.png';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  isValidInput,
  validateName,
  validatePassword,
  validateEmail,
} from '../../utils/customValidations/Validations';
import Toast from 'react-native-toast-message';
import {registerUser} from '../../redux/slices/authSlice';
import ImageUploadModal from '../../utils/customModals/ImageUploadModal';

const {width, height} = Dimensions.get('screen');

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [photoURL, setPhotoURL] = useState('');
  const [newImageURL, setNewImageURL] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState('');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    const hasErrors =
      emailError || passwordError || !name || !email || !password;
    setIsButtonEnabled(!hasErrors);
  }, [emailError, passwordError, name, email, password]);

  const handleNameChange = value => {
    setName(value);
    setNameError(validateName(value));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleImagePress = () => {
    setShowImageUploadModal(true);
  };

  const handleImageUpload = url => {
    setShowImageUploadModal(false);
    setNewImageURL(url);
    setPhotoURL(url);
  };

  const handleSignup = async () => {
    console.log('📌 handleSignup called');

    if (!isValidInput(name, email, password)) {
      return;
    }

    setLoading(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('userName', name);
      formData.append('email', email);
      formData.append('password', password);

      // Add profile picture if exists
      if (newImageURL) {
        const uriParts = newImageURL.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const fileType = fileName.split('.').pop();

        formData.append('profilePicture', {
          uri: newImageURL,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      // Dispatch signup action
      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Signup Successful!',
          text2: 'Account Created!',
        });

        // Reset fields
        setName('');
        setEmail('');
        setPassword('');
        setNewImageURL('');

        setTimeout(() => {
          navigation.replace('Signin');
        }, 3000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed!',
          text2: 'Please check your details',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error!',
        text2: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, styles.primaryContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerContainer}>
        <AuthHeader logo={Logo} title={'BookHeaven'} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          delay={300}
          style={styles.formContainer}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.description}>
            Create an account and start exploring the world of books!
          </Text>

          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={400}
            style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.imgContainer}
              activeOpacity={0.9}
              onPress={handleImagePress}>
              {newImageURL || photoURL ? (
                <Image
                  source={{uri: newImageURL || photoURL}}
                  style={styles.image}
                />
              ) : (
                <Image
                  source={require('../../assets/placeholders/default-avatar.png')}
                  style={styles.image}
                />
              )}
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={400}
            style={styles.inputContainer}>
            <InputField
              placeholder="Name"
              value={name}
              onChangeText={handleNameChange}
              leftIcon={
                <Feather
                  name={'user'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
            {nameError && (
              <Text style={globalStyles.textError}>{nameError}</Text>
            )}
          </Animatable.View>

          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={500}
            style={styles.inputContainer}>
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              leftIcon={
                <Feather
                  name={'mail'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
            {emailError && (
              <Text style={globalStyles.textError}>{emailError}</Text>
            )}
          </Animatable.View>

          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={700}
            style={styles.inputContainer}>
            <InputField
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={hidePassword}
              leftIcon={
                <Feather
                  name={'lock'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
              rightIcon={
                <Feather
                  name={hidePassword ? 'eye-off' : 'eye'}
                  size={width * 0.054}
                  color={theme.colors.primary}
                />
              }
              onRightIconPress={() => setHidePassword(!hidePassword)}
            />
            {passwordError && (
              <Text style={globalStyles.textError}>{passwordError}</Text>
            )}
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={900}
            style={styles.btnContainer}>
            <Button
              title="SIGN UP"
              onPress={handleSignup}
              width={width * 0.95}
              loading={loading}
              disabled={!isButtonEnabled}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1100}
            style={styles.signupContainer}>
            <Text style={[styles.signupText]}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signin')}
              activeOpacity={0.9}>
              <Text style={[styles.signupLink]}>Sign In</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>

      <ImageUploadModal
        visible={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onImageUpload={handleImageUpload}
        title="Upload Image!"
        description="Please Choose Your Profile Picture To Upload."
      />
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },

  headerContainer: {
    height: height * 0.2,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.024,
    paddingBottom: height * 0.02,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamilySemiBold,
    textAlign: 'justify',
    marginBottom: height * 0.01,
    color: theme.colors.dark,
    left: width * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyRegular,
    textAlign: 'justify',
    marginBottom: height * 0.02,
    color: theme.colors.dark,
    left: width * 0.02,
  },

  inputContainer: {
    marginBottom: height * 0.015,
  },

  imgContainer: {
    alignSelf: 'center',
  },

  image: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: (width * 0.4) / 2,
    resizeMode: 'cover',
  },

  btnContainer: {
    marginTop: height * 0.04,
    marginBottom: height * 0.02,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.05,
  },

  signupText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyRegular,
    textAlign: 'justify',
    color: theme.colors.dark,
    top: height * 0.008,
  },

  signupLink: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamilyBold,
    textAlign: 'justify',
    color: theme.colors.primary,
  },
});
