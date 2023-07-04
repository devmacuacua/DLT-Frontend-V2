import React, { Fragment } from "react";
import { Collapse } from "antd";
import { Link, useLocation } from "react-router-dom";
const { Panel } = Collapse;
import CompletedOnlyPrimaryPackage from "./containers/CompletedOnlyPrimaryPackage";
import CompletedPrimaryPackageAndSecondaryService from "./containers/CompletedPrimaryPackageAndSecondaryService";
import CompletedAtLeastOnePrimaryService from "./containers/CompletedAtLeastOnePrimaryService";
import StartedServiceDidNotComplete from "./containers/StartedServiceDidNotComplete";
import CompletedSocialEconomicApproaches from "./containers/CompletedSocialEconomicApproaches";
import CompletedViolenceService from "./containers/CompletedViolenceService";
import HadSchoolAllowance from "./containers/HadSchoolAllowance";
import { useDispatch, useSelector } from "react-redux";
import { loadBeneficiariesIds } from "@app/store/reducers/report";

const ReportPreview = () => {
  const { state }: any = useLocation();
  const { provinces, districts, initialDate, finalDate } = state; // Read values passed on state

  const responseData = useSelector((state: any) => state.report.agyw);
  const allIds = useSelector((state: any) => state.report.allIds);
  const dispatch = useDispatch();
  let currentProvinceId: any;

  const onChange = () => {
    //console.log(key);
  };

  const title = "Total de Beneficiárias no Indicador AGYW_PREV";

  const handleOnCLick = (total) => {
    dispatch(loadBeneficiariesIds({ ids: allIds, title: title, total: total }));
  };

  return (
    <>
      <p>Data Inicial: {initialDate}</p>
      <p>Data final: {finalDate}</p>
      <Collapse onChange={onChange}>
        {provinces.map((province) => {
          currentProvinceId = province.id;
          return (
            <Panel header={province.name} key={province.id}>
              {(responseData == undefined && (
                <Fragment>Loading...</Fragment>
              )) || (
                <Collapse defaultActiveKey={province.id}>
                  {districts.map((district) => {
                    if (district.province.id === currentProvinceId) {
                      const total =
                        responseData[district.id]["all-disaggregations-total"]
                          .total;
                      const maleTotal =
                        responseData[district.id]["male-beneficiaries"].total;
                      const femaleTotal =
                        responseData[district.id]["female-beneficiaries"].total;
                      const beneficiariesTotal =
                        responseData[district.id]["total-beneficiaries"].total;

                      const beneficiaries =
                        responseData[district.id][
                          "completed-service-not-primary-package"
                        ].beneficiaries;

                      const arrBeneficiaries = Object.keys(beneficiaries).map(
                        (key) => ({
                          key,
                          value: beneficiaries[key],
                        })
                      );

                      return (
                        <Panel header={district.name} key={district.id}>
                          <p>Distrito: {" " + district.name}</p>
                          <p>RESUMO DISTRITAL</p>
                          <p>
                            Total de Adolescentes e Jovens Registados:
                            {" " + beneficiariesTotal}
                          </p>
                          <p>
                            Total de Adolescentes e Jovens do Sexo Feminino:
                            {" " + femaleTotal}
                          </p>
                          <p>
                            Total de Adolescentes e Jovens do Sexo Masculino:
                            {" " + maleTotal}
                          </p>
                          <p>
                            {title}:
                            <Link
                              onClick={() => handleOnCLick(total)}
                              to="/viewAgyw"
                            >
                              {" " + total}
                            </Link>
                          </p>

                          <p>
                            <CompletedOnlyPrimaryPackage
                              districtId={district.id}
                            />
                          </p>
                          <p>
                            <CompletedPrimaryPackageAndSecondaryService
                              districtId={district.id}
                            />
                          </p>
                          <p>
                            <CompletedAtLeastOnePrimaryService
                              districtId={district.id}
                            />
                          </p>
                          <p>
                            <StartedServiceDidNotComplete
                              districtId={district.id}
                            />
                          </p>
                          <p>
                            <CompletedViolenceService
                              districtId={district.id}
                            />
                          </p>
                          <p>
                            <HadSchoolAllowance districtId={district.id} />
                          </p>
                          <p>
                            <CompletedSocialEconomicApproaches
                              districtId={district.id}
                            />
                          </p>
                        </Panel>
                      );
                    }
                  })}
                </Collapse>
              )}
            </Panel>
          );
        })}
      </Collapse>
    </>
  );
};

export default ReportPreview;
