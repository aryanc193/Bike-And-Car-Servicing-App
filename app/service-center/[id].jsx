import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router"; // Use this to get route params
import useAppwrite from "../../lib/useAppwrite";
import { getServiceCenterById } from "../../lib/appwrite";
import CustomButton from "../../components/CustomButton";
import MapView, { Marker } from "react-native-maps";

const ServiceCenterDetail = () => {
  const { id } = useLocalSearchParams(); // Get the ID from route params
  const [serviceCenter, setServiceCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsExpanded, setDetailsExpanded] = useState(false);

  const toggleDetails = () => setDetailsExpanded(!isDetailsExpanded);

  useEffect(() => {
    const fetchServiceCenter = async () => {
      try {
        const data = await getServiceCenterById(id);
        setServiceCenter(data);
      } catch (error) {
        console.error("Failed to fetch service center:", error.message); // More descriptive error
      } finally {
        setLoading(false);
      }
    };

    fetchServiceCenter();
  }, [id]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    ); // Show a loading message or spinner

  if (!serviceCenter)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-black">Service Center not found</Text>
      </View>
    ); // Handle no data case

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle="flex-grow px-4 py-6">
        <View className="items-center justify-center">
          <Image
            source={{ uri: serviceCenter.thumbnail }}
            className="w-[90%] h-48 rounded-lg top-10"
          />
        </View>
        <Text className="text-4xl top-10 font-semibold my-4 text-black uppercase w-full text-center">
          {serviceCenter.title}
        </Text>
        <View className="mt-5 ml-5 ">
          <Text className="text-black text-xl font-pregular mt-5">
            Location 📍
          </Text>
          <View
            className="my-4"
            style={{
              height: 175,
              width: 350,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: serviceCenter.latitude,
                longitude: serviceCenter.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: serviceCenter.latitude,
                  longitude: serviceCenter.longitude,
                }}
                title={serviceCenter.title}
                description={serviceCenter.address}
              />
            </MapView>
          </View>
          <Text className="text-black text-xl font-pregular mt-5">
            Press to call:
          </Text>
          <Text
            className="font-bold text-black text-xl font-pregular mt-1"
            onPress={() => Linking.openURL(`tel:${serviceCenter.phone}`)}
          >
            {serviceCenter.phone}
          </Text>
          <Text className="text-black text-xl font-pregular mt-3">
            Click to send Email:
          </Text>
          <Text
            className="font-bold text-black text-xl font-pregular mt-1"
            onPress={() => Linking.openURL(`mailto:${serviceCenter.email}`)}
          >
            {serviceCenter.email}
          </Text>
          <View>
            {/* View Details Section */}
            <View className="mt-5">
              <TouchableOpacity onPress={toggleDetails}>
                <Text className="text-black text-xl font-bold uppercase mb-1">
                  {isDetailsExpanded ? "Hide details 🔼" : "View details 🔽"}
                </Text>
              </TouchableOpacity>
              {isDetailsExpanded && (
                <View>
                  {/* Operating Hours */}
                  <View className="mt-5">
                    <Text className="text-black text-xl font-pregular mb-1">
                      Operating Hours:
                    </Text>
                    {serviceCenter.operating_hours.map(
                      (operating_hours, index) => (
                        <Text
                          key={index}
                          className="text-black text-xl font-bold mt-1 mb-1"
                        >
                          {operating_hours}
                        </Text>
                      )
                    )}
                  </View>

                  {/* Services */}
                  <View className="mt-5">
                    <Text className="text-black text-xl font-pregular mb-1">
                      Services:
                    </Text>
                    {serviceCenter.services.map((service, index) => (
                      <Text
                        key={index}
                        className="text-black text-xl font-bold mt-1 mb-1"
                      >
                        {service}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
          <Text className="text-black text-xl font-pregular mt-4">Rating:</Text>
          <Text className="text-black font-bold text-3xl mt-2">
            {serviceCenter.rating} / 5 ⭐
          </Text>
        </View>
      </ScrollView>
      <CustomButton
        title="BOOK APPOINTMENT"
        handlePress={() => router.push(`./BookingPage?id=${serviceCenter.$id}`)}
        containerStyles="w-full mt-7"
      />
    </View>
  );
};

export default ServiceCenterDetail;
