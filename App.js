import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import API_KEY from "./config";

const IMAGES_URL =
  "https://api.pexels.com/v1/search?query=nature&per_page=10&orientation=portrait";

const IMAGE_SIZE = 80;
const IMAGE_SPACING = 12;

const fetchImages = async () => {
  const data = await fetch(IMAGES_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const { photos } = await data.json();

  return photos;
};

export default function App() {
  const { width, height } = useWindowDimensions();
  const [images, setImages] = React.useState([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    try {
      const fetchData = async () => {
        const data = await fetchImages();
        setImages(data);
      };
      fetchData();
    } catch (err) {
      setImages(null);
    }
  }, []);

  const detailRef = React.useRef();
  const thumbRef = React.useRef();

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);
    detailRef.current.scrollToOffset({ offset: index * width, animated: true });

    if (index * (IMAGE_SIZE + IMAGE_SPACING) - IMAGE_SIZE / 2 > width / 2) {
      thumbRef.current.scrollToOffset({
        offset:
          index * (IMAGE_SIZE + IMAGE_SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  if (!images) {
    return (
      <View style={styles.container}>
        <Text> No Data, Check API Configuration. </Text>
      </View>
    );
  }

  if (!images?.length) {
    return (
      <View style={styles.container}>
        <Text> Loading... </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FlatList
        ref={detailRef}
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image
              style={[StyleSheet.absoluteFillObject]}
              source={{ uri: item.src.portrait }}
            />
          </View>
        )}
        onMomentumScrollEnd={(ev) => {
          scrollToActiveIndex(
            Math.floor(ev.nativeEvent.contentOffset.x / width)
          );
        }}
      />

      <FlatList
        ref={thumbRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ position: "absolute", bottom: IMAGE_SIZE }}
        contentContainerStyle={{ paddingHorizontal: IMAGE_SPACING }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
            <Image
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                marginRight: IMAGE_SPACING,
                borderRadius: 12,
                borderWidth: 4,
                borderColor: index === activeIndex ? "#fff" : "transparent",
              }}
              source={{ uri: item.src.portrait }}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
