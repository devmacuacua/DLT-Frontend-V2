import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { View, KeyboardAvoidingView, ScrollView, Text } from "react-native";
import {
  Button,
  Divider,
  Flex,
  FormControl,
  Radio,
  Stack,
  useToast,
} from "native-base";
import { useDispatch } from "react-redux";
import { Context } from "../../routes/DrawerNavigator";
import Spinner from "react-native-loading-spinner-overlay/lib";
import styles from "./styles";
import { useFormik } from "formik";
import withObservables from "@nozbe/with-observables";
import { database } from "../../database";
import NetInfo from "@react-native-community/netinfo";
import {
  SuccessHandler,
  WithoutNetwork,
  ErrorHandler as SyncErrorHandler,
} from "../../components/SyncIndicator";
import { sync } from "../../database/sync";
import { pendingSyncBeneficiaries } from "../../services/beneficiaryService";
import {
  loadPendingsBeneficiariesInterventionsTotals,
  loadPendingsBeneficiariesTotals,
  loadPendingsReferencesTotals,
} from "../../store/syncSlice";
import { pendingSyncBeneficiariesInterventions } from "../../services/beneficiaryInterventionService";
import { pendingSyncReferences } from "../../services/referenceService";
import {
  ErrorCleanHandler,
  ErrorHandler,
  InfoHandler,
  InfoHandlerSave,
  SyncHandlerError,
  cleanData,
  destroyBeneficiariesData,
  filterData,
} from "../../components/DataClean";
import { navigate } from "../../routes/NavigationRef";

