import {
  ScrollView,
  Text,
  View,
  Image,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import EmptyState from "../../components/EmptyState";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import SearchInput from "../../components/SearchInput";
import { router } from "expo-router";

const Home = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePress = (id) => {
    router.push(`/service-center/${id}`);
  };

  const getNextDay = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toLocaleDateString();
  };

  const testimonials = [
    { text: "Great service!", name: "Aryan" },
    { text: "Highly recommend!", name: "Rakesh" },
    { text: "Very satisfied!", name: "Mukesh" },
  ];

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Banner */}
        <View className="my-0 px-4 space-y-4">
          <View className="justify-between items-start flex-row -mb-4">
            <View>
              <Text className="font-pmedium text-lg text-gray-700">
                Welcome Back,
              </Text>
              <Text className="text-3xl font-psemibold text-black mt-1">
                {user?.username}
              </Text>
            </View>
            <View className="-mt-5">
              <Image
                source={images.logoSmall}
                className="w-[150px]"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <SearchInput />

        {/* Horizontal Scroll for Service Centers */}
        <View className="mb-6 w-full">
          <Text className="text-2xl font-semibold text-black mb-4">
            Service Centers
          </Text>
          {posts.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {posts.map((item) => (
                <TouchableOpacity
                  key={item.$id}
                  className="mr-4"
                  onPress={() => handlePress(item.$id)}
                >
                  <View className="bg-gray-50 p-4 rounded-lg shadow-xl shadow-black border border-secondary-200 w-80">
                    <Image
                      source={{ uri: item.thumbnail }}
                      className="w-full h-56 rounded-lg"
                      resizeMode="cover"
                    />
                    <Text className="text-gray-600 text-lg font-semibold mt-2">
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              title="No Centers Found"
              subtitle="Don't worry, We are finding you the best deals!"
            />
          )}
        </View>

        {/* Customer Testimonials */}
        <View className="mb-6 px-4">
          <Text className="text-2xl font-semibold text-black mb-4">
            Customer Feedbacks ✔
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Replace these with actual testimonials */}
            <View className="flex-row">
              {testimonials.map((testimonial, index) => (
                <View
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg shadow-xl shadow-black border border-gray-800 w-64 mr-4"
                >
                  <Text className="text-gray-600 text-lg font-semibold">
                    {testimonial.text}
                  </Text>
                  <Text className="text-gray-500 mt-2">{testimonial.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Promotions or Offers */}
        <View className="mb-6 px-4">
          <Text className="text-2xl font-semibold text-black mb-4">
            Promotions & Offers 🎉
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Replace these with actual promotions */}
            {[
              "First Service Free",
              "20% off on full vehicle checks",
              "Pay for 1 service Get 1 Free",
            ].map((offer, index) => (
              <View
                key={index}
                className="bg-gray-50 p-4 rounded-lg shadow-xl shadow-black border border-secondary-200 w-64 mr-4"
              >
                <Text className="text-gray-600 text-lg font-semibold">
                  {offer}
                </Text>
                <Text className="text-gray-500 mt-2">
                  Valid until {getNextDay()} T&C Apply*
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
