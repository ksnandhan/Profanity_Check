import React,{useState} from "react";
import {
    Button,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import AWS from 'aws-sdk'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { Buffer } from "buffer";
dotenv.config();
const Moderator = () => {
 const awsConfig = {
   region: 'us-east-1', 
   accessKeyId: process.env.REACT_APP_accessKeyId, 
   secretAccessKey: REACT_APP_secretAccessKey, 
 };
   AWS.config.update(awsConfig);
  const rekognition=new AWS.Rekognition();
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState('');
  const [moderationLabels, setModerationLabels] = useState([]);
  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, async(response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        setSelectedImage(imageUri);
        await checkImageModeration(imageUri)
      }
    });
  };

    const checkImageModeration = async (imageUri) => {
    try {
      const base64Image = await RNFS.readFile(imageUri, 'base64');
      const params = {
        Image: {
          Bytes: Buffer.from(base64Image, 'base64'),
        },
      };

      rekognition.detectModerationLabels(params, (err, data) => {
        console.log('in detecting');
        if (err) {
          console.log('Error detecting moderation labels: ', err);
        } else {
          console.log(data);
          setModerationLabels(data.ModerationLabels);
        }
      });
    } catch (error) {
      console.log('Error reading image file: ', error);
    }
  };

  console.log(selectedImage);
  console.log(moderationLabels)
    return (
        <View style={styles.container}>
          <Button title="Pick an Image" onPress={openImagePicker} />
         {moderationLabels.length > 0 && (
        <View>
          <Text>Moderation Labels:</Text>
          <View>
            {moderationLabels.length > 0 && (
        <View>
          <Text>Moderation Labels are below:</Text>
          {moderationLabels.map((label, index) => (
            <View key={index}>
              <Text>Label Name: {label.Name}</Text>
              <Text>Confidence: {label.Confidence}</Text>
              <Text>Parent Name: {label.ParentName}</Text>
              <Text>Taxonomy Level: {label.TaxonomyLevel}</Text>
            </View>
          ))}
        </View>
      )}
      
          </View>
        </View>
      )}
         </View>
    )
}

const styles = StyleSheet.create({
  container: {
    
     marginTop:370
  },
  image: {
    width: 300,
    height: 300,
    margin: 10,
  },
});
export default Moderator;