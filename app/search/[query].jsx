import { FlatList, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import useAppwrite from "../../lib/useAppwrite";
import { searchPosts } from "../../lib/appwrite";
import { useLocalSearchParams, router } from "expo-router";

const Search = () => {
  const { query } = useLocalSearchParams();
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query));

  useEffect(() => {
    refetch();
  }, [query]);

  const handlePress = (id) => {
    router.push(`/service-center/${id}`);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 mb-4"
            onPress={() => handlePress(item.$id)}
          >
            <View className="bg-gray-50 p-4 rounded-lg shadow-md">
              <Text className="text-gray-600 text-lg font-semibold">
                {item.title}
              </Text>
              <Image
                source={{ uri: item.thumbnail }}
                className="w-full h-48 mt-4 rounded-lg"
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-800">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-black">{query}</Text>
            <View className="mt-6 mb-0">
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No centers Found"
            subtitle="No centers found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
