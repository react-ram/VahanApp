import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ListItem from "../components/Alerts/ListItem";
import { FlatList, Platform, View, Button } from "react-native";
import { Card, Divider } from "react-native-paper";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function Alerts() {
  const [data, setData] = useState("");
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const [notes, setNotes] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    axios
      .get("http://api.simplytrack.in:8190/api/rest/alerts/Whistle", {
        headers: {
          API_KEY: "J3YTbYbTaaLLFEb",
          Accept: "application/json",
          "content-type": "application/json",
        },
      })
      .then((res) => setData(res.data))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    axios
      .get(
        "http://api.simplytrack.in:8190/api/rest/alerts/Whistle/2021-06-21/2021-06-24",
        {
          headers: {
            API_KEY: "J3YTbYbTaaLLFEb",
            Accept: "application/json",
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        setNotes(res.data);
        console.log("ramchar", res.data);
      })
      .catch((e) => console.log(e));
  }, []);

  const renderItem = ({ item }) => (
    <Card.Title title={item.regNo} subtitle={item.msg} />
  );
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.regNo}
        ItemSeparatorComponent={() => {
          return <Divider />;
        }}
      />
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken, notes[0]);
        }}
      />
    </View>
  );
}

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/notifications
async function sendPushNotification(expoPushToken, data) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: `${data.type}`,
    body: `${data.msg}`,
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      sound: true,
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export default Alerts;