const DatacleanScreen: React.FC = ({
  references,
  beneficiaries_interventions,
}: any) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const loggedUser: any = useContext(Context);
  const [errors, setErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [textMessage, setTextMessage] = useState("");

  const syncronize = () => {
    setLoading(true);
    if (isOffline) {
      toast.show({
        placement: "top",
        render: () => {
          return <WithoutNetwork />;
        },
      });
      setLoading(false);
    } else {
      sync({ username: loggedUser.username })
        .then(() => {
          toast.show({
            placement: "top",
            render: () => {
              return <SuccessHandler />;
            },
          });
          fetchCounts();
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          toast.show({
            placement: "top",
            render: () => {
              return <SyncErrorHandler />;
            },
          });
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const status = !(state.isConnected && state.isInternetReachable);
      setIsOffline(status);
    });
    return () => removeNetInfoSubscription();
  }, []);

  const handleSubmit = async () => {
    const errorsList = validate(formik.values);
    const hasErrors = JSON.stringify(errorsList) !== "{}";

    if (hasErrors) {
      setErrors(true);
      formik.setErrors(errorsList);

      toast.show({
        placement: "top",
        render: () => {
          return <ErrorHandler />;
        },
      });
    } else if (formik.values.data_clean === "0") {
      let removeErrorsList = validate(formik.values);
      formik.setErrors(removeErrorsList);
      setErrors(false);
      syncronize();

      const referencesCollection = references;
      const interventionsCollection = beneficiaries_interventions;

      const interventionsCollectionIDsList = filterData(
        interventionsCollection
      );
      const myIDsList = filterData(referencesCollection);
      const allBenfIds = [...myIDsList, ...interventionsCollectionIDsList];
      const uniqueBenfIds = cleanData(allBenfIds);

      destroyBeneficiariesData(uniqueBenfIds)
        .then(() => {
          toast.show({
            placement: "top",
            render: () => {
              return <InfoHandler />;
            },
          });
        })
        .catch((error) => {
          toast.show({
            placement: "top",
            render: () => {
              return <ErrorCleanHandler />;
            },
          });

          console.error("Erro ao deletar registros:", error);
          setLoading(false);
        });
    } else if (formik.values.data_clean === "1") {

      try {
        setLoading(true);
        if (isOffline) {
          toast.show({
            placement: "top",
            render: () => {
              return <SyncHandlerError />;
            },
          });
          setLoading(false);
         
        } else {
          sync({ username: loggedUser.username })
            .then( async () => {
              const adapter = database.adapter;

              await adapter.unsafeResetDatabase();
              toast.show({
                placement: "top",
                render: () => {
                  return <InfoHandlerSave />;
                },
              });
              setLoading(false);

              navigate({
                name: "Login",
              });

            })
            .catch(() => {
              setLoading(false);
              toast.show({
                placement: "top",
                render: () => {
                  return <SyncErrorHandler />;
                },
              });
              setLoading(false);
            });
        }

      } catch (error) {
        console.log(error);

        toast.show({
          placement: "top",
          render: () => {
            return <ErrorCleanHandler />;
          },
        });
      }
    } else {
      toast.show({
        placement: "top",
        render: () => {
          return <ErrorCleanHandler />;
        },
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      data_clean: "",
    },
    onSubmit: (values) => console.log(values),
    validate: (values) => validate(values),
    validateOnBlur: false,
    validateOnChange: false,
  });

  const validate = useCallback((values: any) => {
    const errors: any = {};

    if (!values.data_clean) {
      errors.data_clean = "Obrigatório";
    }
    return errors;
  }, []);

  const fetchCounts = async () => {
    const benefNotSynced = await pendingSyncBeneficiaries();
    dispatch(
      loadPendingsBeneficiariesTotals({
        pendingSyncBeneficiaries: benefNotSynced,
      })
    );

    const benefIntervNotSynced = await pendingSyncBeneficiariesInterventions();
    dispatch(
      loadPendingsBeneficiariesInterventionsTotals({
        pendingSyncBeneficiariesInterventions: benefIntervNotSynced,
      })
    );

    const refNotSynced = await pendingSyncReferences();
    dispatch(
      loadPendingsReferencesTotals({ pendingSyncReferences: refNotSynced })
    );
  };
  useEffect(() => {
    const message = "Sincronizando e limpando dados...";
    setTextMessage(message);
    fetchCounts();
  }, [loading]);

  return (
    <KeyboardAvoidingView style={styles.background}>
      {loading ? (
        <Spinner
          visible={true}
          textContent={textMessage}
          textStyle={styles.spinnerTextStyle}
        />
      ) : undefined}
      <ScrollView>
        <View>
          <View style={styles.containerForm}>
            <Text style={styles.txtLabel}>
              Limpeza de Dados
              {"                                                        "}
            </Text>
            <Divider />
            <Flex
              direction="column"
              mb="2.5"
              mt="1.5"
              _text={{ color: "coolGray.800" }}
            >
              <Text>
                {" "}
                <Text style={styles.txtLabel}>Seleccione a opção</Text>
              </Text>

              <FormControl
                key="data_clean"
                // isRequired
                isInvalid={"data_clean" in formik.errors}
              >
                {/* <FormControl.Label>Seleccione a opção</FormControl.Label> */}
                <Radio.Group
                  value={formik.values.data_clean + ""}
                  onChange={(itemValue) => {
                    formik.setFieldValue("data_clean", itemValue);
                  }}
                  name="rg4"
                  accessibilityLabel="pick a size"
                >
                  <Stack
                    alignItems={{
                      base: "flex-start",
                      md: "center",
                    }}
                    space={1}
                    w="75%"
                    maxW="300px"
                  >
                    <Radio
                      key="defi1"
                      value="0"
                      colorScheme="green"
                      size="md"
                      my={1}
                    >
                      Limpeza Regular
                    </Radio>
                    <Radio
                      key="defi2"
                      value="1"
                      colorScheme="green"
                      size="md"
                      my={1}
                    >
                      Limpeza do Fim do COP
                    </Radio>
                  </Stack>
                </Radio.Group>
                <FormControl.ErrorMessage>
                  {formik.errors.data_clean}
                </FormControl.ErrorMessage>
              </FormControl>

              <Button
                isLoading={loading}
                isLoadingText="Executando"
                onPress={handleSubmit}
                my="10"
                colorScheme="primary"
              >
                Executar
              </Button>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>

              <Text>
                {" "}
                <Text style={styles.txtLabel}> </Text>{" "}
              </Text>
            </Flex>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const enhance = withObservables([], () => ({
  references: database.collections.get("references").query(),
  beneficiaries_interventions: database.collections
    .get("beneficiaries_interventions")
    .query(),
}));

export default memo(enhance(DatacleanScreen));
