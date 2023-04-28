import React from 'react';
import {Text} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BeneficiariesListScreen from '../screens/Beneficiarias';
import BeneficiariesViewStack from '../screens/Beneficiarias/components/BeneficiariesViewStack';
import BeneficiarieServiceForm from '../screens/Beneficiarias/components/BeneficiarieServiceForm';
import ReferenceForm from '../screens/References/components/ReferenceForm';
import BeneficiaryForm from '../screens/Beneficiarias/components/BeneficiaryForm';
import BeneficiaryPartnerForm from '../screens/Beneficiarias/components/BeneficiaryPartnerForm';
import { Button } from 'native-base';
import { MaterialIcons, Ionicons } from "@native-base/icons";
import { navigate, navigationRef } from './NavigationRef';

const BeneficiaryStack = createNativeStackNavigator();

const BeneficiariesNavigator: React.FC = () => {

  return (
      <BeneficiaryStack.Navigator initialRouteName="BeneficiariesList"  screenOptions={{headerShown:false}}>
        <BeneficiaryStack.Screen name="BeneficiariesList" component={BeneficiariesListScreen} />
        <BeneficiaryStack.Screen name="BeneficiariesView" component={BeneficiariesViewStack} options={{
                    headerTitle: (props) => (
                      <Button colorScheme="unstyled" onPress={() => navigationRef.reset({
                        index: 0,
                        routes: [{ name: 'BeneficiariesList',
                                }]
                        })}><Ionicons name="arrow-back-outline" size={25}style={{ color: 'black' }}/></Button>

                    ),
                    headerShown:true
                }}></BeneficiaryStack.Screen>
        <BeneficiaryStack.Screen name="BeneficiarieServiceForm" component={BeneficiarieServiceForm} options={{
                    headerTitle: (props) => (
                      <Text {...props} style={{ color: 'black', fontWeight: 'bold' }}>                        
                        Prover Serviço
                      </Text>
                    ),
                    headerShown:true
                }}/>
        <BeneficiaryStack.Screen name="BeneficiaryForm" component={BeneficiaryForm} options={{
                    headerTitle: (props) => (
                      <Text {...props} style={{ color: 'black', fontWeight: 'bold' }}>
                        Registo de Beneficiária
                      </Text>
                    ),
                    headerShown:true
                }}/>
        <BeneficiaryStack.Screen name="BeneficiaryPartnerForm" component={BeneficiaryPartnerForm} options={{
                    headerTitle: (props) => (
                      <Text {...props} style={{ color: 'black', fontWeight: 'bold' }}>
                        Registo de Parceiro de Beneficiária
                      </Text>
                    ),
                    headerShown:true
                }}/>
        <BeneficiaryStack.Screen name="ReferenceForm" component={ReferenceForm} options={{
                    headerTitle: (props) => (
                      <Text {...props} style={{ color: 'black', fontWeight: 'bold' }}>
                        back
                      </Text>
                    ),
                    headerShown:true
                }}/>
      </BeneficiaryStack.Navigator>
  );
}

export default BeneficiariesNavigator;
