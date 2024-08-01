import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getServiceCenterById, bookAppointment } from "../../lib/appwrite";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import { CheckBox } from "react-native-elements"; // or any checkbox library you prefer

const BookingPage = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [serviceCenter, setServiceCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    const fetchServiceCenter = async () => {
      try {
        const data = await getServiceCenterById(id);
        setServiceCenter(data);
      } catch (error) {
        console.error("Failed to fetch service center:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceCenter();
    }
  }, [id]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      const newDate = date || new Date();
      setSelectedDate((prevDate) => {
        const updatedDate = new Date(prevDate);
        updatedDate.setFullYear(newDate.getFullYear());
        updatedDate.setMonth(newDate.getMonth());
        updatedDate.setDate(newDate.getDate());
        return updatedDate;
      });
      setShowDatePicker(false);
      if (!showTimePicker) {
        setShowTimePicker(true);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event, time) => {
    if (event.type === "set") {
      const newTime = time || new Date();
      setSelectedDate((prevDate) => {
        const updatedDate = new Date(prevDate);
        updatedDate.setHours(newTime.getHours());
        updatedDate.setMinutes(newTime.getMinutes());
        return updatedDate;
      });
      setShowTimePicker(false);
    } else {
      setShowTimePicker(false);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === "ios") {
      setShowDatePicker(true);
    } else if (Platform.OS === "android") {
      import("@react-native-community/datetimepicker").then(
        ({ DateTimePickerAndroid }) => {
          DateTimePickerAndroid.open({
            mode: "date",
            value: selectedDate,
            onChange: (event, date) => handleDateChange(event, date),
          });
        }
      );
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices((prevSelectedServices) => {
      if (prevSelectedServices.includes(service)) {
        return prevSelectedServices.filter((s) => s !== service);
      } else {
        return [...prevSelectedServices, service];
      }
    });
  };

  const handleBookAppointment = async () => {
    try {
      if (!serviceCenter) {
        Alert.alert("Error", "Service center information is not available.");
        return;
      }
      if (selectedServices.length === 0) {
        Alert.alert("Error", "Please select at least one service.");
        return;
      }
      await bookAppointment(
        user.$id,
        serviceCenter.$id,
        selectedDate,
        selectedServices
      );
      Alert.alert("Success", "Appointment booked successfully!");
      router.push("../(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to book appointment. Please try again.");
      console.error(error);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

  if (!serviceCenter) return <Text>Service Center not found</Text>;

  return (
    <View className="flex-1 mt-10 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <View className="items-center justify-center">
          <Image
            source={{ uri: serviceCenter.thumbnail }}
            className="w-[90%] h-48 rounded-lg -top-5"
          />
        </View>
        <Text className="text-4xl font-bold mb-4 text-black uppercase text-center">
          {serviceCenter.title}
        </Text>
        <Text className="text-lg text-black mb-4">
          Book a time slot at your convenience{"\n"}and confirm!
        </Text>
        <CustomButton
          title="Select Date & Time"
          handlePress={openDatePicker}
          containerStyles="w-full h-12 bg-secondary mb-5"
        />
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date)}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, time) => handleTimeChange(event, time)}
          />
        )}
        <Text className="text-xl font-regular text-black">
          Selected Date and Time:{" "}
        </Text>
        <Text className="text-secondary font-bold text-3xl mt-4">
          {formatDateTime(selectedDate)}
        </Text>
        <View className="mt-10">
          <Text className="text-xl">Select a service:</Text>
          {serviceCenter.services.map((service, index) => (
            <CheckBox
              key={index}
              title={service}
              checked={selectedServices.includes(service)}
              onPress={() => handleServiceToggle(service)}
            />
          ))}
        </View>
      </ScrollView>
      <CustomButton
        title="Book Appointment"
        handlePress={handleBookAppointment}
        containerStyles="w-full h-12 bg-secondary"
      />
    </View>
  );
};

export default BookingPage;
