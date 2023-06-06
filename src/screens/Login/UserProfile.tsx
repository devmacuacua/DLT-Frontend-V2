import React, { useState, useEffect, useContext } from "react";
import { View, KeyboardAvoidingView, ScrollView,
    TextInput, TouchableOpacity, Platform,
    Text} 
    from 'react-native';
import { Box, HStack, AspectRatio, Center, 
    Image, Stack, Heading, Divider, Avatar, 
    Icon, Flex, Spacer, VStack, Button} 
    from "native-base";
import { parse } from 'qs';
import { Ionicons } from "@native-base/icons";
import { navigate } from "../../routes/NavigationRef";
import { database } from '../../database';
import { Q } from "@nozbe/watermelondb";
import styles from "./styles";
import { Context } from "../../routes/DrawerNavigator";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const UserProfile: React.FC = ({ route }:any) => {
    // const {user, profile, locality, partner, us} = route.params;

    const loggedUser: any = useContext(Context);
    const user = loggedUser;
    const userDetails = useSelector((state: RootState) => state.auth.userDetails);
    console.log(user);
    console.log("==================================================================");
    console.log(userDetails);
    console.log("==================================================================");
    const firstLogin = loggedUser?.entry_point === undefined ? "1" : "2";

    return (
        <KeyboardAvoidingView  style={styles.background}>
            <ScrollView>
                <View style={styles.user}>
                    <View style={styles.containerForm}>
                        <Box style={styles.userLogo}>
                            <Avatar color="white" bg={'primary.700'} size={150}>
                                <Icon as={Ionicons} name="person-outline" color="white" size={70} />
                            </Avatar>
                            <Box style={styles.userText}>     
                                <Text>{ user?.username }</Text> 
                                <Heading style={styles.username}>{ user?.name } { user?.surname }</Heading>  
                                <Text>{ user?.email }</Text>     
                                <Text>{ firstLogin === '1'? user?.id : user?.online_id }</Text>                                                                                                                                  
                            </Box> 
                        </Box>
                        <Text style={styles.txtLabel}>Detalhes do Utilizador</Text>
                        <Divider />
                        <Flex direction="column" mb="2.5" mt="1.5" _text={{color: "coolGray.800"}}>
                                
                            <Text> <Text style={styles.txtLabel}>Parceiro: </Text> {user?.organization_name} </Text>

                            <Text> <Text style={styles.txtLabel}>Telemóvel: </Text> { user?.phone_number }</Text>

                            <Text> <Text style={styles.txtLabel}>Ponto de Entrada: </Text>
                            { 
                                (user?.entry_point==="1") ?
                                    "Unidade Sanitaria"
                                    : 
                                (user?.entry_point==="2") ? 
                                    "Comunidade"
                                    : 
                                    "Escola"                                            
                                }  
                            </Text>
                                
                            {/* <Text> <Text style={styles.txtLabel}>Localidade: </Text> {locality}</Text>
                                
                            <Text> <Text style={styles.txtLabel}>US: </Text> {us}</Text>
                                
                            <Text> <Text style={styles.txtLabel}>Perfil: </Text> {profile}</Text> */}

                        </Flex>
                        <Divider />

                        <Text> <Text style={styles.txtLabel}>Estado: </Text> { (user.status===1)  ? "Activo" : "Inactivo" }</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default UserProfile;