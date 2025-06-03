import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import logo1 from "../assets/exp_and.jpg";
import logo2 from "../assets/exp.jpg";
import logo3 from "../assets/wlogo2.png";
import logo4 from "../assets/quote.png";
import logo5 from "../assets/cardbg.png";

const LoginScreen = () => {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={logo1}
      className="flex-1 w-full h-full justify-center items-center bg-black"
      resizeMode="cover"
    >
      {/* Logo */}
      <View className="absolute top-12 left-0 right-0 items-start">
        <Image
          source={logo3}
          className="w-[150px] h-[68px] md:w-[200px] md:h-[80px] right-[-113px] md:right-[-680px]"
          resizeMode="contain"
        />
      </View>

      <View className="absolute top-40 left-0 right-0 items-start">
        <Image
          source={require("../assets/quote.png")}
          className="w-[250px] h-[128px] md:w-[500px] md:h-[280px] right-[113px] md:right-[630px] left-[75px] md:left-[324px]"
          resizeMode="contain"
        />
      </View>

      {/* Card with PNG background */}
      <ImageBackground
        source={require("../assets/cardbg.png")}
        className="relative top-24 w-[325px] h-[200px] md:w-[580px] md:h-[330px] items-center justify-center"
        resizeMode="stretch"
      >
        <Text className="text-white font-bold text-[15px] md:text-[18px] relative bottom-[-25px] md:bottom-[-30px] shadow-md shadow-black">
          Welcome to Wealth Associates
        </Text>

        {/* Buttons */}
        <View className="flex-row w-full mt-[20%] md:mt-2 justify-evenly ml-2 md:ml-4">
          <TouchableOpacity
            className="bg-[#e6005c] py-2.5 px-6 md:py-4 md:px-11 rounded-lg shadow-lg shadow-[#e6005c]"
            onPress={() => navigation.navigate("Starting Screen")}
          >
            <Text className="text-white text-base font-bold">Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#e6005c] py-2.5 px-6 md:py-4 md:px-11 rounded-lg shadow-lg shadow-[#e6005c]"
            onPress={() => navigation.navigate("RegisterAS")}
          >
            <Text className="text-white text-base font-bold">Register</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <View className="flex-row w-full mt-4">
          <Text className="text-white text-xs md:text-sm ml-8 md:ml-28 mt-[-2px] md:mt-1 shadow-md shadow-black">
            if already registered ?
          </Text>
          <Text className="text-white text-xs md:text-sm ml-14 md:ml-36 mt-[-2px] md:mt-1 shadow-md shadow-black">
            new user ?
          </Text>
        </View>

        <Text className="z-10 top-[40%] text-white text-xl font-semibold mt-5">
          Paritala Naresh
        </Text>
        <Text className="z-10 top-[40%] text-white text-sm font-semibold mt-1">
          Founder & Mentor
        </Text>
      </ImageBackground>
    </ImageBackground>
  );
};

export default LoginScreen;
