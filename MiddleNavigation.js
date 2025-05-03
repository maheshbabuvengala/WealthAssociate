import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./NewWealth/MainScreen/Home";
import Add_Member from "./NewWealth/Add_Member/Add_Member";
import Agent_Profile from "./NewWealth/UsersProfiles/AgentProfile";
import PropertyHome from "./NewWealth/Properties/PropertyHome";
import ExpertPanel from "./NewWealth/ExpertPanel/ExpertRoute";
import Coreclipro from "./NewWealth/CoreProCli/CoreClientsPro";
import PostProperty from "./NewWealth/Properties/PostProperty";
import RequestedProperty from "./NewWealth/Properties/RequestProperty";
import RequestedExpert from "./NewWealth/ExpertPanel/Requested_expert";
import Add_Agent from "./NewWealth/Add_Member/Add_Agent";
import RegisterValue from "./NewWealth/Add_Member/RegisterValue";
import Rrwa from "./NewWealth/Add_Member/Rrwa";
import Rewa from "./NewWealth/Add_Member/Rewa";
import PropertyDetailsScreen from "./NewWealth/Properties/ViewPropertyDetails";
import PropertyCard from "./NewWealth/MainScreen/PropertyCard";
import RegularProperties from "./NewWealth/Properties/PropertyTypesdata/RegularProperties";
import ApprovedPropertiesScreen from "./NewWealth/Properties/PropertyTypesdata/ApprovesProperties";
import WealthPropertiesScreen from "./NewWealth/Properties/PropertyTypesdata/WealthPropertys";
import ListedPropertiesScreen from "./NewWealth/Properties/PropertyTypesdata/ListedPropertys";
import NRI_Profile from "./NewWealth/UsersProfiles/NriProfile";
import InvestorRegister from "./Screens/AddInvestors";
import SkilledRegister from "./Screens/Rskill";

const Stack = createNativeStackNavigator();

const MiddleNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="newhome" component={HomeScreen} />
      <Stack.Screen name="postproperty" component={PostProperty} />
      <Stack.Screen name="requestproperty" component={RequestedProperty} />
      <Stack.Screen name="AddRegionalWealthAssociate" component={Rrwa} />
      <Stack.Screen name="AddValueWealthAssociate" component={RegisterValue} />
      <Stack.Screen name="AddExecutiveWealthAssociate" component={Rewa} />
      <Stack.Screen name="PropertyCard" component={PropertyCard} />
      <Stack.Screen name="invreg" component={InvestorRegister} />
      <Stack.Screen name="skillreg" component={SkilledRegister} />
      <Stack.Screen name="addmember" component={Add_Member} />
      <Stack.Screen name="agentprofile" component={Agent_Profile} />
      <Stack.Screen name="nriprofile" component={NRI_Profile} />
      <Stack.Screen name="propertyhome" component={PropertyHome} />
      <Stack.Screen name="expertpanel" component={ExpertPanel} />
      <Stack.Screen name="coreclipro" component={Coreclipro} />
      <Stack.Screen name="requestexpert" component={RequestedExpert} />
      <Stack.Screen name="regularprop" component={RegularProperties} />
      <Stack.Screen name="approveprop" component={ApprovedPropertiesScreen} />
      <Stack.Screen name="wealthprop" component={WealthPropertiesScreen} />
      <Stack.Screen name="listedprop" component={ListedPropertiesScreen} />
      <Stack.Screen name="addagent" component={Add_Agent} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
    </Stack.Navigator>
  );
};

export default MiddleNavigator;
