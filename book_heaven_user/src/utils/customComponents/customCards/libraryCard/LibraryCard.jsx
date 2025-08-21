import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import {theme} from '../../../../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';

const {width, height} = Dimensions.get('screen');

const LibraryCard = ({bookImage, title, author, bookFile}) => {
  const [pdfVisible, setPdfVisible] = useState(false);

  const togglePdfViewer = () => {
    setPdfVisible(!pdfVisible);
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={togglePdfViewer}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: bookImage}}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <View style={styles.pdfBadge}>
          <Ionicons
            name="document"
            size={width * 0.04}
            color={theme.colors.white}
          />
          <Text style={styles.pdfText}>PDF</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>{author}</Text>
      </View>

      <Modal
        visible={pdfVisible}
        animationType="slide"
        onRequestClose={togglePdfViewer}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={togglePdfViewer}>
            <Ionicons
              name="close"
              size={width * 0.04}
              color={theme.colors.dark}
            />
          </TouchableOpacity>

          <Pdf
            source={{uri: bookFile}}
            style={styles.pdf}
            trustAllCerts={false}
          />
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default LibraryCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    marginVertical: height * 0.02,
    padding: height * 0.02,
    width: width * 0.92,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
  },

  imageContainer: {
    width: width * 0.35,
    height: width * 0.45,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    marginBottom: height * 0.02,
    position: 'relative',
  },

  bookImage: {
    width: '100%',
    height: '100%',
  },

  pdfBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(229, 68, 59, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.002,
  },

  pdfText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    marginLeft: width * 0.014,
    fontFamily: theme.typography.fontFamilySemiBold,
    top: height * 0.002,
  },

  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },

  title: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.dark,
    marginBottom: height * 0.01,
    textAlign: 'center',
    width: '100%',
  },

  author: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyItalic,
    color: theme.colors.dark,
    marginBottom: height * 0.01,
    textAlign: 'center',
    width: '100%',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  
  pdf: {
    flex: 1,
    width: '100%',
  },

  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});
