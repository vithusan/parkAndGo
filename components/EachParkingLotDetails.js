import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/core";
import { useParkingLotsCon } from "./ParkingLotsContext";
import { firebaseDB } from "../App";
import { ref, set, remove, get, push, onValue } from "firebase/database";
import axios from "axios";

const EachParkingLotDetails = ({ route }) => {
  const navigation = useNavigation();
  const { parkingLot } = route.params;
  const [isLiked, setIsLiked] = useState(false);
  const { userId } = useParkingLotsCon();
  const [parkingInfo, setParkingInfo] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [busyRatingModalVisible, setBusyRatingModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [busyRating, setBusyRating] = useState(Array(7).fill(1));
  const [reviewDataFromFirebase, setReviewDataFromFirebase] = useState([]);
  const [busyRatingDataFromFirebase, setBusyRatingDataFromFirebase] = useState(
    []
  );

  const addressOfParkingLot = parkingLot.title
    .replace(/\s+-.*$/, "")
    .replace(/\s+/g, "-");
  console.log(addressOfParkingLot);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await axios.get(
          `https://www.easypark.ca/find-parking/locations-and-lot-information/lot-details/${addressOfParkingLot}`
        );
        const html = response.data;
        // console.log(html);
        const pattern =
          /<li class=['"]basic-rates['"]><strong>([^<>]*)<\/strong>\s*<span>([^<>]*)<\/span><\/li>\s*<li class=['"]sparc-decals['"]><span class=['"]heading['"]>([^<>]*)<\/span><br>([^<>]*)<\/li>/g;

        const match = pattern.exec(html);
        if (match) {
          const basicRate = match[1];
          const dailyMaximum = match[2];
          const sparcDecalsHeading = match[3];
          const sparcDecalsInfo = match[4];

          setParkingInfo({
            basicRate,
            dailyMaximum,
            sparcDecalsHeading,
            sparcDecalsInfo,
          });
        } else {
          console.log("No match found");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchBusyRatings();
  }, []);

  useEffect(() => {
    const fetchFavoriteParkingLots = async () => {
      try {
        const userParkingLotRef = ref(
          firebaseDB,
          `users/${userId}/parkingLots/${parkingLot.LotNumber}`
        );
        const snapshot = await get(userParkingLotRef);
        setIsLiked(snapshot.exists());
      } catch (error) {
        console.error("Error fetching favorite parking lots:", error);
      }
    };

    fetchFavoriteParkingLots();
  }, [userId, parkingLot.LotNumber]);

  const toggleFavorite = async () => {
    try {
      const userParkingLotRef = ref(
        firebaseDB,
        `users/${userId}/parkingLots/${parkingLot.LotNumber}`
      );

      if (isLiked) {
        await remove(userParkingLotRef);
        setIsLiked(false);
      } else {
        await set(userParkingLotRef, { ...parkingLot, liked: true });
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const reviewsRef = ref(firebaseDB, `reviews/${parkingLot.LotNumber}`);
      await push(reviewsRef, { text: reviewText });
      console.log("Review submitted successfully.");
      setReviewModalVisible(false);
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleBusyRatingSubmit = async () => {
    try {
      const busyRatingRef = ref(
        firebaseDB,
        `busyRating/${parkingLot.LotNumber}`
      );
      await push(busyRatingRef, busyRating);
      console.log("Busy rating submitted successfully.");
      setBusyRatingModalVisible(false);
    } catch (error) {
      console.error("Error submitting busy rating:", error);
    }
  };

  const renderBusyRatingButtons = () => {
    const busyRatingButtons = [];
    for (let i = 1; i <= 5; i++) {
      busyRatingButtons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.busyRatingButton,
            busyRating === i ? styles.busyRatingSelected : null,
          ]}
          onPress={() => setBusyRating(i)}
        >
          <Text>{i}</Text>
        </TouchableOpacity>
      );
    }
    return busyRatingButtons;
  };

  const fetchReviews = () => {
    const reviewsRef = ref(firebaseDB, "reviews");
    onValue(reviewsRef, (snapshot) => {
      const reviewsData = snapshot.val();
      if (reviewsData) {
        const reviewsArray = Object.entries(reviewsData).flatMap(
          ([lotNumber, reviews]) => {
            if (lotNumber === parkingLot.LotNumber) {
              return Object.values(reviews);
            } else {
              return [];
            }
          }
        );
        setReviewDataFromFirebase(reviewsArray);
      }
    });
  };
  const fetchBusyRatings = () => {
    const busyRatingsRef = ref(firebaseDB, "busyRating");
    onValue(busyRatingsRef, (snapshot) => {
      const busyRatingsData = snapshot.val();
      if (busyRatingsData) {
        const busyRatingsArray = Object.entries(busyRatingsData).flatMap(
          ([lotNumber, ratings]) => {
            if (lotNumber === parkingLot.LotNumber) {
              return Object.values(ratings);
            } else {
              return [];
            }
          }
        );
        setBusyRatingDataFromFirebase(busyRatingsArray);
      }
    });
  };

  const calculateAverageRating = () => {
    if (busyRatingDataFromFirebase.length === 0) {
      return 0;
    }

    const sum = busyRatingDataFromFirebase.reduce(
      (acc, rating) => acc + rating,
      0
    );
    const average = sum / busyRatingDataFromFirebase.length;
    return average.toFixed(2);
  };

  const averageRating = calculateAverageRating();

  console.log(busyRatingDataFromFirebase, reviewDataFromFirebase);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Lot Details</Text>
      <Text style={styles.text}>Lot Number: {parkingLot.LotNumber}</Text>
      <Text style={styles.text}>Features: {parkingLot.features}</Text>
      <Text style={styles.text}>Address: {parkingLot.street}</Text>

      {parkingInfo && (
        <>
          <View style={styles.basicRateContainer}>
            <Text style={styles.basicRateText}>
              Basic Rate: {parkingInfo.basicRate}
            </Text>
            <Text style={styles.basicRateText}>
              Daily Maximum: {parkingInfo.dailyMaximum}
            </Text>
          </View>
          <View style={styles.sparcDecalsContainer}>
            <Text style={styles.sparcDecalsHeading}>
              SPARC Decals Information
            </Text>
            <Text style={styles.sparcDecalsInfo}>
              {parkingInfo.sparcDecalsHeading} - {parkingInfo.sparcDecalsInfo}
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FFC300" }]}
        onPress={() => setReviewModalVisible(true)}
      >
        <Text style={styles.buttonText}>Review Parking Lot</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF5733" }]}
        onPress={() => setBusyRatingModalVisible(true)}
      >
        <Text style={styles.buttonText}>Busy Rating</Text>
      </TouchableOpacity>

      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <TextInput
              style={styles.textInput}
              multiline={true}
              placeholder="Type your review here..."
              value={reviewText}
              onChangeText={(text) => setReviewText(text)}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleReviewSubmit}
            >
              <Text style={styles.modalButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={busyRatingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBusyRatingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Busy Rating</Text>
            <View style={styles.busyRatingContainer}>
              {renderBusyRatingButtons()}
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleBusyRatingSubmit}
            >
              <Text style={styles.modalButtonText}>Submit Ratings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isLiked ? "green" : "red" }]}
        onPress={() => toggleFavorite(userId, parkingLot)}
      >
        <Text style={styles.buttonText}>{isLiked ? "Liked" : "Like"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.reviewsContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviewDataFromFirebase.map((review, index) => (
          <Text style={styles.reviewText} key={index}>
            {review.text}
          </Text>
        ))}
      </View>

      <View style={styles.busyRatingsContainer}>
        <Text style={styles.sectionTitle}>Busy Ratings</Text>
        <Text style={styles.averageRatingText}>{averageRating}/5</Text>
      </View>
    </View>
  );
};

export default EachParkingLotDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  basicRateContainer: {
    marginBottom: 20,
  },
  basicRateText: {
    fontSize: 18,
  },
  sparcDecalsContainer: {
    marginBottom: 20,
  },
  sparcDecalsHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sparcDecalsInfo: {
    fontSize: 16,
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  textInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  busyRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  busyRatingButton: {
    width: 40,
    height: 40,
    backgroundColor: "#ccc",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  busyRatingSelected: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  reviewsContainer: {
    marginVertical: 10,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  busyRatingsContainer: {
    marginVertical: 10,
  },
  averageRatingText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
  },
});
