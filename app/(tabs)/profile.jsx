import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text } from "react-native";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getUserVisitedServiceCenters, signOut } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "../../components/EmptyState";
import InfoBox from "../../components/InfoBox";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: visitedServiceCenters, error } = useAppwrite(() =>
    getUserVisitedServiceCenters(user.$id)
  );

  const handlePress = (id) => {
    router.push(`/service-center/${id}`);
  };

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

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  if (error) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white">Error loading data</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={visitedServiceCenters}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 mb-4"
            onPress={() => handlePress(item.$id)}
          >
            <View className="bg-gray-50 p-4 rounded-lg shadow-md">
              <Text className="text-lg font-semibold">{item.title}</Text>
              <Text className="text-gray-700 mt-2 text-lg">
                Phone: {item.phone}
              </Text>
              <Text className="text-gray-700 mt-2 text-lg">
                E-mail: {item.email}
              </Text>
              <Text className="text-gray-700 mt-2 text-lg">
                Status: {item.appointmentStatus}
              </Text>
              <Text className="text-gray-700 mt-2 text-lg">
                Date: {formatDateTime(item.appointmentDate)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Centers visited yet :("
            subtitle="Visit a center and let us know your experience!"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              subtitle={user?.email}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
