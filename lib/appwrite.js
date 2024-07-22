import {
  Account,
  Client,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.daddycoders.bike_car_service",
  projectId: "669b58f2003d972da8d5",
  storageId: "669b597d003869f5766d",
  databaseId: "669b5936000c08706c0c",
  userCollectionId: "669b594400074d4458cd",
  service_centersCollectionId: "669e0480001be28ff062",
  appointmentCollectionId: "669e5d09002404307d7e",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.service_centersCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.service_centersCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getServiceCenterById = async (id) => {
  try {
    // console.log("Fetching service center with ID:", id); // Log the ID
    const serviceCenter = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.service_centersCollectionId,
      id
    );
    return serviceCenter;
  } catch (error) {
    console.error("Error fetching service center:", error);
    throw new Error(error.message);
  }
};

export const bookAppointment = async (
  creator,
  serviceCenterId,
  appointmentDate
) => {
  try {
    // Prepare the appointment data
    const appointmentData = {
      date: appointmentDate.toISOString(), // Convert to ISO string
      status: "Booked", // Default status
      creator: creator, // Use creator for the userId
      centerId: serviceCenterId,
    };

    // Create the appointment document
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.appointmentCollectionId,
      ID.unique(), // Generate a unique ID for the appointment
      appointmentData
    );

    return response;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw new Error(error.message);
  }
};

export const getUserVisitedServiceCenters = async (userId) => {
  try {
    // Fetch appointments for the user
    const appointmentsResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.appointmentCollectionId,
      [Query.equal("creator", userId)]
    );
    const appointments = appointmentsResponse.documents;

    // Extract service center IDs and appointment details
    const serviceCentersPromises = appointments.map(async (appointment) => {
      const centerId = appointment.centerId.$id;

      const serviceCenter = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.service_centersCollectionId,
        centerId
      );

      return {
        ...serviceCenter,
        appointmentDate: appointment.date,
        appointmentStatus: appointment.status,
      };
    });

    // Fetch service centers in parallel
    const serviceCenters = await Promise.all(serviceCentersPromises);

    return serviceCenters;
  } catch (error) {
    console.error("Error fetching visited service centers:", error);
    throw new Error(error.message);
  }
};
